"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMessageText } from "@/i18n/use-message-text";
import { resolveReports } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { REPORT_REASON_LABELS, type ReportGroup } from "@/lib/admin/shared";
import { profilePath } from "@/lib/username";

/** Figma 8:797: reported profile with Descartar / Suspender (admin_resolve_reports). */
export function ReportCard({ group, showDetails = false }: { group: ReportGroup; showDetails?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const text = useMessageText();

  function resolve(action: "dismiss" | "suspend") {
    startTransition(async () => {
      const result = await resolveReports(group.profileId, action);
      if (result.ok) toast.success(action === "suspend" ? `@${group.username} suspendido` : "Reportes descartados");
      else toast.error(text(result.error));
    });
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] bg-surface-2 p-3.5">
      <div className="flex items-center justify-between gap-3 font-bold">
        <a href={profilePath(group.username)} target="_blank" rel="noopener noreferrer" className="truncate text-sm hover:underline">
          {group.displayName?.trim() || group.username}
        </a>
        <span className="shrink-0 text-xs text-gold">
          {group.count} {group.count === 1 ? "reporte" : "reportes"}
        </span>
      </div>
      <p className="text-[13px] font-medium text-muted-foreground">
        {group.reasons.map((r) => REPORT_REASON_LABELS[r] ?? r).join(" · ")}
      </p>
      {showDetails && group.latestDetails && (
        <p className="rounded-sm bg-background/60 px-3 py-2 text-[13px] text-muted-foreground">“{group.latestDetails}”</p>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1 px-3" disabled={isPending} onClick={() => resolve("dismiss")}>
          Descartar
        </Button>
        <Button variant="opal" className="flex-1 px-3" disabled={isPending} onClick={() => resolve("suspend")}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Suspender
        </Button>
      </div>
    </div>
  );
}
