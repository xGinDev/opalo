"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/app/(auth)/actions";
import { changeEmail, changePassword, changeUsername, deleteAccount } from "@/app/panel/actions";
import { useUsernameAvailability } from "@/components/auth/use-username-availability";
import { UsernameField } from "@/components/auth/username-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUsername } from "@/lib/username";
import { PASSWORD_MIN } from "@/lib/validation/auth";
import { PanelCard } from "./editor-ui";
import { usePanel } from "./panel-provider";

const COOLDOWN_DAYS = 14;
const longDate = new Intl.DateTimeFormat("es", { day: "numeric", month: "long" });

function UsernameSection() {
  const { data, setSavedProfile } = usePanel();
  const current = data.profile.username;
  const [value, setValue] = useState(current);
  const [isPending, startTransition] = useTransition();
  const status = useUsernameAvailability(value, current);

  const changedAt = data.profile.username_changed_at ? new Date(data.profile.username_changed_at) : null;
  const nextChange = changedAt ? new Date(changedAt.getTime() + COOLDOWN_DAYS * 86_400_000) : null;
  // eslint-disable-next-line react-hooks/purity -- the cooldown check needs "now"; re-evaluated on each render is fine
  const onCooldown = nextChange !== null && nextChange.getTime() > Date.now();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await changeUsername(value);
      if (result.ok && result.data) {
        setSavedProfile({ username: result.data.username, username_changed_at: new Date().toISOString() });
        setValue(result.data.username);
        toast.success(`Tu enlace ahora es opalo.me/${result.data.username}`);
      } else if (!result.ok) {
        toast.error(result.error);
      }
    });
  }

  return (
    <PanelCard title="Nombre de usuario" description={`Es tu enlace. Puedes cambiarlo una vez cada ${COOLDOWN_DAYS} días.`}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <UsernameField value={value} onChange={setValue} status={status} disabled={onCooldown || isPending} label="Tu enlace" />
        <p className="rounded-md bg-surface-2 px-4 py-3 text-[13px] text-muted-foreground">
          {onCooldown
            ? `Cambiaste tu usuario hace poco. Podrás volver a cambiarlo el ${longDate.format(nextChange!)}.`
            : `Tu enlace anterior queda reservado ${COOLDOWN_DAYS} días y luego cualquiera puede usarlo.`}
        </p>
        <Button
          type="submit"
          variant="opal"
          className="self-start"
          disabled={onCooldown || isPending || status.state !== "available" || normalizeUsername(value) === current}
        >
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Cambiar usuario
        </Button>
      </form>
    </PanelCard>
  );
}

function EmailSection() {
  const { data } = usePanel();
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await changeEmail(email);
      if (result.ok) {
        toast.success("Te enviamos un enlace para confirmar el cambio. Revisa ambos correos.");
        setEmail("");
      } else toast.error(result.error);
    });
  }

  return (
    <PanelCard title="Correo" description={data.email ? `Ahora usas ${data.email}.` : undefined}>
      <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="new-email">Correo nuevo</Label>
          <Input id="new-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending || !email}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Cambiar correo
        </Button>
      </form>
    </PanelCard>
  );
}

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const mismatch = confirm.length > 0 && next !== confirm;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) return;
    startTransition(async () => {
      const result = await changePassword(current, next);
      if (result.ok) {
        toast.success("Contraseña actualizada");
        setCurrent("");
        setNext("");
        setConfirm("");
      } else toast.error(result.error);
    });
  }

  return (
    <PanelCard title="Contraseña">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current-password">Contraseña actual</Label>
          <Input id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="new-password">Contraseña nueva</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={`Mínimo ${PASSWORD_MIN} caracteres`} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Repite la nueva</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} />
            {mismatch && <p className="text-[13px] text-danger">Las contraseñas no coinciden.</p>}
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground">
          ¿Entraste con Google o Discord y no tienes contraseña?{" "}
          <Link href="/recuperar" className="font-bold text-lilac hover:underline">
            Crea una aquí
          </Link>
          .
        </p>
        <Button type="submit" variant="secondary" className="self-start" disabled={isPending || !current || next.length < PASSWORD_MIN || mismatch}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Cambiar contraseña
        </Button>
      </form>
    </PanelCard>
  );
}

function DangerSection() {
  const { data } = usePanel();
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();
  const matches = normalizeUsername(confirmation) === data.profile.username;

  return (
    <PanelCard title="Cuenta" description="Cerrar sesión o borrar tu cuenta para siempre.">
      <div className="flex flex-wrap gap-3">
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            <LogOut aria-hidden /> Cerrar sesión
          </Button>
        </form>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 aria-hidden /> Borrar mi cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>¿Borrar tu cuenta?</DialogTitle>
              <DialogDescription>
                Se borran tu perfil, tus redes, tus archivos y tus estadísticas. No se puede deshacer y tu enlace quedará libre.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="delete-confirm">
                Escribe <strong className="text-foreground">{data.profile.username}</strong> para confirmar
              </Label>
              <Input id="delete-confirm" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" autoCapitalize="none" />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={!matches || isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteAccount(confirmation);
                    if (result && !result.ok) toast.error(result.error);
                  })
                }
              >
                {isPending && <Loader2 className="animate-spin" aria-hidden />}
                Borrar para siempre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PanelCard>
  );
}

/** /panel/ajustes (not in the Figma; uses the panel components). */
export function SettingsForms() {
  return (
    <>
      <UsernameSection />
      <EmailSection />
      <PasswordSection />
      <DangerSection />
    </>
  );
}
