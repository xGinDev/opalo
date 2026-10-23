"use server";

import { revalidatePath } from "next/cache";
import { translateError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeUsername } from "@/lib/username";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/** Every action re-checks the role; the RPCs also check `is_admin()` in the database. */
async function adminSession() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("not_allowed");
  return supabase;
}

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: translateError(error instanceof Error ? error : (error as { message?: string })) };
}

function done(): Result {
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setUserStatus(profileId: string, status: "active" | "suspended", note?: string): Promise<Result> {
  try {
    const supabase = await adminSession();
    const { error } = await supabase.rpc("admin_set_status", { p_profile: profileId, p_status: status, p_note: note });
    return error ? fail(error) : done();
  } catch (error) {
    return fail(error);
  }
}

export async function setUserPlan(profileId: string, plan: "free" | "premium", note?: string): Promise<Result> {
  try {
    const supabase = await adminSession();
    const { error } = await supabase.rpc("admin_set_plan", { p_profile: profileId, p_plan: plan, p_note: note });
    return error ? fail(error) : done();
  } catch (error) {
    return fail(error);
  }
}

export async function resolveReports(profileId: string, action: "dismiss" | "suspend"): Promise<Result> {
  try {
    const supabase = await adminSession();
    const { error } = await supabase.rpc("admin_resolve_reports", { p_profile: profileId, p_action: action });
    return error ? fail(error) : done();
  } catch (error) {
    return fail(error);
  }
}

/** Email lives in auth.users: only readable with the service role. Null if the key isn't configured. */
export async function getUserEmail(profileId: string): Promise<string | null> {
  try {
    await adminSession();
    const { data } = await createAdminClient().auth.admin.getUserById(profileId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

// ── Insignias ──────────────────────────────────────────────────────────────────

export async function createBadge(input: { slug: string; name: string; description: string; icon: string }): Promise<Result> {
  try {
    const supabase = await adminSession();
    const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const name = input.name.trim();
    if (!slug || !name) return { ok: false, error: "Escribe un nombre y un identificador." };
    if (name.length > 40) return { ok: false, error: "El nombre puede tener hasta 40 caracteres." };

    const { error } = await supabase.from("badges").insert({
      slug,
      name,
      description: input.description.trim() || null,
      icon: input.icon || null,
    });
    if (error?.code === "23505") return { ok: false, error: "Ya existe una insignia con ese identificador." };
    return error ? fail(error) : done();
  } catch (error) {
    return fail(error);
  }
}

export async function deleteBadge(badgeId: number): Promise<Result> {
  try {
    const supabase = await adminSession();
    // "premium" is granted and removed by the payment triggers; deleting it would break them.
    const { error } = await supabase.from("badges").delete().eq("id", badgeId).neq("slug", "premium");
    return error ? fail(error) : done();
  } catch (error) {
    return fail(error);
  }
}

export async function assignBadge(username: string, badgeId: number): Promise<Result> {
  try {
    const supabase = await adminSession();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizeUsername(username.replace(/^@/, "")))
      .maybeSingle();
    if (!profile) return { ok: false, error: "No existe ese usuario." };

    const { data: badge } = await supabase.from("badges").select("slug").eq("id", badgeId).maybeSingle();
    if (!badge) return { ok: false, error: "Esa insignia ya no existe." };
    if (badge.slug === "premium") return { ok: false, error: "La insignia Premium se asigna al dar el plan Premium." };

    const { data: claims } = await supabase.auth.getClaims();
    const { error } = await supabase
      .from("profile_badges")
      .insert({ profile_id: profile.id, badge_id: badgeId, granted_by: claims?.claims.sub ?? null });
    if (error?.code === "23505") return { ok: false, error: "Ese usuario ya tiene esta insignia." };
    return error ? fail(error) : done();
  } catch (error) {
    return fail(error);
  }
}

export async function removeBadge(profileId: string, badgeId: number): Promise<Result> {
  try {
    const supabase = await adminSession();
    const { error } = await supabase.from("profile_badges").delete().eq("profile_id", profileId).eq("badge_id", badgeId);
    return error ? fail(error) : done();
  } catch (error) {
    return fail(error);
  }
}
