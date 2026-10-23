import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { AdminCard, FilterPills, Pagination, SearchBox } from "@/components/admin/admin-ui";
import { UsersTable } from "@/components/admin/users-table";
import { Button } from "@/components/ui/button";
import { USER_FILTERS, type UserFilter, listUsers } from "@/lib/admin/queries";
import { ADMIN_PAGE_SIZE, cleanSearch, requireAdmin } from "@/lib/admin/server";

export const metadata = { title: "Usuarios" };

const FILTER_LABELS: Record<UserFilter, string> = { todos: "Todos", premium: "Premium", gratis: "Gratis", reportados: "Reportados" };

type Props = { searchParams: Promise<{ q?: string; filtro?: string; pagina?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = cleanSearch(params.q);
  const filter = (USER_FILTERS as readonly string[]).includes(params.filtro ?? "") ? (params.filtro as UserFilter) : "todos";
  const page = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);

  const { supabase } = await requireAdmin();
  const { rows, total, reportedCount } = await listUsers(supabase, { q, filter, page, pageSize: ADMIN_PAGE_SIZE });

  const href = (next: Partial<{ filtro: string; pagina: number }>) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    const f = next.filtro ?? filter;
    if (f !== "todos") sp.set("filtro", f);
    const p = next.pagina ?? 1;
    if (p > 1) sp.set("pagina", String(p));
    const s = sp.toString();
    return s ? `/admin/usuarios?${s}` : "/admin/usuarios";
  };

  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const shown = rows.length ? `${from + 1}–${from + rows.length}` : "0";
  const exportParams = new URLSearchParams({ filtro: filter, ...(q ? { q } : {}) });

  return (
    <>
      <AdminHeader title="Usuarios" description={q ? `Resultados para “${q}”.` : "Busca, revisa y gestiona cuentas."}>
        <SearchBox defaultValue={q} hidden={filter !== "todos" ? { filtro: filter } : undefined} />
      </AdminHeader>

      <AdminCard
        title={`${new Intl.NumberFormat("es-CO").format(total)} ${total === 1 ? "usuario" : "usuarios"}`}
        className="pb-3"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterPills
              label="Filtrar usuarios"
              items={USER_FILTERS.map((f) => ({
                label: f === "reportados" ? `Reportados (${reportedCount})` : FILTER_LABELS[f],
                href: href({ filtro: f }),
                active: f === filter,
              }))}
            />
            <Button variant="secondary" asChild>
              <a href={`/admin/usuarios/exportar?${exportParams}`}>
                <Download aria-hidden /> Exportar CSV
              </a>
            </Button>
          </div>
        }
      >
        <UsersTable rows={rows} />
        <Pagination
          shown={shown}
          total={total}
          prevHref={page > 1 ? href({ pagina: page - 1 }) : null}
          nextHref={from + rows.length < total ? href({ pagina: page + 1 }) : null}
        />
      </AdminCard>
    </>
  );
}
