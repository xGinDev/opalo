"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_ENTER_TEXT, tabTitleOf } from "@/lib/profile/format";
import { Counter, PanelCard, ToggleRow } from "./editor-ui";
import { FileUploadButton } from "./file-upload-button";
import { usePanel } from "./panel-provider";

const FAVICON_TYPES = ["image/png", "image/webp", "image/gif", "image/jpeg"];

/** Mini browser tab showing how the title and favicon look. */
function TabPreview({ title, faviconUrl }: { title: string; faviconUrl: string | null }) {
  return (
    <div aria-hidden className="flex items-end gap-0 rounded-t-md bg-[#0b0812] px-3 pt-2.5">
      <div className="flex w-[220px] max-w-full items-center gap-2 rounded-t-[10px] bg-surface-2 px-3 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- user upload / static brand asset */}
        <img src={faviconUrl ?? "/brand/gem.svg"} alt="" className="size-4 shrink-0 rounded-[3px] object-cover" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium">{title}</span>
        <X className="size-3 shrink-0 text-muted-foreground" />
      </div>
    </div>
  );
}

/** Browser tab (title, typing animation, favicon) and the "toca para entrar" screen text. */
export function TabAndEntryCard() {
  const { draft, data, updateSettings } = usePanel();
  const s = draft.settings;
  const title = tabTitleOf(s, data.profile.username);

  return (
    <PanelCard title="Pestaña y entrada" description="Cómo se ve tu perfil en la pestaña del navegador y al entrar.">
      <TabPreview title={title} faviconUrl={s.favicon_url} />

      <div className="grid gap-2">
        <Label htmlFor="tab_title">Título de la pestaña</Label>
        <Input
          id="tab_title"
          value={s.tab_title ?? ""}
          onChange={(e) => updateSettings({ tab_title: e.target.value })}
          maxLength={40}
          placeholder={`@${data.profile.username}`}
        />
        <Counter value={s.tab_title} max={40} />
      </div>
      <ToggleRow
        label="Escribirse y borrarse solo"
        description="El título aparece letra por letra y se borra, en bucle."
        checked={s.tab_title_animated}
        onChange={(tab_title_animated) => updateSettings({ tab_title_animated })}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-md bg-surface-2 p-4">
        <div className="flex size-10 items-center justify-center rounded-sm bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element -- user upload / static brand asset */}
          <img src={s.favicon_url ?? "/brand/gem.svg"} alt="Favicon actual" className="size-6 rounded-[4px] object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-sm font-bold">Favicon</p>
          <p className="text-[13px] text-muted-foreground">Imagen cuadrada (PNG, WebP o GIF). Se ve mejor desde 64 × 64 px.</p>
        </div>
        <FileUploadButton
          bucket="avatars"
          name="favicon"
          label={s.favicon_url ? "Cambiar" : "Subir favicon"}
          accept={FAVICON_TYPES}
          onUploaded={(favicon_url) => updateSettings({ favicon_url })}
        />
        {s.favicon_url && (
          <Button variant="ghost" size="sm" onClick={() => updateSettings({ favicon_url: null })}>
            <Trash2 aria-hidden /> Quitar
          </Button>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="enter_text">Texto de entrada</Label>
        <Input
          id="enter_text"
          value={s.enter_text ?? ""}
          onChange={(e) => updateSettings({ enter_text: e.target.value })}
          maxLength={40}
          placeholder={DEFAULT_ENTER_TEXT}
        />
        <Counter value={s.enter_text} max={40} />
      </div>
    </PanelCard>
  );
}
