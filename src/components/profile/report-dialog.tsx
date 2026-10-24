"use client";

import { useState, useTransition } from "react";
import { Flag, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { profilePath } from "@/lib/username";

/** Must match the `reports.reason` check constraint. Labels in Profile.report.reasons. */
const REASONS = ["spam", "ofensivo", "estafa", "suplantacion", "otro"] as const;

const DETAILS_MAX = 500;

type Auth = "unknown" | "signed-in" | "signed-out";

/** Discreet "Reportar perfil" link that opens a dialog and inserts into `reports` (requires a session). */
export function ReportDialog({ profileId, username }: { profileId: string; username: string }) {
  const t = useTranslations("Profile.report");
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState<Auth>("unknown");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      const { data } = await createClient().auth.getUser();
      setAuth(data.user ? "signed-in" : "signed-out");
    }
  }

  function submit() {
    if (!reason) {
      setError(t("chooseReason"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("reports")
        .insert({ reported_profile_id: profileId, reason, details: details.trim() || null });
      if (error) {
        setError(
          error.code === "42501" ? t("ownProfile") : t("failed"),
        );
        return;
      }
      toast.success(t("thanks"));
      setOpen(false);
      setReason("");
      setDetails("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-sm text-[11px] font-semibold text-muted-foreground/80 transition-colors hover:text-foreground"
        >
          <Flag className="size-3" aria-hidden />
          {t("trigger")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title", { username })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {auth === "unknown" && (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("loading")} />
          </div>
        )}

        {auth === "signed-out" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t("signInNeeded")}</p>
            <DialogFooter>
              <Button variant="opal" asChild>
                <Link href={{ pathname: "/login", query: { next: profilePath(username) } }}>{t("signIn")}</Link>
              </Button>
            </DialogFooter>
          </div>
        )}

        {auth === "signed-in" && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="report-reason">{t("reason")}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="report-reason" className="h-12 w-full data-[size=default]:h-12">
                  <SelectValue placeholder={t("reasonPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`reasons.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-details">{t("details")}</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={DETAILS_MAX}
                placeholder={t("detailsPlaceholder")}
                className="min-h-24"
              />
              <p className="text-end text-xs text-muted-foreground tabular-nums">
                {details.length} / {DETAILS_MAX}
              </p>
            </div>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button variant="opal" onClick={submit} disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" aria-hidden />}
                {t("submit")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
