import "server-only";
import { anonClient } from "@/lib/profile/get-public-profile";
import type { Database } from "@/types/database";

export type LeaderboardRow = Database["public"]["Functions"]["get_leaderboard"]["Returns"][number];
export type LeaderboardPeriod = "all" | "month";

export const LEADERBOARD_SIZE = 30;

/** Top profiles by views (all time or this month). Empty when the RPC isn't available yet. */
export async function getLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardRow[]> {
  try {
    const { data, error } = await anonClient().rpc("get_leaderboard", { p_period: period, p_limit: LEADERBOARD_SIZE });
    if (error) {
      // PGRST202: the function doesn't exist yet. Show an empty board instead of failing the page.
      if (error.code === "PGRST202") console.warn("[leaderboard] get_leaderboard no existe: corre la migración 0008_clasificacion_e_iconos.sql");
      else console.error("[leaderboard]", error.message);
      return [];
    }
    return (data ?? []).map((row) => ({ ...row, views: Number(row.views) }));
  } catch (error) {
    console.error("[leaderboard]", error);
    return [];
  }
}
