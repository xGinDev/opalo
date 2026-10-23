import type { NextRequest } from "next/server";
import { USER_FILTERS, type UserFilter, listUsers } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/server";

const BATCH = 1000; // Supabase's default max rows per request
const MAX_ROWS = 20_000;

/** Quotes a CSV cell and neutralizes spreadsheet formulas (=, +, -, @). */
function cell(value: unknown) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** GET /admin/usuarios/exportar?filtro=…&q=… → CSV of the filtered users (admins only, 404 otherwise). */
export async function GET(request: NextRequest) {
  const { supabase } = await requireAdmin();
  const params = request.nextUrl.searchParams;
  const raw = params.get("filtro") ?? "todos";
  const filter = (USER_FILTERS as readonly string[]).includes(raw) ? (raw as UserFilter) : "todos";

  const q = params.get("q") ?? undefined;

  const rows: Awaited<ReturnType<typeof listUsers>>["rows"] = [];
  for (let page = 1; rows.length < MAX_ROWS; page++) {
    const batch = await listUsers(supabase, { q, filter, page, pageSize: BATCH });
    rows.push(...batch.rows);
    if (batch.rows.length < BATCH) break;
  }

  const header = ["usuario", "nombre", "plan", "estado", "rol", "visitas", "reportes_abiertos", "premium_desde", "registrado"];
  const lines = rows.map((r) =>
    [r.username, r.display_name, r.plan, r.status, r.role, r.views, r.openReports, r.premium_since, r.created_at].map(cell).join(","),
  );
  const csv = `﻿${[header.join(","), ...lines].join("\r\n")}\r\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="opalo-usuarios-${filter}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
