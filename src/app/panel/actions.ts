"use server";

import { redirect } from "next/navigation";
import { translateError } from "@/lib/errors";
import type { LinkRow } from "@/lib/panel/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeUsername } from "@/lib/username";
import { PASSWORD_MIN, usernameFormatError } from "@/lib/validation/auth";
import {
  type LinkInput,
  type ProfilePatch,
  type SettingsPatch,
  linkSchema,
  profilePatchSchema,
  settingsPatchSchema,
} from "@/lib/validation/panel";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/** Every action re-checks the session; RLS then limits writes to the user's own rows. */
async function session() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) throw new Error("not_authenticated");
  return { supabase, userId, email: (data.claims.email as string | undefined) ?? null };
}

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof Error && error.message === "not_authenticated") {
    return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  }
  return { ok: false, error: translateError(error as { message?: string; code?: string }) };
}

/** "Guardar cambios": profile text fields and appearance settings in one go. */
export async function saveProfile(input: { profile?: ProfilePatch; settings?: SettingsPatch }): Promise<Result> {
  try {
    const { supabase, userId } = await session();
    const profile = profilePatchSchema.safeParse(input.profile ?? {});
    const settings = settingsPatchSchema.safeParse(input.settings ?? {});
    if (!profile.success) return { ok: false, error: profile.error.issues[0].message };
    if (!settings.success) return { ok: false, error: settings.error.issues[0].message };

    if (Object.keys(profile.data).length) {
      const { error } = await supabase.from("profiles").update(profile.data).eq("id", userId);
      if (error) return fail(error);
    }
    if (Object.keys(settings.data).length) {
      const { error } = await supabase.from("profile_settings").update(settings.data).eq("profile_id", userId);
      if (error) return fail(error);
    }
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setAvatar(avatarUrl: string | null): Promise<Result> {
  try {
    const { supabase, userId } = await session();
    if (avatarUrl && !avatarUrl.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")) {
      return { ok: false, error: "Imagen no válida." };
    }
    const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
    return error ? fail(error) : { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ── Social links (saved instantly, optimistic in the UI) ───────────────────────

export async function addLink(input: LinkInput): Promise<Result<LinkRow>> {
  try {
    const { supabase, userId } = await session();
    const parsed = linkSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const { data: last } = await supabase
      .from("social_links")
      .select("position")
      .eq("profile_id", userId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("social_links")
      .insert({ ...parsed.data, profile_id: userId, position: (last?.position ?? -1) + 1 })
      .select()
      .single();
    return error ? fail(error) : { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function updateLink(id: string, patch: Partial<LinkInput> & { enabled?: boolean }): Promise<Result> {
  try {
    const { supabase, userId } = await session();
    const update: Partial<LinkRow> = {};
    if (patch.platform !== undefined || patch.value !== undefined) {
      const parsed = linkSchema.safeParse({ platform: patch.platform, value: patch.value });
      if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
      Object.assign(update, parsed.data);
    }
    if (patch.enabled !== undefined) update.enabled = patch.enabled;

    const { error } = await supabase.from("social_links").update(update).eq("id", id).eq("profile_id", userId);
    return error ? fail(error) : { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteLink(id: string): Promise<Result> {
  try {
    const { supabase, userId } = await session();
    const { error } = await supabase.from("social_links").delete().eq("id", id).eq("profile_id", userId);
    return error ? fail(error) : { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function reorderLinks(orderedIds: string[]): Promise<Result> {
  try {
    const { supabase, userId } = await session();
    const results = await Promise.all(
      orderedIds.map((id, position) =>
        supabase.from("social_links").update({ position }).eq("id", id).eq("profile_id", userId),
      ),
    );
    const failed = results.find((r) => r.error);
    return failed?.error ? fail(failed.error) : { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ── Ajustes ─────────────────────────────────────────────────────────────────────

export async function changeUsername(raw: string): Promise<Result<{ username: string }>> {
  try {
    const { supabase, userId } = await session();
    const username = normalizeUsername(raw);
    const formatError = usernameFormatError(username);
    if (formatError) return { ok: false, error: formatError };

    const { data: available } = await supabase.rpc("check_username", { p_username: username });
    if (!available) return { ok: false, error: "Ese nombre ya está en uso o reservado." };

    const { error } = await supabase.from("profiles").update({ username }).eq("id", userId);
    return error ? fail(error) : { ok: true, data: { username } };
  } catch (error) {
    return fail(error);
  }
}

export async function changeEmail(email: string): Promise<Result> {
  try {
    const { supabase } = await session();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { ok: false, error: "Escribe un correo válido." };
    const { error } = await supabase.auth.updateUser({ email: value });
    return error ? fail(error) : { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function changePassword(current: string, next: string): Promise<Result> {
  try {
    const { supabase, email } = await session();
    if (next.length < PASSWORD_MIN) return { ok: false, error: `Usa al menos ${PASSWORD_MIN} caracteres.` };
    if (!email) return { ok: false, error: "Tu cuenta no tiene correo; usa Recuperar contraseña." };

    // Confirm the current password before changing it.
    const { error: wrong } = await supabase.auth.signInWithPassword({ email, password: current });
    if (wrong) return { ok: false, error: "La contraseña actual no es correcta." };

    const { error } = await supabase.auth.updateUser({ password: next });
    return error ? fail(error) : { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Deletes the auth user (cascades to profile, settings, links, stats). Requires typing the username. */
export async function deleteAccount(confirmation: string): Promise<Result> {
  let deleted = false;
  try {
    const { supabase, userId } = await session();
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", userId).single();
    if (!profile || normalizeUsername(confirmation) !== profile.username) {
      return { ok: false, error: "Escribe tu nombre de usuario exactamente para confirmar." };
    }

    const admin = createAdminClient();
    for (const bucket of ["avatars", "backgrounds", "music"]) {
      const { data: files } = await admin.storage.from(bucket).list(userId);
      if (files?.length) await admin.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
    }
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return fail(error);

    await supabase.auth.signOut();
    deleted = true;
  } catch (error) {
    console.error("[deleteAccount]", error);
    return { ok: false, error: "No pudimos borrar la cuenta. Escríbenos a soporte@opalo.me." };
  }
  if (deleted) redirect("/?cuenta=borrada");
  return { ok: true };
}
