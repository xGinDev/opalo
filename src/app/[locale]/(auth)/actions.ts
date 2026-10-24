"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { localePrefix } from "@/i18n/routing";
import { PENDING_USERNAME_COOKIE } from "@/lib/auth/constants";
import { requestOrigin, safeNext } from "@/lib/auth/redirect";
import { translateError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { REMEMBER_COOKIE } from "@/lib/supabase/remember";
import { normalizeUsername } from "@/lib/username";
import {
  type LoginInput,
  type NewPasswordInput,
  type RecoverInput,
  type RegisterInput,
  loginSchema,
  newPasswordSchema,
  parseLoginIdentifier,
  recoverSchema,
  registerSchema,
  usernameFormatError,
} from "@/lib/validation/auth";

/** `message` is a translation key (Errors.* / Validation.*), shown with useMessageText. */
export type AuthResult =
  | { status: "error"; message: string; field?: string }
  | { status: "confirm-email"; email: string }
  | { status: "sent" }
  | { status: "ok" };

const YEAR = 60 * 60 * 24 * 365;

function callbackUrl(origin: string, next: string) {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** "/panel" in the visitor's language: "/panel", "/en/panel"… */
async function localized(path: string) {
  return `${localePrefix(await getLocale())}${path}`;
}

/**
 * Email for a login identifier: the email itself, or the account email behind a username.
 * Looked up server-side with the service role; the email never reaches the browser.
 */
async function emailForIdentifier(identifier: string): Promise<string | null | "unavailable"> {
  const parsed = parseLoginIdentifier(identifier);
  if ("email" in parsed) return parsed.email;
  if (usernameFormatError(parsed.username)) return null;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("id").eq("username", parsed.username).maybeSingle();
    if (!profile) return null;
    const { data } = await admin.auth.admin.getUserById(profile.id);
    return data.user?.email ?? null;
  } catch (error) {
    // No SUPABASE_SERVICE_ROLE_KEY: username login can't work, email login still does.
    console.error("[signIn] username lookup failed", error);
    return "unavailable";
  }
}

export async function signIn(input: LoginInput, next?: string): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Errors.checkLogin" };
  const { identifier, password, remember } = parsed.data;

  const email = await emailForIdentifier(identifier);
  if (email === "unavailable") {
    return { status: "error", message: "Errors.emailOnly", field: "identifier" };
  }
  // Unknown username: same message as a wrong password, so nobody can probe which accounts exist.
  if (!email) return { status: "error", message: translateError({ message: "Invalid login credentials" }) };

  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    ...(remember ? { maxAge: YEAR } : {}),
  });

  const supabase = await createClient({ remember });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: translateError(error) };

  redirect(safeNext(next, await localized("/panel")));
}

export async function signUp(input: RegisterInput, next?: string): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { status: "error", message: issue.message, field: String(issue.path[0]) };
  }
  const { username, email, password } = parsed.data;
  const destination = safeNext(next, await localized("/panel"));

  const supabase = await createClient({ remember: true });

  const { data: available, error: checkError } = await supabase.rpc("check_username", { p_username: username });
  if (checkError) return { status: "error", message: translateError(checkError) };
  if (!available) return { status: "error", message: "Errors.usernameUnavailable", field: "username" };

  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: callbackUrl(origin, destination),
    },
  });

  if (error) {
    // The profile trigger raises `username_unavailable` if someone took the name in the meantime.
    if (/database error/i.test(error.message)) {
      return { status: "error", message: "Errors.usernameUnavailable", field: "username" };
    }
    return { status: "error", message: translateError(error) };
  }

  // Supabase hides existing accounts by returning a user without identities.
  if (data.user && data.user.identities?.length === 0) {
    return { status: "error", message: "Errors.userExists", field: "email" };
  }

  if (data.session) redirect(destination);
  return { status: "confirm-email", email };
}

export async function signInWithProvider(
  provider: "google" | "discord",
  next?: string,
  pendingUsername?: string,
): Promise<AuthResult> {
  const supabase = await createClient({ remember: true });
  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_COOKIE, "1", { path: "/", sameSite: "lax", maxAge: YEAR });

  const username = pendingUsername ? normalizeUsername(pendingUsername) : "";
  if (username && !usernameFormatError(username)) {
    const { data: available } = await supabase.rpc("check_username", { p_username: username });
    if (available) {
      cookieStore.set(PENDING_USERNAME_COOKIE, username, {
        path: "/auth/callback",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10,
      });
    }
  }

  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl(origin, safeNext(next, await localized("/panel"))) },
  });
  if (error || !data.url) return { status: "error", message: translateError(error) };

  redirect(data.url);
}

export async function requestPasswordReset(input: RecoverInput): Promise<AuthResult> {
  const parsed = recoverSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Validation.email", field: "email" };

  const supabase = await createClient();
  const origin = await requestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: callbackUrl(origin, await localized("/recuperar/nueva")),
  });

  // Rate limits are worth surfacing; anything else stays generic so we don't reveal which emails exist.
  if (error && /rate/i.test(error.code ?? error.message)) {
    return { status: "error", message: translateError(error) };
  }
  return { status: "sent" };
}

export async function updatePassword(input: NewPasswordInput): Promise<AuthResult> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { status: "error", message: "Errors.linkExpired" };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: translateError(error) };
  return { status: "ok" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(localePrefix(await getLocale()) || "/");
}
