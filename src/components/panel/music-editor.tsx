"use client";

import Link from "next/link";
import { Lock, Music, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Counter, PanelCard, ToggleRow } from "./editor-ui";
import { FileUploadButton } from "./file-upload-button";
import { usePanel } from "./panel-provider";

/** /panel/musica — upload an MP3 and title it (Premium). Not in the Figma; uses the panel components. */
export function MusicEditor() {
  const { draft, updateSettings, isPremium } = usePanel();
  const s = draft.settings;

  if (!isPremium) {
    return (
      <PanelCard title="Tu canción" description="Suena cuando alguien entra a tu perfil.">
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-lilac/14 text-lilac">
            <Lock className="size-5" aria-hidden />
          </span>
          <p className="text-[15px] font-bold">La música es de Premium</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Sube tu canción, ponle título y que suene cuando alguien toque para entrar. 10 USD, un solo pago.
          </p>
          <Button variant="opal" asChild>
            <Link href="/panel/premium">Hazte Premium</Link>
          </Button>
        </div>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Tu canción" description="MP3 de hasta 15 MB. Suena cuando alguien toca para entrar.">
      {s.music_url ? (
        <div className="flex flex-col gap-3 rounded-md bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-opal text-on-accent">
              <Music className="size-5" aria-hidden />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-bold">{s.music_title?.trim() || "Sin título"}</p>
            <Button variant="ghost" size="sm" onClick={() => updateSettings({ music_url: null })}>
              <Trash2 aria-hidden /> Quitar
            </Button>
          </div>
          <audio src={s.music_url} controls preload="none" className="w-full" />
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-muted-foreground">
          Aún no subiste ninguna canción.
        </p>
      )}
      <div>
        <FileUploadButton
          bucket="music"
          name="cancion"
          label={s.music_url ? "Cambiar canción" : "Subir MP3"}
          accept={["audio/mpeg"]}
          onUploaded={(music_url, file) =>
            updateSettings({ music_url, music_title: s.music_title || file.name.replace(/\.[^.]+$/, "").slice(0, 60) })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="music_title">Título</Label>
        <Input
          id="music_title"
          value={s.music_title ?? ""}
          onChange={(e) => updateSettings({ music_title: e.target.value })}
          maxLength={60}
          placeholder="midnight drive"
        />
        <Counter value={s.music_title} max={60} />
      </div>
      <ToggleRow
        label="Mostrar reproductor"
        description="Portada, barra de progreso y controles en tu perfil."
        checked={s.show_player}
        onChange={(show_player) => updateSettings({ show_player })}
      />
    </PanelCard>
  );
}
