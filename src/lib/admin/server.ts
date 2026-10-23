import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin gate for pages and route handlers: 404 for anyone who isn't `role = 'admin'`
 * (so the area isn't discoverable). Reads/writes then go through RLS with the admin's session.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) notFound();

  const { data: me } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role")
    .eq("id", userId)
    .single();
  if (me?.role !== "admin") notFound();

  return { supabase, me };
}

export type AdminOverview = {
  total_users: number;
  premium_users: number;
  new_users: number;
  revenue_usd: number;
  revenue_period: number;
  payments_period: number;
  refunds_period: number;
  total_views: number;
  open_reports: number;
  daily_signups: { day: string; free: number; premium: number }[] | null;
};

export const ADMIN_PAGE_SIZE = 20;

/** "opalo.me/nico", "@nico" or "nico" → "nico"; strips characters that would break PostgREST filters. */
export function cleanSearch(raw: string | undefined) {
  return (raw ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?opalo\.me\//i, "")
    .replace(/^@/, "")
    .replace(/[,()*\\%]/g, "")
    .slice(0, 40);
}
