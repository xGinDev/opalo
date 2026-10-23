"use client";

import { Lock } from "lucide-react";
import { ARRANGEMENTS, type Arrangement } from "@/lib/profile/arrangements";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "./editor-ui";
import { usePanel } from "./panel-provider";

function Sketch({ rows }: { rows: Arrangement["sketch"] }) {
  const left = rows.includes("avatar-row");
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex h-[104px] w-full flex-col justify-center gap-[5px] rounded-[10px] border border-white/10 bg-black/40 px-3",
        left ? "items-start" : "items-center",
        (rows.includes("corners") || rows.includes("corner-left")) && "pb-4",
      )}
    >
      {rows.map((row, i) => {
        switch (row) {
          case "avatar":
            return <span key={i} className="size-[18px] rounded-full bg-opal" />;
          case "avatar-row":
            return (
              <span key={i} className="flex items-center gap-2">
                <span className="size-[22px] shrink-0 rounded-full bg-opal" />
                <span className="flex flex-col gap-[3px]">
                  <span className="h-[5px] w-12 rounded-full bg-white/80" />
                  <span className="h-[3px] w-8 rounded-full bg-lilac/70" />
                  <span className="h-[3px] w-10 rounded-full bg-white/35" />
                </span>
              </span>
            );
          case "name":
            return (
              <span key={i} className="flex items-center gap-1">
                <span className="h-[5px] w-12 rounded-full bg-white/80" />
                {!rows.includes("badges") && <span className="h-[5px] w-3 rounded-full bg-lilac/70" />}
              </span>
            );
          case "badges":
            return <span key={i} className="h-[4px] w-5 rounded-full bg-lilac/70" />;
          case "bio":
            return <span key={i} className="h-[3px] w-10 rounded-full bg-white/35" />;
          case "presence":
            return <span key={i} className="h-[11px] w-[52px] rounded-[4px] border border-white/15 bg-white/8" />;
          case "links":
            return (
              <span key={i} className="flex gap-1">
                {[0, 1, 2, 3].map((d) => (
                  <span key={d} className="size-[6px] rounded-full bg-white/70" />
                ))}
              </span>
            );
          case "corner-left":
            return <span key={i} className="absolute bottom-2 left-2.5 h-[3px] w-4 rounded-full bg-white/55" />;
          case "corners":
            return (
              <span key={i} className="absolute inset-x-2.5 bottom-2 flex justify-between">
                <span className="h-[3px] w-4 rounded-full bg-white/55" />
                <span className="h-[3px] w-5 rounded-full bg-white/35" />
              </span>
            );
        }
      })}
    </span>
  );
}

/** "Distribución": order and placement of the profile's parts (Premium except the default one). */
export function ArrangementPicker() {
  const { draft, updateSettings, isPremium, requirePremium } = usePanel();
  const value = draft.settings.arrangement ?? "default";

  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        Distribución {!isPremium && <PremiumBadge />}
      </p>
      <div role="radiogroup" aria-label="Distribución" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {ARRANGEMENTS.map((a) => {
          const selected = a.id === value;
          const locked = a.premium && !isPremium;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-describedby={`arrangement-${a.id}`}
              onClick={() => (locked ? requirePremium("las distribuciones del perfil") : updateSettings({ arrangement: a.id }))}
              className={cn(
                "flex flex-col gap-2 rounded-[14px] bg-surface-2 p-2.5 text-left transition-colors",
                selected ? "border-[1.5px] border-lilac" : "border border-line hover:border-muted-foreground/40",
              )}
            >
              <Sketch rows={a.sketch} />
              <span className="flex items-center justify-between gap-1.5 px-0.5 text-[13px] font-bold">
                {a.label}
                {locked && <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label="Premium" />}
              </span>
              <span id={`arrangement-${a.id}`} className="px-0.5 text-xs leading-snug text-muted-foreground">
                {a.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
