"use client";

import Link from "next/link";
import { Lock, Music, Trash2, Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { squareWebp } from "@/lib/panel/image";
import { Counter, PanelCard, ToggleRow } from "./editor-ui";
import { FileUploadButton } from "./file-upload-button";
import { usePanel } from "./panel-provider";

function volumeLabel(v: number) {
  if (v === 0) return "Silencio";
  if (v <= 30) return "Pasito";
  if (v <= 70) return "Medio";
  return "Duro";
}

/** /panel/musica — upload an MP3 and title it (Premium). Not in the Figma; uses the panel components. */
export function MusicEditor() {
  const { draft, updateSettings, isPremium } = usePanel();
  const s = draft.settings;
  const volume = s.music_volume ?? 60;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

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
          {/* Same volume visitors will hear, so "Probar" sounds like the profile. */}
          <audio
            ref={(el) => {
              if (el) el.volume = volume / 100;
            }}
            src={s.music_url}
            controls
            preload="none"
            className="w-full"
          />
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
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-surface-2 p-4">
        {s.music_cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- small user upload from Supabase Storage
          <img src={s.music_cover_url} alt="Portada actual" className="size-14 shrink-0 rounded-sm object-cover" />
        ) : (
          <span
            aria-hidden
            className="size-14 shrink-0 rounded-sm"
            style={{ backgroundImage: `linear-gradient(180deg, #f6a8cf, ${s.accent_color} 50%, #8fe3dc)` }}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-bold">Portada</p>
          <p className="text-[13px] text-muted-foreground">Imagen cuadrada (PNG, JPG, WebP o GIF). Sale al lado del título.</p>
        </div>
        <div className="flex gap-2">
          <FileUploadButton
            bucket="avatars"
            name="portada"
            label={s.music_cover_url ? "Cambiar" : "Subir portada"}
            transform={(file) => squareWebp(file, 300)}
            onUploaded={(music_cover_url) => updateSettings({ music_cover_url })}
          />
          {s.music_cover_url && (
            <Button variant="ghost" size="icon" aria-label="Quitar portada" onClick={() => updateSettings({ music_cover_url: null })}>
              <Trash2 aria-hidden />
            </Button>
          )}
        </div>
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
      <div className="grid gap-3 rounded-md bg-surface-2 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <Label id="music-volume" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <VolumeIcon className="size-4" aria-hidden /> Volumen
          </Label>
          <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
            {volumeLabel(volume)} · {volume}%
          </span>
        </div>
        <Slider
          aria-labelledby="music-volume"
          value={[volume]}
          min={0}
          max={100}
          step={5}
          onValueChange={([music_volume]) => updateSettings({ music_volume })}
        />
        <p className="text-[13px] text-muted-foreground">Qué tan fuerte suena para quien entra. Igual pueden silenciarla.</p>
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
