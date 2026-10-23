import type { Enums } from "@/types/database";

/** Client-safe admin constants and types (queries.ts is server-only). */

export const USER_FILTERS = ["todos", "premium", "gratis", "reportados"] as const;
export type UserFilter = (typeof USER_FILTERS)[number];

export type AdminUserRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: Enums<"plan_type">;
  status: Enums<"account_status">;
  role: Enums<"user_role">;
  premium_since: string | null;
  created_at: string;
  views: number;
  openReports: number;
};

export type ReportGroup = {
  profileId: string;
  username: string;
  displayName: string | null;
  status: Enums<"account_status">;
  count: number;
  reasons: string[];
  latestDetails: string | null;
  latestAt: string;
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  ofensivo: "Contenido ofensivo",
  estafa: "Posible estafa",
  suplantacion: "Suplantación de identidad",
  otro: "Otro motivo",
};
