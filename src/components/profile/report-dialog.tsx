"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Flag, Loader2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { profilePath } from "@/lib/username";

/** Must match the `reports.reason` check constraint. */
const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "ofensivo", label: "Contenido ofensivo" },
  { value: "estafa", label: "Estafa o fraude" },
  { value: "suplantacion", label: "Suplantación de identidad" },
  { value: "otro", label: "Otro motivo" },
] as const;

const DETAILS_MAX = 500;

type Auth = "unknown" | "signed-in" | "signed-out";

/** Discreet "Reportar perfil" link that opens a dialog and inserts into `reports` (requires a session). */
export function ReportDialog({ profileId, username }: { profileId: string; username: string }) {
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
      setError("Elige un motivo.");
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
          error.code === "42501"
            ? "No puedes reportar tu propio perfil."
            : "No pudimos enviar el reporte. Inténtalo de nuevo.",
        );
        return;
      }
      toast.success("Gracias. Revisaremos este perfil.");
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
          Reportar perfil
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar a @{username}</DialogTitle>
          <DialogDescription>
            Cuéntanos qué pasa. El equipo de Ópalo revisa todos los reportes.
          </DialogDescription>
        </DialogHeader>

        {auth === "unknown" && (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Cargando" />
          </div>
        )}

        {auth === "signed-out" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Necesitas iniciar sesión para enviar un reporte.</p>
            <DialogFooter>
              <Button variant="opal" asChild>
                <Link href={`/login?next=${encodeURIComponent(profilePath(username))}`}>Iniciar sesión</Link>
              </Button>
            </DialogFooter>
          </div>
        )}

        {auth === "signed-in" && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="report-reason">Motivo</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="report-reason" className="h-12 w-full data-[size=default]:h-12">
                  <SelectValue placeholder="Elige un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-details">Detalles (opcional)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={DETAILS_MAX}
                placeholder="¿Qué viste en este perfil?"
                className="min-h-24"
              />
              <p className="text-right text-xs text-muted-foreground tabular-nums">
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
                Enviar reporte
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
