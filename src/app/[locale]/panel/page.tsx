import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { StatCard } from "@/components/opal/stat-card";
import { InfoCard, LinksCard, QuickAppearanceCard } from "@/components/panel/profile-sections";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel.overview");
  return { title: t("metaTitle") };
}

type Trend = { change: string; trend: "up" | "down" | "neutral" };

/** Figma 7:209 "04 Panel del usuario — Mi perfil". */
export default async function PanelProfilePage() {
  const [t, format] = await Promise.all([getTranslations("Panel.overview"), getFormatter()]);
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub ?? "";
  const [{ data: days }, { data: totals }] = await Promise.all([
    supabase.rpc("get_my_stats", { p_days: 14 }),
    // profile_stats is publicly readable, so always filter by the user.
    supabase.from("profile_stats").select("views, clicks").eq("profile_id", userId).maybeSingle(),
  ]);

  const count = (n: number) => format.number(n);
  function weekTrend(current: number, previous: number): Trend {
    if (current === 0 && previous === 0) return { change: t("noChange"), trend: "neutral" };
    if (previous === 0) return { change: t("plusThisWeek", { count: count(current) }), trend: "up" };
    const pct = Math.round(((current - previous) / previous) * 100);
    return {
      change: t("percentThisWeek", { sign: pct >= 0 ? "+" : "", pct }),
      trend: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
    };
  }

  const series = days ?? [];
  const sum = (from: number, to: number, key: "views" | "clicks") =>
    series.slice(from, to).reduce((acc, d) => acc + Number(d[key]), 0);
  const today = Number(series.at(-1)?.views ?? 0);
  const yesterday = Number(series.at(-2)?.views ?? 0);
  const delta = today - yesterday;

  const views = weekTrend(sum(7, 14, "views"), sum(0, 7, "views"));
  const clicks = weekTrend(sum(7, 14, "clicks"), sum(0, 7, "clicks"));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("totalViews")} value={count(totals?.views ?? 0)} {...views} />
        <StatCard label={t("linkClicks")} value={count(totals?.clicks ?? 0)} {...clicks} />
        <StatCard
          label={t("viewsToday")}
          value={count(today)}
          change={t("sinceYesterday", { sign: delta >= 0 ? "+" : "", count: count(delta) })}
          trend={delta > 0 ? "up" : delta < 0 ? "down" : "neutral"}
        />
      </div>
      <InfoCard />
      <LinksCard />
      <QuickAppearanceCard />
    </>
  );
}
