import { AdminHeader } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/admin-ui";
import { ReportCard } from "@/components/admin/report-card";
import { openReportGroups } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/server";

export const metadata = { title: "Reportes" };

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin();
  const groups = await openReportGroups(supabase, 100);
  const total = groups.reduce((sum, g) => sum + g.count, 0);

  return (
    <>
      <AdminHeader
        title="Reportes"
        description="Perfiles reportados por visitantes. Descartar cierra los reportes; Suspender oculta el perfil."
      />
      <AdminCard
        title={
          groups.length
            ? `${total} ${total === 1 ? "reporte" : "reportes"} en ${groups.length} ${groups.length === 1 ? "perfil" : "perfiles"}`
            : "Sin reportes pendientes"
        }
      >
        {groups.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">Todo en orden. Cuando alguien reporte un perfil, aparecerá aquí.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((g) => (
              <ReportCard key={g.profileId} group={g} showDetails />
            ))}
          </div>
        )}
      </AdminCard>
    </>
  );
}
