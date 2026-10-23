"use client";

import { useState } from "react";
import { Ban, Lock, Wand2 } from "lucide-react";
import { ProfileName } from "@/components/profile/profile-name";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePrefersReducedMotion } from "@/components/profile/hooks";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";
import { PremiumBadge } from "./editor-ui";
import { usePanel } from "./panel-provider";

type NameEffect = { id: string; effect: Enums<"name_fx">; color: string | null; label: string; premium: boolean };

/** Free: none, glow and sparkles in any color. Premium: rainbow, typewriter, blur, scramble (migration 0009). */
export const NAME_EFFECTS: NameEffect[] = [
  { id: "none", effect: "none", color: null, label: "Ninguno", premium: false },
  { id: "glow", effect: "glow", color: null, label: "Brillo", premium: false },
  { id: "typewriter", effect: "typewriter", color: null, label: "Máquina de escribir", premium: true },
  { id: "rainbow", effect: "rainbow", color: null, label: "Arcoíris", premium: true },
  { id: "blur", effect: "blur", color: null, label: "Difuso", premium: true },
  { id: "scramble", effect: "scramble", color: null, label: "Mezclado", premium: true },
  { id: "sparkle", effect: "sparkle", color: null, label: "Destellos blancos", premium: false },
  { id: "sparkle-blue", effect: "sparkle", color: "#5B8CFF", label: "Destellos azules", premium: false },
  { id: "sparkle-green", effect: "sparkle", color: "#5CF08A", label: "Destellos verdes", premium: false },
  { id: "sparkle-pink", effect: "sparkle", color: "#FF6FB5", label: "Destellos rosas", premium: false },
  { id: "sparkle-red", effect: "sparkle", color: "#FF4D5E", label: "Destellos rojos", premium: false },
  { id: "sparkle-yellow", effect: "sparkle", color: "#FFE066", label: "Destellos amarillos", premium: false },
  { id: "sparkle-purple", effect: "sparkle", color: "#B07CFF", label: "Destellos morados", premium: false },
  { id: "sparkle-gold", effect: "sparkle", color: "#F2D49B", label: "Destellos dorados", premium: false },
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
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={option.premium ? `${option.label} (Premium)` : option.label}
      onClick={onSelect}
      className={cn(
        "relative flex h-[92px] items-center justify-center overflow-hidden rounded-[14px] border bg-surface-2 px-2 text-center transition-colors",
        selected ? "border-[1.5px] border-lilac bg-lilac/10" : "border-line hover:border-muted-foreground/40",
      )}
    >
      {locked && (
        <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/80">
          <Lock className="size-3" aria-hidden />
        </span>
      )}
      {option.effect === "none" ? (
        <span className="flex flex-col items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
          <Ban className="size-6" aria-hidden />
          {option.label}
        </span>
      ) : (
        <span aria-hidden className="pointer-events-none">
          <ProfileName
            as="p"
            name={option.effect === "sparkle" ? option.label.replace("Destellos ", "") : option.effect === "typewriter" ? "Máquina" : option.label}
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
      requirePremium(`el efecto “${pick.label}”`);
      return;
    }
    updateSettings({ name_effect: pick.effect, name_fx_color: pick.color });
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[13px] font-semibold text-muted-foreground">Efecto</span>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setPick(current);
          setOpen(next);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            <Wand2 aria-hidden /> {current.label}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[92dvh] gap-5 overflow-y-auto sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Efectos del nombre</DialogTitle>
            <DialogDescription>Toca uno para verlo con tu nombre. Se aplica a tu perfil al guardar los cambios.</DialogDescription>
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
                  {pick.label} {pick.premium && <PremiumBadge />}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {pick.premium
                    ? isPremium
                      ? "Efecto Premium, incluido en tu plan."
                      : "Efecto Premium. Desbloquéalo con un solo pago."
                    : "Efecto gratis."}
                </p>
              </div>
            </div>

            <div role="radiogroup" aria-label="Efectos" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:order-1">
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
              Cancelar
            </Button>
            <Button variant="opal" onClick={apply}>
              {pick.premium && !isPremium ? "Desbloquear" : "Usar este efecto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
