"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { formatTime } from "@/lib/profile/format";
import { cn } from "@/lib/utils";
import type { AudioControls } from "./use-audio";

type MusicPlayerProps = {
  title: string;
  audio: AudioControls;
  accent: string;
  className?: string;
};

/** Figma 9:810 "reproductor": cover, title, seekable progress and prev / pause / next. */
export function MusicPlayer({ title, audio, accent, className }: MusicPlayerProps) {
  const progress = audio.duration ? (audio.current / audio.duration) * 100 : 0;

  return (
    <div className={cn("flex w-full items-center gap-2.5 @3xl:gap-3.5", className)}>
      <span
        aria-hidden
        className="size-12 shrink-0 rounded-sm @3xl:size-14"
        style={{ backgroundImage: `linear-gradient(180deg, #f6a8cf, ${accent} 50%, #8fe3dc)` }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-left">
        <p className="truncate text-[15px] font-bold">{title}</p>
        <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground tabular-nums">
          <span>{formatTime(audio.current)}</span>
          <input
            type="range"
            min={0}
            max={audio.duration || 0}
            step={0.1}
            value={audio.current}
            onChange={(e) => audio.seek(Number(e.target.value))}
            aria-label="Posición de la canción"
            aria-valuetext={`${formatTime(audio.current)} de ${formatTime(audio.duration)}`}
            disabled={!audio.duration}
            className="h-3 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-moz-range-thumb]:size-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-[2px] [&::-moz-range-track]:bg-[image:var(--track)] [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-[2px] [&::-webkit-slider-runnable-track]:bg-[image:var(--track)] [&::-webkit-slider-thumb]:-mt-[3.5px] [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 hover:[&::-webkit-slider-thumb]:opacity-100 focus-visible:[&::-webkit-slider-thumb]:opacity-100"
            style={
              {
                "--track": `linear-gradient(90deg, #fff ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
              } as React.CSSProperties
            }
          />
          <span>{formatTime(audio.duration)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5 @3xl:gap-3.5">
        <button type="button" onClick={audio.restart} aria-label="Anterior" className="rounded-sm p-0.5">
          <SkipBack className="size-4" fill="currentColor" aria-hidden />
        </button>
        <button
          type="button"
          onClick={audio.toggle}
          aria-label={audio.playing ? "Pausar" : "Reproducir"}
          className="rounded-sm p-0.5"
        >
          {audio.playing ? (
            <Pause className="size-[22px]" fill="currentColor" strokeWidth={0} aria-hidden />
          ) : (
            <Play className="size-[22px]" fill="currentColor" strokeWidth={0} aria-hidden />
          )}
        </button>
        <button type="button" onClick={audio.restart} aria-label="Siguiente" className="rounded-sm p-0.5">
          <SkipForward className="size-4" fill="currentColor" aria-hidden />
        </button>
      </div>
    </div>
  );
}
