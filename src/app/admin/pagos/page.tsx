import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { AdminCard, FilterPills, Pagination } from "@/components/admin/admin-ui";
import { UserAvatar } from "@/components/admin/users-table";
import { Tag } from "@/components/opal/tag";
import { formatDate, formatUsd } from "@/lib/admin/format";
import { ADMIN_PAGE_SIZE, requireAdmin } from "@/lib/admin/server";
import { profilePath } from "@/lib/username";
import type { Enums } from "@/types/database";

export const metadata = { title: "Pagos" };

type Status = Enums<"payment_status">;
const FILTERS = ["todos", "paid", "pending", "failed", "refunded"] as const;
const STATUS: Record<Status, { label: string; tone: "success" | "gold" | "danger" | "neutral" }> = {
  paid: { label: "Pagado", tone: "success" },
  pending: { label: "Pendiente", tone: "gold" },
  failed: { label: "Fallido", tone: "danger" },
  refunded: { label: "Reembolsado", tone: "neutral" },
};

type Props = { searchParams: Promise<{ estado?: string; pagina?: string }> };

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = (FILTERS as readonly string[]).includes(params.estado ?? "") ? (params.estado as (typeof FILTERS)[number]) : "todos";
  const page = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const from = (page - 1) * ADMIN_PAGE_SIZE;

  const { supabase } = await requireAdmin();
  let query = supabase
    .from("payments")
    .select(
      "id, provider, provider_payment_id, amount_cents, currency, status, created_at, paid_at, refunded_at, profile:profiles!payments_profile_id_fkey(username, display_name, avatar_url)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });
  if (filter !== "todos") query = query.eq("status", filter);
  const { data, count, error } = await query.range(from, from + ADMIN_PAGE_SIZE - 1);
  if (error) console.error("[admin/pagos]", error.message);

  const payments = data ?? [];
  const total = count ?? 0;
  const href = (next: Partial<{ estado: string; pagina: number }>) => {
    const sp = new URLSearchParams();
    const e = next.estado ?? filter;
    if (e !== "todos") sp.set("estado", e);
    if ((next.pagina ?? 1) > 1) sp.set("pagina", String(next.pagina));
    const s = sp.toString();
    return s ? `/admin/pagos?${s}` : "/admin/pagos";
  };

  return (
    <>
      <AdminHeader title="Pagos" description="Compras de Premium (pago único) registradas por la pasarela." />

      <AdminCard
        title={`${new Intl.NumberFormat("es-CO").format(total)} ${total === 1 ? "pago" : "pagos"}`}
        className="pb-3"
        action={
          <FilterPills
            label="Filtrar por estado"
            items={FILTERS.map((f) => ({
              label: f === "todos" ? "Todos" : STATUS[f].label,
              href: href({ estado: f }),
              active: f === filter,
            }))}
          />
        }
      >
        {payments.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">No hay pagos con ese estado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-line text-xs font-semibold text-muted-foreground">
                  <th className="px-2 py-2.5 font-semibold">Usuario</th>
                  <th className="w-[120px] px-2 py-2.5 font-semibold">Monto</th>
                  <th className="w-[130px] px-2 py-2.5 font-semibold">Estado</th>
                  <th className="w-[130px] px-2 py-2.5 font-semibold">Fecha</th>
                  <th className="w-[200px] px-2 py-2.5 font-semibold">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const profile = (Array.isArray(p.profile) ? p.profile[0] : p.profile) as {
                    username: string;
                    display_name: string | null;
                    avatar_url: string | null;
                  } | null;
                  const status = STATUS[p.status];
                  return (
                    <tr key={p.id} className="border-b border-line last:border-b-0">
                      <td className="px-2 py-3">
                        {profile ? (
                          <Link href={profilePath(profile.username)} target="_blank" className="flex items-center gap-3 rounded-sm">
                            <UserAvatar user={profile} size={32} />
                            <span className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate text-sm font-bold">{profile.display_name?.trim() || profile.username}</span>
                              <span className="truncate text-xs font-medium text-muted-foreground">@{profile.username}</span>
                            </span>
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">Cuenta eliminada</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-sm font-bold tabular-nums">
                        {p.currency.toUpperCase() === "USD" ? formatUsd(p.amount_cents / 100) : `${(p.amount_cents / 100).toLocaleString("es-CO")} ${p.currency.toUpperCase()}`}
                      </td>
                      <td className="px-2 py-3">
                        <Tag tone={status.tone} size="sm">
                          {status.label}
                        </Tag>
                      </td>
                      <td className="px-2 py-3 text-sm font-medium text-muted-foreground">
                        {formatDate(p.refunded_at ?? p.paid_at ?? p.created_at)}
                      </td>
                      <td className="px-2 py-3">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold capitalize">{p.provider}</span>
                          <code className="block max-w-[200px] truncate text-xs text-muted-foreground" title={p.provider_payment_id}>
                            {p.provider_payment_id}
                          </code>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          shown={payments.length ? `${from + 1}–${from + payments.length}` : "0"}
          total={total}
          prevHref={page > 1 ? href({ pagina: page - 1 }) : null}
          nextHref={from + payments.length < total ? href({ pagina: page + 1 }) : null}
        />
      </AdminCard>
    </>
  );
}
