import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";
import { cleanSearch } from "./server";
import type { AdminUserRow, ReportGroup, UserFilter } from "./shared";

export { REPORT_REASON_LABELS, USER_FILTERS, type AdminUserRow, type ReportGroup, type UserFilter } from "./shared";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Profiles with at least one open report (the "Reportados" filter) and how many each has. */
export async function openReportCounts(supabase: Supabase) {
  const { data } = await supabase.from("reports").select("reported_profile_id").eq("status", "open").limit(5000);
  const counts = new Map<string, number>();
  for (const r of data ?? []) counts.set(r.reported_profile_id, (counts.get(r.reported_profile_id) ?? 0) + 1);
  return counts;
}

export async function listUsers(
  supabase: Supabase,
  { q, filter = "todos", page = 1, pageSize = 20 }: { q?: string; filter?: UserFilter; page?: number; pageSize?: number },
) {
  const reports = await openReportCounts(supabase);

  let query = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, plan, status, role, premium_since, created_at, profile_stats(views)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  const search = cleanSearch(q);
  if (search) query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
  if (filter === "premium") query = query.eq("plan", "premium");
  if (filter === "gratis") query = query.eq("plan", "free");
  if (filter === "reportados") {
    const ids = [...reports.keys()];
    query = ids.length ? query.in("id", ids) : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(from, from + pageSize - 1);
  if (error) console.error("[admin/listUsers]", error.message);

  const rows: AdminUserRow[] = (data ?? []).map((p) => {
    const stats = p.profile_stats as { views: number } | { views: number }[] | null;
    const views = Array.isArray(stats) ? (stats[0]?.views ?? 0) : (stats?.views ?? 0);
    return {
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      plan: p.plan,
      status: p.status,
      role: p.role,
      premium_since: p.premium_since,
      created_at: p.created_at,
      views: Number(views),
      openReports: reports.get(p.id) ?? 0,
    };
  });

  return { rows, total: count ?? 0, reportedCount: reports.size };
}

/** Open reports grouped by reported profile, most reported first. */
export async function openReportGroups(supabase: Supabase, limit = 50): Promise<ReportGroup[]> {
  const { data } = await supabase
    .from("reports")
    .select("reported_profile_id, reason, details, created_at, profile:profiles!reports_reported_profile_id_fkey(username, display_name, status)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1000);

  const groups = new Map<string, ReportGroup>();
  for (const r of data ?? []) {
    const profile = (Array.isArray(r.profile) ? r.profile[0] : r.profile) as { username: string; display_name: string | null; status: Enums<"account_status"> } | null;
    if (!profile) continue;
    const g = groups.get(r.reported_profile_id) ?? {
      profileId: r.reported_profile_id,
      username: profile.username,
      displayName: profile.display_name,
      status: profile.status,
      count: 0,
      reasons: [],
      latestDetails: r.details,
      latestAt: r.created_at,
    };
    g.count += 1;
    if (!g.reasons.includes(r.reason)) g.reasons.push(r.reason);
    groups.set(r.reported_profile_id, g);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || b.latestAt.localeCompare(a.latestAt)).slice(0, limit);
}
