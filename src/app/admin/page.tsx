import Link from "next/link";
import { Bell, Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { AdminCard, FilterPills, Pagination, SearchBox } from "@/components/admin/admin-ui";
import { ReportCard } from "@/components/admin/report-card";
import { SignupsChart } from "@/components/admin/signups-chart";
import { UserAvatar, UsersTable } from "@/components/admin/users-table";
import { StatCard } from "@/components/opal/stat-card";
import { Button } from "@/components/ui/button";
import { formatCompact, formatUsd, requestTime, timeAgo } from "@/lib/admin/format";
import { USER_FILTERS, type UserFilter, listUsers, openReportGroups } from "@/lib/admin/queries";
import { type AdminOverview, requireAdmin } from "@/lib/admin/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Resumen" };

const PERIODS = [7, 30, 90] as const;
const FILTER_LABELS: Record<UserFilter, string> = { todos: "Todos", premium: "Premium", gratis: "Gratis", reportados: "Reportados" };

type Props = { searchParams: Promise<{ dias?: string; filtro?: string }> };

/** Figma 8:353 "05 Panel de administración — Resumen". */
export default async function AdminOverviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const days = PERIODS.find((p) => String(p) === params.dias) ?? 30;
  const filter = (USER_FILTERS as readonly string[]).includes(params.filtro ?? "") ? (params.filtro as UserFilter) : "todos";
  const now = requestTime();
  const since = new Date(now - days * 86_400_000).toISOString();

  const { supabase } = await requireAdmin();
  const [{ data: overviewJson }, users, { data: payments }, reportGroups, { count: viewsPeriod }] = await Promise.all([
    supabase.rpc("admin_overview", { p_days: days }),
    listUsers(supabase, { filter, page: 1, pageSize: 6 }),
    supabase
      .from("payments")
      .select("id, paid_at, created_at, amount_cents, profile:profiles!payments_profile_id_fkey(username, display_name, avatar_url)")
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(4),
    openReportGroups(supabase, 2),
    supabase.from("profile_views").select("id", { count: "exact", head: true }).gte("viewed_at", since),
  ]);

  const o = (overviewJson ?? {}) as Partial<AdminOverview>;
  const total = o.total_users ?? 0;
  const premium = o.premium_users ?? 0;
  const newUsers = o.new_users ?? 0;
  const growth = total - newUsers > 0 ? (newUsers / (total - newUsers)) * 100 : newUsers > 0 ? 100 : 0;
  const conversion = total ? (premium / total) * 100 : 0;
  const pct = (n: number) => `${n.toLocaleString("es", { maximumFractionDigits: 1 })}%`;
  const period = `en ${days} días`;
  const href = (next: Partial<{ dias: number; filtro: string }>) => {
    const sp = new URLSearchParams({ dias: String(next.dias ?? days), filtro: next.filtro ?? filter });
    return `/admin?${sp}`;
  };

  return (
    <>
      <AdminHeader title="Resumen" description={`Cómo va Ópalo en los últimos ${days} días.`}>
        <SearchBox />
        <FilterPills
          label="Periodo"
          items={PERIODS.map((p) => ({ label: `${p} días`, href: href({ dias: p }), active: p === days }))}
        />
        <Button variant="secondary" size="icon" asChild>
          <Link href="/admin/reportes" aria-label={`Reportes pendientes: ${o.open_reports ?? 0}`} className="relative">
            <Bell className="size-[18px]" />
            {(o.open_reports ?? 0) > 0 && <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-gold" aria-hidden />}
          </Link>
        </Button>
      </AdminHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuarios totales" value={formatCompact(total)} change={`+${pct(growth)} ${period}`} trend={newUsers ? "up" : "neutral"} />
        <StatCard label="Usuarios Premium" value={formatCompact(premium)} change={`+${o.payments_period ?? 0} ${period}`} trend={o.payments_period ? "up" : "neutral"} />
        <StatCard label="Ingresos totales" value={formatUsd(o.revenue_usd ?? 0)} change={`+${formatUsd(o.revenue_period ?? 0)} ${period}`} trend={o.revenue_period ? "up" : "neutral"} />
        <StatCard label="Visitas a perfiles" value={formatCompact(o.total_views ?? 0)} change={`+${formatCompact(viewsPeriod ?? 0)} ${period}`} trend={viewsPeriod ? "up" : "neutral"} />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminCard title="Nuevos registros" description="Por día, separados por plan.">
          <SignupsChart data={o.daily_signups ?? []} />
        </AdminCard>
        <AdminCard title="Conversión a Premium" description="Usuarios que pagaron alguna vez.">
          <p className="text-opal font-display text-[56px] leading-none font-extrabold tracking-[-0.03em]">{pct(conversion)}</p>
          <div className="h-2.5 w-full overflow-hidden rounded-[5px] bg-surface-2" role="img" aria-label={`Conversión ${pct(conversion)}`}>
            <div className="h-full rounded-[5px] bg-opal" style={{ width: `${Math.min(100, conversion)}%` }} />
          </div>
          <dl className="text-sm">
            {[
              ["Pagos en el periodo", String(o.payments_period ?? 0)],
              ["Ingreso promedio por día", formatUsd((o.revenue_period ?? 0) / days)],
              ["Reembolsos", String(o.refunds_period ?? 0)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-t border-line py-2.5">
                <dt className="font-medium text-muted-foreground">{label}</dt>
                <dd className="font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminCard
          title="Usuarios"
          className="pb-3"
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterPills
                label="Filtrar usuarios"
                items={USER_FILTERS.map((f) => ({
                  label: f === "reportados" ? `Reportados (${users.reportedCount})` : FILTER_LABELS[f],
                  href: href({ filtro: f }),
                  active: f === filter,
                }))}
              />
              <Button variant="secondary" asChild>
                <a href={`/admin/usuarios/exportar?filtro=${filter}`}>
                  <Download aria-hidden /> Exportar CSV
                </a>
              </Button>
            </div>
          }
        >
          <UsersTable rows={users.rows} />
          <Pagination
            shown={String(users.rows.length)}
            total={users.total}
            prevHref={null}
            nextHref={users.total > users.rows.length ? `/admin/usuarios?filtro=${filter}` : null}
          />
        </AdminCard>

        <div className="flex flex-col gap-4">
          <AdminCard title="Pagos recientes" description="Premium, pago único de 10 USD.">
            {(payments ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay pagos.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {(payments ?? []).map((p) => {
                  const profile = (Array.isArray(p.profile) ? p.profile[0] : p.profile) as { username: string; display_name: string | null; avatar_url: string | null } | null;
                  return (
                    <li key={p.id} className="flex items-center gap-3">
                      <UserAvatar user={{ avatar_url: profile?.avatar_url ?? null }} size={32} />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-sm font-bold">{profile?.display_name?.trim() || profile?.username || "—"}</p>
                        <p className="text-xs font-medium text-muted-foreground">{timeAgo(p.paid_at ?? p.created_at, now)}</p>
                      </div>
                      <p className="text-sm font-bold text-success tabular-nums">+{formatUsd(p.amount_cents / 100)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminCard>
          <AdminCard
            title="Reportes pendientes"
            description="Revisa y decide qué hacer."
            action={
              reportGroups.length > 0 ? (
                <Link href="/admin/reportes" className={cn("text-[13px] font-bold text-lilac hover:underline")}>
                  Ver todos
                </Link>
              ) : undefined
            }
          >
            {reportGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay reportes pendientes. 🎉</p>
            ) : (
              reportGroups.map((g) => <ReportCard key={g.profileId} group={g} />)
            )}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
