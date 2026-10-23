import { AdminHeader } from "@/components/admin/admin-shell";
import { BadgeManager, type AdminBadge } from "@/components/admin/badge-manager";
import { requireAdmin } from "@/lib/admin/server";

export const metadata = { title: "Insignias" };

export default async function AdminBadgesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: badges }, { data: grants }] = await Promise.all([
    supabase.from("badges").select("id, slug, name, description, icon").order("id"),
    supabase
      .from("profile_badges")
      .select("badge_id, granted_at, profile:profiles!profile_badges_profile_id_fkey(id, username, display_name, avatar_url)")
      .order("granted_at", { ascending: false })
      .limit(1000),
  ]);

  const list: AdminBadge[] = (badges ?? []).map((b) => ({
    ...b,
    holders: (grants ?? [])
      .filter((g) => g.badge_id === b.id)
      .map((g) => (Array.isArray(g.profile) ? g.profile[0] : g.profile))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)),
  }));

  return (
    <>
      <AdminHeader title="Insignias" description="Crea insignias y asígnalas a perfiles. La de Premium se asigna sola al pagar." />
      <BadgeManager badges={list} />
    </>
  );
}
