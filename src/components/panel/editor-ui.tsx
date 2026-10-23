"use client";

import { useId } from "react";
import { Check, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/opal/tag";
import { cn } from "@/lib/utils";
import { usePanel } from "./panel-provider";

/** Figma 7:333 card: surface, 20px radius, title 17 bold + muted description. */
export function PanelCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="font-sans text-[17px] font-bold">
            {title}
          </h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PremiumBadge() {
  return (
    <Tag size="sm" className="gap-1">
      <Lock className="size-3" aria-hidden /> Premium
    </Tag>
  );
}

export type Choice<T extends string> = { value: T; label: string; premium?: boolean };

/**
 * Figma 7:474 chips. Premium options stay visible with a lock; picking one as a free user
 * opens the upsell instead of changing the value.
 */
export function ChoiceChips<T extends string>({
  label,
  value,
  options,
  onChange,
  premiumFeature,
}: {
  label: string;
  value: T;
  options: Choice<T>[];
  onChange: (value: T) => void;
  premiumFeature?: string;
}) {
  const { isPremium, requirePremium } = usePanel();
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[13px] font-semibold text-muted-foreground">{label}</span>
      {options.map((o) => {
        const selected = o.value === value;
        const locked = o.premium && !isPremium;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => (locked ? requirePremium(premiumFeature ?? o.label) : onChange(o.value))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-[7px] text-[13px] font-bold transition-colors",
              selected
                ? "border-lilac bg-lilac/16 text-lilac"
                : "border-line bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {locked && <Lock className="size-3" aria-label="Premium" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Figma 7:457: "Tarjeta" / "Centrado" picker with mini previews. */
export function LayoutPicker({ value, onChange }: { value: "card" | "center"; onChange: (v: "card" | "center") => void }) {
  const options = [
    { value: "card" as const, label: "Tarjeta", shape: "left-[20%] top-[24%] h-[52%] w-[60%] rounded-[6px]" },
    { value: "center" as const, label: "Centrado", shape: "left-1/2 top-[21%] size-10 -translate-x-1/2 rounded-full" },
  ];
  return (
    <div role="radiogroup" aria-label="Estilo" className="grid grid-cols-2 gap-3">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex flex-col gap-2.5 rounded-[14px] bg-surface-2 p-3.5 text-left transition-colors",
              selected ? "border-[1.5px] border-lilac" : "border border-line hover:border-muted-foreground/40",
            )}
          >
            <span className="relative h-[70px] w-full overflow-hidden rounded-sm bg-background">
              <span className={cn("absolute bg-lilac/35", o.shape)} />
            </span>
            <span className="text-sm font-bold">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Figma 7:466 accent swatches plus a custom color. */
export function AccentPicker({ value, swatches, onChange }: { value: string; swatches: string[]; onChange: (v: string) => void }) {
  const isCustom = !swatches.some((s) => s.toLowerCase() === value.toLowerCase());
  return (
    <div role="radiogroup" aria-label="Color de acento" className="flex flex-wrap items-center gap-2.5">
      <span className="text-[13px] font-semibold text-muted-foreground">Color de acento</span>
      {swatches.map((color) => {
        const selected = color.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              "flex size-[26px] items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition",
              selected && "ring-2 ring-white",
            )}
            style={{ backgroundColor: color }}
          >
            {selected && <Check className="size-3.5 text-on-accent" strokeWidth={3} aria-hidden />}
          </button>
        );
      })}
      <label
        className={cn(
          "relative flex size-[26px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(#f6a8cf,#b9a7ff,#8fe3dc,#f2d49b,#ff6b7a,#f6a8cf)] ring-offset-2 ring-offset-surface",
          isCustom && "ring-2 ring-white",
        )}
        title="Otro color"
      >
        <span className="sr-only">Otro color</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

/** Label + description + switch. Premium rows show a lock and open the upsell. */
export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  premium,
  premiumFeature,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  premium?: boolean;
  premiumFeature?: string;
}) {
  const id = useId();
  const { isPremium, requirePremium } = usePanel();
  const locked = premium && !isPremium;
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-surface-2 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Label htmlFor={id} className="text-sm font-bold text-foreground">
          {label}
          {locked && <PremiumBadge />}
        </Label>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(v) => (locked ? requirePremium(premiumFeature ?? label.toLowerCase()) : onChange(v))}
      />
    </div>
  );
}

/** Character counter shown under text fields. */
export function Counter({ value, max }: { value: string | null | undefined; max: number }) {
  return (
    <p className="text-right text-xs font-medium text-muted-foreground tabular-nums">
      {(value ?? "").length} / {max}
    </p>
  );
}
