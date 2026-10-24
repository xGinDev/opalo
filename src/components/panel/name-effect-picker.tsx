"use client";

import { useState } from "react";
import { Ban, Lock, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfileName } from "@/components/profile/profile-name";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePrefersReducedMotion } from "@/components/profile/hooks";
import { messageKey } from "@/i18n/message-key";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";
import { PremiumBadge } from "./editor-ui";
import { usePanel } from "./panel-provider";

/** Labels live in Panel.effects.items.<id>. */
type NameEffect = { id: string; effect: Enums<"name_fx">; color: string | null; premium: boolean };

/** Free: none, glow and sparkles in any color. Premium: rainbow, typewriter, blur, scramble (migration 0009). */
export const NAME_EFFECTS: NameEffect[] = [
  { id: "none", effect: "none", color: null, premium: false },
  { id: "glow", effect: "glow", color: null, premium: false },
  { id: "typewriter", effect: "typewriter", color: null, premium: true },
  { id: "rainbow", effect: "rainbow", color: null, premium: true },
  { id: "blur", effect: "blur", color: null, premium: true },
  { id: "scramble", effect: "scramble", color: null, premium: true },
  { id: "sparkle", effect: "sparkle", color: null, premium: false },
  { id: "sparkle-blue", effect: "sparkle", color: "#5B8CFF", premium: false },
  { id: "sparkle-green", effect: "sparkle", color: "#5CF08A", premium: false },
  { id: "sparkle-pink", effect: "sparkle", color: "#FF6FB5", premium: false },
  { id: "sparkle-red", effect: "sparkle", color: "#FF4D5E", premium: false },
  { id: "sparkle-yellow", effect: "sparkle", color: "#FFE066", premium: false },
  { id: "sparkle-purple", effect: "sparkle", color: "#B07CFF", premium: false },
  { id: "sparkle-gold", effect: "sparkle", color: "#F2D49B", premium: false },
];

export function findNameEffect(effect: Enums<"name_fx">, color: string | null) {
  if (effect !== "sparkle") return NAME_EFFECTS.find((e) => e.effect === effect) ?? NAME_EFFECTS[1];
  return (
    NAME_EFFECTS.find((e) => e.effect === "sparkle" && e.color?.toLowerCase() === color?.toLowerCase()) ??
    NAME_EFFECTS.find((e) => e.id === "sparkle")!
  );
}

function Tile({ option, selected, locked, onSelect, still }: { option: NameEffect; selected: boolean; locked: boolean; onSelect: () => void; still: boolean }) {
  const { draft } = usePanel();
  const t = useTranslations("Panel.effects");
  const label = t(`items.${option.id}`);
  const tileName =
    option.effect === "sparkle" ? t(`short.${option.id}`) : option.effect === "typewriter" ? t("typewriterShort") : label;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={option.premium ? t("premiumSuffix", { name: label }) : label}
      onClick={onSelect}
      className={cn(
        "relative flex h-[92px] items-center justify-center overflow-hidden rounded-[14px] border bg-surface-2 px-2 text-center transition-colors",
        selected ? "border-[1.5px] border-lilac bg-lilac/10" : "border-line hover:border-muted-foreground/40",
      )}
    >
      {locked && (
        <span className="absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/80">
          <Lock className="size-3" aria-hidden />
        </span>
      )}
      {option.effect === "none" ? (
        <span className="flex flex-col items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
          <Ban className="size-6" aria-hidden />
          {label}
        </span>
      ) : (
        <span aria-hidden className="pointer-events-none">
          <ProfileName
            as="p"
            name={tileName}
            font={draft.settings.name_font}
            effect={option.effect}
            sparkleColor={option.color}
            accent={draft.settings.accent_color}
            still={still}
            className="text-[15px] leading-tight"
          />
        </span>
      )}
    </button>
  );
}

/** "Efectos del nombre": tile grid with live previews, a big preview with the user's name, and plan info. */
export function NameEffectPicker() {
  const t = useTranslations("Panel.effects");
  const { data, draft, updateSettings, isPremium, requirePremium } = usePanel();
  const s = draft.settings;
  const current = findNameEffect(s.name_effect, s.name_fx_color ?? null);
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(current);
  const reducedMotion = usePrefersReducedMotion();
  const name = draft.profile.display_name?.trim() || data.profile.username;

  function apply() {
    if (pick.premium && !isPremium) {
      setOpen(false);
      requirePremium(messageKey("Panel.premiumFeatures.effect", { name: t(`items.${pick.id}`) }));
      return;
    }
    updateSettings({ name_effect: pick.effect, name_fx_color: pick.color });
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-[13px] font-semibold text-muted-foreground">{t("label")}</span>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setPick(current);
          setOpen(next);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            <Wand2 aria-hidden /> {t(`items.${current.id}`)}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[92dvh] gap-5 overflow-y-auto sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogDescription")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="flex flex-col gap-3 md:order-2">
              <div className="flex h-[140px] items-center justify-center overflow-hidden rounded-[14px] border border-line bg-[#0b0812] px-4">
                <ProfileName
                  as="p"
                  name={name}
                  font={s.name_font}
                  effect={pick.effect}
                  sparkleColor={pick.color}
                  accent={s.accent_color}
                  still={reducedMotion}
                  className="max-w-full text-[28px]"
                />
              </div>
              <div className="flex flex-col gap-1 rounded-[14px] bg-surface-2 p-4">
                <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
                  {t(`items.${pick.id}`)} {pick.premium && <PremiumBadge />}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {pick.premium
                    ? isPremium
                      ? t("premiumIncluded")
                      : t("premiumLocked")
                    : t("free")}
                </p>
              </div>
            </div>

            <div role="radiogroup" aria-label={t("group")} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:order-1">
              {NAME_EFFECTS.map((option) => (
                <Tile
                  key={option.id}
                  option={option}
                  selected={option.id === pick.id}
                  locked={option.premium && !isPremium}
                  onSelect={() => setPick(option)}
                  still={reducedMotion}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="opal" onClick={apply}>
              {pick.premium && !isPremium ? t("unlock") : t("use")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
