"use client";

import { useId, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Ellipsis, GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addLink, deleteLink, reorderLinks, updateLink } from "@/app/panel/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LinkRow } from "@/lib/panel/types";
import { platformMeta } from "@/lib/profile/links";
import { linkSchema } from "@/lib/validation/panel";
import { cn } from "@/lib/utils";
import { usePanel } from "./panel-provider";
import { PlatformPicker } from "./platform-picker";

const FREE_LINK_LIMIT = 6;

type EditorState = { mode: "add" } | { mode: "edit"; link: LinkRow } | null;

function LinkEditor({ state, onClose }: { state: EditorState; onClose: () => void }) {
  const { setLinks } = usePanel();
  const editing = state?.mode === "edit" ? state.link : null;
  const [platform, setPlatform] = useState<string>(editing?.platform ?? "instagram");
  const [value, setValue] = useState(editing?.value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = linkSchema.safeParse({ platform, value });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    startTransition(async () => {
      if (editing) {
        const before = editing;
        setLinks((links) => links.map((l) => (l.id === before.id ? { ...l, ...parsed.data } : l)));
        onClose();
        const result = await updateLink(before.id, parsed.data);
        if (result.ok) toast.success("Red actualizada");
        else {
          setLinks((links) => links.map((l) => (l.id === before.id ? before : l)));
          toast.error(result.error);
        }
      } else {
        const result = await addLink(parsed.data);
        if (result.ok && result.data) {
          const created = result.data;
          setLinks((links) => [...links, created]);
          toast.success(`${platformMeta(created.platform).label} añadido`);
          onClose();
        } else if (!result.ok) {
          setError(result.error);
        }
      }
    });
  }

  return (
    <Dialog open={state !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar red" : "Añadir red"}</DialogTitle>
            <DialogDescription>Escribe tu usuario o pega el enlace completo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Red</Label>
            <PlatformPicker
              value={platform}
              onChange={(v) => {
                setPlatform(v);
                setError(null);
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link-value">
              {platformMeta(platform).label} · {platform === "email" ? "correo" : platformMeta(platform).copy ? "usuario o ID (se copia al tocarlo)" : "usuario o enlace"}
            </Label>
            <Input
              id="link-value"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null); }}
              placeholder={platformMeta(platform).placeholder}
              maxLength={300}
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(error)}
            />
            {error && <p className="text-[13px] text-danger">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="opal" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" aria-hidden />}
              {editing ? "Guardar" : "Añadir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Figma 7:355 row: grip · icon · name/value · switch · menu. */
function LinkRowItem({ link, onEdit }: { link: LinkRow; onEdit: (l: LinkRow) => void }) {
  const { links, setLinks } = usePanel();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const meta = platformMeta(link.platform);
  const Icon = meta.icon;

  async function toggle(enabled: boolean) {
    setLinks((links) => links.map((l) => (l.id === link.id ? { ...l, enabled } : l)));
    const result = await updateLink(link.id, { enabled });
    if (!result.ok) {
      setLinks((links) => links.map((l) => (l.id === link.id ? { ...l, enabled: !enabled } : l)));
      toast.error(result.error);
    }
  }

  async function remove() {
    const previous = links;
    setLinks((current) => current.filter((l) => l.id !== link.id));
    const result = await deleteLink(link.id);
    if (result.ok) toast.success(`${meta.label} eliminado`);
    else {
      setLinks(() => previous);
      toast.error(result.error);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3.5 rounded-md bg-surface-2 py-2.5 pr-3.5 pl-2.5",
        isDragging && "relative z-10 shadow-lg ring-1 ring-lilac/50",
        !link.enabled && "opacity-60",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded-sm text-muted-foreground active:cursor-grabbing"
        aria-label={`Mover ${meta.label}`}
      >
        <GripVertical className="size-[18px]" aria-hidden />
      </button>
      <span className="rounded-[10px] bg-lilac/14 p-2 text-lilac">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-bold">{meta.label}</p>
        <p className="truncate text-[13px] font-medium text-muted-foreground">{link.value}</p>
      </div>
      <Switch checked={link.enabled} onCheckedChange={toggle} aria-label={`Mostrar ${meta.label}`} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Opciones de ${meta.label}`}>
            <Ellipsis className="size-[18px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(link)}>
            <Pencil /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={remove}>
            <Trash2 /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

/** Figma 7:350 "Redes": sortable list, toggles, edit/delete and the free-plan limit. */
export function LinksManager() {
  const { links, setLinks, isPremium, requirePremium } = usePanel();
  const [editor, setEditor] = useState<EditorState>(null);
  const dndId = useId(); // stable ids for dnd-kit's aria attributes across SSR and hydration
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const sorted = [...links].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
  const atLimit = !isPremium && links.length >= FREE_LINK_LIMIT;

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = sorted.findIndex((l) => l.id === active.id);
    const to = sorted.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(sorted, from, to).map((l, position) => ({ ...l, position }));
    const previous = links;
    setLinks(() => reordered);
    const result = await reorderLinks(reordered.map((l) => l.id));
    if (!result.ok) {
      setLinks(() => previous);
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-line px-4 py-8 text-center">
          <p className="text-sm font-bold">Aún no tienes redes</p>
          <p className="text-[13px] text-muted-foreground">Añade tu Instagram, Discord, sitio web o cualquier enlace.</p>
        </div>
      ) : (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sorted.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {sorted.map((link) => (
                <LinkRowItem key={link.id} link={link} onEdit={(l) => setEditor({ mode: "edit", link: l })} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => (atLimit ? requirePremium("redes ilimitadas") : setEditor({ mode: "add" }))}
      >
        <Plus aria-hidden /> Añadir red
      </Button>
      {!isPremium && (
        <p className="-mt-2 text-center text-[13px] text-muted-foreground">
          {links.length} de {FREE_LINK_LIMIT} redes en el plan Gratis ·{" "}
          <Link href="/panel/premium" className="font-bold text-lilac hover:underline">
            ilimitadas con Premium
          </Link>
        </p>
      )}

      {editor && <LinkEditor key={editor.mode === "edit" ? editor.link.id : "new"} state={editor} onClose={() => setEditor(null)} />}
    </div>
  );
}
