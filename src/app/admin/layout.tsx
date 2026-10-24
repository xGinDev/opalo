import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { RootDocument } from "@/components/root-document";
import { requireAdmin } from "@/lib/admin/server";

export const metadata: Metadata = { title: { template: "%s · Admin · Ópalo", default: "Admin" }, robots: { index: false } };

/** /admin (its own root layout, Spanish only): only `role = 'admin'` gets in; everyone else sees a 404. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, me } = await requireAdmin();
  const { count } = await supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open");

  return (
    <RootDocument locale="es">
      <AdminShell admin={me} openReports={count ?? 0}>
        {children}
      </AdminShell>
    </RootDocument>
  );
}
