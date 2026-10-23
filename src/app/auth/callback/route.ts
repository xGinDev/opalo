import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { PENDING_USERNAME_COOKIE } from "@/lib/auth/constants";
import { requestOrigin, safeNext } from "@/lib/auth/redirect";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Usernames the profile trigger generates when sign-up metadata has none (OAuth). */
const GENERATED_USERNAME = /^user_[0-9a-f]{10}$/;
const NEW_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

/**
 * OAuth (Google, Discord) and PKCE email links (confirmation, password recovery) land here
 * with `?code=`; we exchange it for a session and continue to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = await requestOrigin();
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await applyPendingUsername(data.user);
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback]", error.code, error.message);
  }

  const reason = searchParams.get("error_code") ?? "auth";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
}

/**
 * When someone picks a username on /registro and then continues with Google or Discord,
 * swap the generated `user_xxxxxxxxxx` for the chosen name. Only for accounts created just now.
 */
async function applyPendingUsername(user: User) {
  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_USERNAME_COOKIE)?.value;
  if (!pending) return;
  cookieStore.delete({ name: PENDING_USERNAME_COOKIE, path: "/auth/callback" });

  if (Date.now() - new Date(user.created_at).getTime() > NEW_ACCOUNT_WINDOW_MS) return;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("username").eq("id", user.id).single();
    if (!profile || !GENERATED_USERNAME.test(profile.username)) return;

    const { error } = await admin.from("profiles").update({ username: pending }).eq("id", user.id);
    if (error) return; // taken in the meantime: they can change it later from Ajustes

    // The rename trigger starts the 14-day cooldown and holds the old name; neither applies here.
    await admin.from("profiles").update({ username_changed_at: null }).eq("id", user.id);
    await admin.from("username_history").delete().eq("username", profile.username);
  } catch (error) {
    console.error("[auth/callback] could not apply pending username", error);
  }
}
