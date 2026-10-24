"use client";

import { Lock, Music, Trash2, Volume1, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Link } from "@/i18n/navigation";
import { squareWebp } from "@/lib/panel/image";
import { Counter, PanelCard, ToggleRow } from "./editor-ui";
import { FileUploadButton } from "./file-upload-button";
import { usePanel } from "./panel-provider";

/** Key under Panel.music.volumeLevels. */
function volumeLevel(v: number) {
  if (v === 0) return "silent";
  if (v <= 30) return "low";
  if (v <= 70) return "medium";
  return "loud";
}

/** /panel/musica — upload an MP3 and title it (Premium). Not in the Figma; uses the panel components. */
export function MusicEditor() {
  const t = useTranslations("Panel.music");
  const { draft, updateSettings, isPremium } = usePanel();
  const s = draft.settings;
  const volume = s.music_volume ?? 60;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  if (!isPremium) {
    return (
      <PanelCard title="Panel.music.title" description="Panel.music.lockedDescription">
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-lilac/14 text-lilac">
            <Lock className="size-5" aria-hidden />
          </span>
          <p className="text-[15px] font-bold">{t("lockedTitle")}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t("lockedBody")}</p>
          <Button variant="opal" asChild>
            <Link href="/panel/premium">{t("getPremium")}</Link>
          </Button>
        </div>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Panel.music.title" description="Panel.music.description">
      {s.music_url ? (
        <div className="flex flex-col gap-3 rounded-md bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-opal text-on-accent">
              <Music className="size-5" aria-hidden />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-bold">{s.music_title?.trim() || t("untitled")}</p>
            <Button variant="ghost" size="sm" onClick={() => updateSettings({ music_url: null })}>
              <Trash2 aria-hidden /> {t("remove")}
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
          {t("empty")}
        </p>
      )}
      <div>
        <FileUploadButton
          bucket="music"
          name="cancion"
          label={s.music_url ? t("change") : t("upload")}
          accept={["audio/mpeg"]}
          onUploaded={(music_url, file) =>
            updateSettings({ music_url, music_title: s.music_title || file.name.replace(/\.[^.]+$/, "").slice(0, 60) })
          }
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-surface-2 p-4">
        {s.music_cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- small user upload from Supabase Storage
          <img src={s.music_cover_url} alt={t("coverAlt")} className="size-14 shrink-0 rounded-sm object-cover" />
        ) : (
          <span
            aria-hidden
            className="size-14 shrink-0 rounded-sm"
            style={{ backgroundImage: `linear-gradient(180deg, #f6a8cf, ${s.accent_color} 50%, #8fe3dc)` }}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-bold">{t("cover")}</p>
          <p className="text-[13px] text-muted-foreground">{t("coverHint")}</p>
        </div>
        <div className="flex gap-2">
          <FileUploadButton
            bucket="avatars"
            name="portada"
            label={s.music_cover_url ? t("coverChange") : t("coverUpload")}
            transform={(file) => squareWebp(file, 300)}
            onUploaded={(music_cover_url) => updateSettings({ music_cover_url })}
          />
          {s.music_cover_url && (
            <Button variant="ghost" size="icon" aria-label={t("coverRemove")} onClick={() => updateSettings({ music_cover_url: null })}>
              <Trash2 aria-hidden />
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="music_title">{t("titleLabel")}</Label>
        <Input
          id="music_title"
          value={s.music_title ?? ""}
          onChange={(e) => updateSettings({ music_title: e.target.value })}
          maxLength={60}
          placeholder={t("titlePlaceholder")}
        />
        <Counter value={s.music_title} max={60} />
      </div>
      <div className="grid gap-3 rounded-md bg-surface-2 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <Label id="music-volume" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <VolumeIcon className="size-4" aria-hidden /> {t("volume")}
          </Label>
          <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
            {t(`volumeLevels.${volumeLevel(volume)}`)} · {volume}%
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
        <p className="text-[13px] text-muted-foreground">{t("volumeHint")}</p>
      </div>
      <ToggleRow
        label="Panel.music.showPlayer"
        description="Panel.music.showPlayerDescription"
        checked={s.show_player}
        onChange={(show_player) => updateSettings({ show_player })}
      />
    </PanelCard>
  );
}
