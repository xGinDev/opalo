"use client";

import { useState, useTransition } from "react";
import { Award, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useMessageText } from "@/i18n/use-message-text";
import { assignBadge, createBadge, deleteBadge, removeBadge } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/admin-ui";
import { UserAvatar } from "@/components/admin/users-table";
import { BADGE_ICONS } from "@/components/profile/profile-badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profilePath } from "@/lib/username";
import { cn } from "@/lib/utils";

export type AdminBadge = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  holders: { id: string; username: string; display_name: string | null; avatar_url: string | null }[];
};

const ICON_LABELS: Record<string, string> = { gem: "Gema", crown: "Corona", zap: "Rayo", check: "Verificado", shield: "Escudo" };
const DEFAULT_ICON = "default";

function BadgeIcon({ icon, className }: { icon: string | null; className?: string }) {
  const { icon: Icon, color } = BADGE_ICONS[icon ?? ""] ?? { icon: Award, color: "text-gold" };
  return <Icon className={cn("size-[18px] shrink-0", color, className)} aria-hidden />;
}

function IconSelect({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(BADGE_ICONS).map((key) => (
          <SelectItem key={key} value={key}>
            <BadgeIcon icon={key} /> {ICON_LABELS[key] ?? key}
          </SelectItem>
        ))}
        <SelectItem value={DEFAULT_ICON}>
          <BadgeIcon icon={null} /> Medalla
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function useAction() {
  const [isPending, startTransition] = useTransition();
  const text = useMessageText();
  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string, after?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        after?.();
      } else toast.error(text(result.error ?? "Errors.generic"));
    });
  }
  return [isPending, run] as const;
}

function CreateBadgeCard() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("gem");
  const [isPending, run] = useAction();

  const autoSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <AdminCard title="Nueva insignia" description="Aparece junto al nombre en el perfil público.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => createBadge({ name, slug: slug || autoSlug, description, icon: icon === DEFAULT_ICON ? "" : icon }),
            `Insignia “${name.trim()}” creada`,
            () => {
              setName("");
              setSlug("");
              setDescription("");
            },
          );
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="badge-name">Nombre</Label>
          <Input id="badge-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Creador destacado" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="badge-slug">Identificador</Label>
          <Input id="badge-slug" value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={40} placeholder={autoSlug || "creador-destacado"} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="badge-description">Descripción (opcional)</Label>
          <Input id="badge-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="badge-icon">Icono</Label>
          <IconSelect id="badge-icon" value={icon} onChange={setIcon} />
        </div>
        <Button type="submit" variant="opal" disabled={isPending || !name.trim()}>
          {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
          Crear insignia
        </Button>
      </form>
    </AdminCard>
  );
}

function AssignBadgeCard({ badges }: { badges: AdminBadge[] }) {
  const [username, setUsername] = useState("");
  const [badgeId, setBadgeId] = useState(String(badges.find((b) => b.slug !== "premium")?.id ?? ""));
  const [isPending, run] = useAction();
  const assignable = badges.filter((b) => b.slug !== "premium");

  return (
    <AdminCard title="Asignar insignia" description="Escribe el usuario tal como aparece en su enlace.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const badge = badges.find((b) => String(b.id) === badgeId);
          run(() => assignBadge(username, Number(badgeId)), `“${badge?.name}” asignada a @${username.replace(/^@/, "")}`, () => setUsername(""));
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="assign-username">Usuario</Label>
          <Input
            id="assign-username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^(https?:\/\/)?(www\.)?opalo\.me\//i, ""))}
            placeholder="@usuario"
            autoComplete="off"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="assign-badge">Insignia</Label>
          <Select value={badgeId} onValueChange={setBadgeId}>
            <SelectTrigger id="assign-badge" className="w-full">
              <SelectValue placeholder="Elige una insignia" />
            </SelectTrigger>
            <SelectContent>
              {assignable.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  <BadgeIcon icon={b.icon} /> {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="secondary" disabled={isPending || !username.trim() || !badgeId}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Asignar
        </Button>
      </form>
    </AdminCard>
  );
}

function BadgeRow({ badge }: { badge: AdminBadge }) {
  const [isPending, run] = useAction();
  const auto = badge.slug === "premium";

  return (
    <li className="flex flex-col gap-3 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
          <BadgeIcon icon={badge.icon} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-bold">
            {badge.name} <span className="font-medium text-muted-foreground">· {badge.slug}</span>
          </p>
          <p className="text-[13px] text-muted-foreground">
            {badge.description || "Sin descripción"} · {badge.holders.length} {badge.holders.length === 1 ? "perfil" : "perfiles"}
            {auto && " · automática"}
          </p>
        </div>
        {!auto && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Eliminar insignia ${badge.name}`}
            disabled={isPending}
            onClick={() => {
              if (!window.confirm(`¿Eliminar “${badge.name}”? Se quitará de ${badge.holders.length} perfiles.`)) return;
              run(() => deleteBadge(badge.id), "Insignia eliminada");
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      {badge.holders.length > 0 && (
        <ul className="flex flex-wrap gap-2 pl-12">
          {badge.holders.slice(0, 30).map((h) => (
            <li key={h.id} className="flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pr-1 pl-1">
              <UserAvatar user={h} size={20} />
              <a href={profilePath(h.username)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold hover:underline">
                @{h.username}
              </a>
              {auto ? (
                <span className="w-1" />
              ) : (
                <button
                  type="button"
                  aria-label={`Quitar ${badge.name} a @${h.username}`}
                  disabled={isPending}
                  onClick={() => run(() => removeBadge(h.id, badge.id), `Insignia quitada a @${h.username}`)}
                  className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </li>
          ))}
          {badge.holders.length > 30 && <li className="self-center text-xs text-muted-foreground">y {badge.holders.length - 30} más</li>}
        </ul>
      )}
    </li>
  );
}

/** Admin badge management: create, assign by username, remove (Figma doesn't detail this screen). */
export function BadgeManager({ badges }: { badges: AdminBadge[] }) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <AdminCard title="Insignias" description="La de Premium la gestionan los pagos: no se asigna ni se quita a mano.">
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay insignias.</p>
        ) : (
          <ul className="flex flex-col">
            {badges.map((b) => (
              <BadgeRow key={b.id} badge={b} />
            ))}
          </ul>
        )}
      </AdminCard>
      <div className="flex flex-col gap-4">
        <AssignBadgeCard badges={badges} />
        <CreateBadgeCard />
      </div>
    </div>
  );
}
