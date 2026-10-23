"use client";

import { useEffect, useState, useTransition } from "react";
import { Ellipsis, ExternalLink, Gem, Loader2, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getUserEmail, setUserPlan, setUserStatus } from "@/app/admin/actions";
import { Tag } from "@/components/opal/tag";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDate } from "@/lib/admin/format";
import type { AdminUserRow } from "@/lib/admin/shared";
import { formatCount } from "@/lib/profile/format";
import { profilePath, profileUrl } from "@/lib/username";
import { cn } from "@/lib/utils";

const STATUS = {
  active: { label: "Activo", dot: "bg-success", text: "text-success" },
  reported: { label: "Reportado", dot: "bg-gold", text: "text-gold" },
  suspended: { label: "Suspendido", dot: "bg-danger", text: "text-danger" },
} as const;

export function StatusLabel({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return (
    <span className={cn("flex items-center gap-[7px] text-sm font-semibold", s.text)}>
      <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

export function UserAvatar({ user, size = 36 }: { user: Pick<AdminUserRow, "avatar_url">; size?: number }) {
  return user.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element -- user upload from Supabase Storage
    <img src={user.avatar_url} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span aria-hidden className="shrink-0 rounded-full bg-opal" style={{ width: size, height: size }} />
  );
}

function UserSheet({ user, onClose }: { user: AdminUserRow | null; onClose: () => void }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getUserEmail(user.id).then((e) => !cancelled && setEmail(e));
    return () => {
      cancelled = true;
      setEmail(undefined);
    };
  }, [user]);

  if (!user) return null;
  const suspended = user.status === "suspended";
  const premium = user.plan === "premium";

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        onClose();
      } else toast.error(result.error);
    });
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[min(420px,100vw)] gap-0 border-line bg-background sm:max-w-[420px]">
        <SheetHeader className="border-b border-line">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size={52} />
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg">{user.display_name?.trim() || user.username}</SheetTitle>
              <SheetDescription className="truncate">{profileUrl(user.username).replace("https://", "")}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Plan</dt>
            <dd className="mt-1">{premium ? <Tag>Premium</Tag> : <Tag tone="neutral">Gratis</Tag>}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Estado</dt>
            <dd className="mt-1">
              <StatusLabel status={user.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Visitas</dt>
            <dd className="mt-1 font-bold tabular-nums">{formatCount(user.views)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Reportes abiertos</dt>
            <dd className={cn("mt-1 font-bold tabular-nums", user.openReports > 0 && "text-gold")}>{user.openReports}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Registro</dt>
            <dd className="mt-1">{formatDate(user.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Premium desde</dt>
            <dd className="mt-1">{user.premium_since ? formatDate(user.premium_since) : "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold text-muted-foreground">Correo</dt>
            <dd className="mt-1 break-all">
              {email === undefined ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Cargando" />
              ) : (
                (email ?? <span className="text-muted-foreground">No disponible (falta la service_role key)</span>)
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-col gap-2 border-t border-line p-4">
          <Button variant="secondary" asChild>
            <a href={profilePath(user.username)} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden /> Ver perfil
            </a>
          </Button>
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={() =>
              run(() => setUserPlan(user.id, premium ? "free" : "premium"), premium ? "Premium retirado" : "Premium activado")
            }
          >
            <Gem aria-hidden /> {premium ? "Quitar Premium" : "Dar Premium"}
          </Button>
          {user.role !== "admin" && (
            <Button
              variant={suspended ? "opal" : "destructive"}
              disabled={isPending}
              onClick={() =>
                run(() => setUserStatus(user.id, suspended ? "active" : "suspended"), suspended ? "Cuenta reactivada" : "Cuenta suspendida")
              }
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden /> : suspended ? <ShieldCheck aria-hidden /> : <ShieldBan aria-hidden />}
              {suspended ? "Reactivar cuenta" : "Suspender cuenta"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Figma 8:586 "Usuarios" table; ⋯ opens a detail sheet with actions. */
export function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [selected, setSelected] = useState<AdminUserRow | null>(null);

  if (rows.length === 0) {
    return <p className="px-2 py-10 text-center text-sm text-muted-foreground">No hay usuarios que coincidan.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-line text-xs font-semibold text-muted-foreground">
              <th className="px-2 py-2.5 font-semibold">Usuario</th>
              <th className="w-[110px] px-2 py-2.5 font-semibold">Plan</th>
              <th className="w-[100px] px-2 py-2.5 font-semibold">Visitas</th>
              <th className="w-[120px] px-2 py-2.5 font-semibold">Registro</th>
              <th className="w-[120px] px-2 py-2.5 font-semibold">Estado</th>
              <th className="w-[40px] px-2 py-2.5">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-b border-line last:border-b-0">
                <td className="px-2 py-3">
                  <button type="button" onClick={() => setSelected(user)} className="flex items-center gap-3 rounded-sm text-left">
                    <UserAvatar user={user} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-bold">{user.display_name?.trim() || user.username}</span>
                      <span className="truncate text-xs font-medium text-muted-foreground">
                        {profileUrl(user.username).replace("https://", "")}
                      </span>
                    </span>
                  </button>
                </td>
                <td className="px-2 py-3">{user.plan === "premium" ? <Tag>Premium</Tag> : <Tag tone="neutral" className="border border-line">Gratis</Tag>}</td>
                <td className="px-2 py-3 text-sm font-semibold tabular-nums">{formatCount(user.views)}</td>
                <td className="px-2 py-3 text-sm font-medium text-muted-foreground">{formatDate(user.created_at)}</td>
                <td className="px-2 py-3">
                  <StatusLabel status={user.status} />
                </td>
                <td className="px-2 py-3 text-right">
                  <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${user.username}`} onClick={() => setSelected(user)}>
                    <Ellipsis className="size-[18px]" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UserSheet user={selected} onClose={() => setSelected(null)} />
    </>
  );
}
