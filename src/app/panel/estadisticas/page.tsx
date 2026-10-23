import Link from "next/link";
import { Lock } from "lucide-react";
import { StatCard } from "@/components/opal/stat-card";
import { PanelCard } from "@/components/panel/editor-ui";
import { DailyChart, NetworkChart } from "@/components/panel/stats-charts";
import { formatCount } from "@/lib/profile/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Estadísticas" };

const RANGES = [7, 30, 90] as const;
/** Free accounts see the last 7 days; longer ranges are part of "Estadísticas detalladas" (Premium). */
const FREE_RANGE = 7;

type Props = { searchParams: Promise<{ dias?: string }> };

export default async function StatsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub ?? "";
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userId).single();
  const isPremium = profile?.plan === "premium";

  const requested = Number((await searchParams).dias);
  let days: number = RANGES.includes(requested as (typeof RANGES)[number]) ? requested : FREE_RANGE;
  if (!isPremium) days = FREE_RANGE;

  const [{ data: daily }, { data: networks }] = await Promise.all([
    supabase.rpc("get_my_stats", { p_days: days }),
    supabase.rpc("get_my_link_stats", { p_days: days }),
  ]);

  const series = (daily ?? []).map((d) => ({ day: d.day, views: Number(d.views), clicks: Number(d.clicks) }));
  const totalViews = series.reduce((a, d) => a + d.views, 0);
  const totalClicks = series.reduce((a, d) => a + d.clicks, 0);
  const ctr = totalViews ? Math.round((totalClicks / totalViews) * 100) : 0;

  return (
    <>
      <nav aria-label="Periodo" className="flex w-fit gap-1 rounded-md bg-surface p-1">
        {RANGES.map((r) => {
          const locked = !isPremium && r !== FREE_RANGE;
          const active = r === days;
          return (
            <Link
              key={r}
              href={locked ? "/panel/premium" : `/panel/estadisticas?dias=${r}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-sm font-bold transition-colors",
                active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {locked && <Lock className="size-3.5" aria-label="Premium" />}
              {r} días
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={`Visitas (${days} días)`} value={formatCount(totalViews)} />
        <StatCard label={`Clics en redes (${days} días)`} value={formatCount(totalClicks)} />
        <StatCard label="Clics por visita" value={`${ctr}%`} />
      </div>

      <PanelCard title="Visitas y clics por día" description="Cada persona cuenta una vez cada 30 minutos.">
        <DailyChart data={series} />
      </PanelCard>

      <PanelCard title="Clics por red" description={`Últimos ${days} días.`}>
        <NetworkChart data={(networks ?? []).map((n) => ({ platform: n.platform, clicks: Number(n.clicks) }))} />
      </PanelCard>

      {!isPremium && (
        <p className="text-sm text-muted-foreground">
          ¿Quieres ver 30 y 90 días?{" "}
          <Link href="/panel/premium" className="font-bold text-lilac hover:underline">
            Las estadísticas detalladas son de Premium
          </Link>
          .
        </p>
      )}
    </>
  );
}
