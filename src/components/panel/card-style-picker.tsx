"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { CARD_STYLES, type CardStyle } from "@/lib/profile/card-styles";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "./editor-ui";
import { usePanel } from "./panel-provider";

/** Card designs with a live mini mock of each one (same CSS classes as the profile). */
export function CardStylePicker() {
  const t = useTranslations("Panel.cardStyles");
  const { draft, updateSettings, isPremium, requirePremium } = usePanel();
  const s = draft.settings;
  const value = s.card_style ?? "classic";
  const opacity = Math.max(s.card_opacity, 0.35);
  const vars = { "--accent": s.accent_color, "--card-bg": `rgba(0,0,0,${opacity})`, "--card-alpha": opacity } as React.CSSProperties;

  function choose(id: CardStyle, premium: boolean) {
    if (premium && !isPremium) return requirePremium("Panel.premiumFeatures.cardStyles");
    updateSettings({ card_style: id });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        {t("label")} {!isPremium && <PremiumBadge />}
      </p>
      <div role="radiogroup" aria-label={t("label")} className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {CARD_STYLES.map((style) => {
          const selected = style.id === value;
          const locked = style.premium && !isPremium;
          return (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={selected}
              title={t(`${style.id}.description`)}
              onClick={() => choose(style.id, style.premium)}
              className={cn(
                "flex flex-col gap-2 rounded-[14px] bg-surface-2 p-2.5 text-start transition-colors",
                selected ? "border-[1.5px] border-lilac" : "border border-line hover:border-muted-foreground/40",
              )}
            >
              <span
                aria-hidden
                className="relative flex h-[86px] w-full items-end justify-center overflow-hidden rounded-[10px] px-3 pb-2.5"
                style={{
                  backgroundColor: s.bg_color ?? "#0b0812",
                  backgroundImage: `radial-gradient(60% 80% at 20% 10%, ${s.accent_color}55, transparent), radial-gradient(50% 70% at 90% 90%, #8fe3dc33, transparent)`,
                }}
              >
                <span
                  className={cn(
                    "relative isolate flex h-[54px] w-full flex-col items-center justify-end gap-1 pb-2",
                    style.id === "classic" ? "rounded-[10px] border border-white/12 bg-[var(--card-bg)]" : style.className,
                    "rounded-[10px]",
                    style.id === "retro" && "shadow-[3px_3px_0_var(--accent)]",
                  )}
                  style={vars}
                >
                  <span
                    className={cn(
                      "absolute left-1/2 size-[22px] -translate-x-1/2 rounded-full bg-opal ring-2 ring-white/20",
                      style.id === "floating" ? "-top-[11px]" : "top-1.5",
                    )}
                  />
                  <span className="h-1 w-10 rounded-full bg-white/70" />
                  <span className="h-1 w-6 rounded-full bg-white/35" />
                </span>
              </span>
              <span className="flex items-center justify-between gap-1.5 px-0.5 text-[13px] font-bold">
                {t(`${style.id}.label`)}
                {locked && <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label="Premium" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
