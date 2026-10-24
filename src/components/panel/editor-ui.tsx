"use client";

import { useId } from "react";
import { Check, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/opal/tag";
import { useMessageText } from "@/i18n/use-message-text";
import { cn } from "@/lib/utils";
import { usePanel } from "./panel-provider";

// Text props (titles, labels, descriptions) may be message keys; they're translated here.

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
  const text = useMessageText();
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="font-sans text-[17px] font-bold">
            {text(title)}
          </h2>
          {description && <p className="text-sm text-muted-foreground">{text(description)}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PremiumBadge() {
  const t = useTranslations("Common");
  return (
    <Tag size="sm" className="gap-1">
      <Lock className="size-3" aria-hidden /> {t("premium")}
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
  const text = useMessageText();
  return (
    <div role="radiogroup" aria-label={text(label)} className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-[13px] font-semibold text-muted-foreground">{text(label)}</span>
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
            {locked && <Lock className="size-3" aria-label={text("Common.premium")} />}
            {text(o.label)}
          </button>
        );
      })}
    </div>
  );
}

/** Figma 7:457: "Tarjeta" / "Centrado" picker with mini previews. */
export function LayoutPicker({ value, onChange }: { value: "card" | "center"; onChange: (v: "card" | "center") => void }) {
  const t = useTranslations("Panel.layout");
  const options = [
    { value: "card" as const, label: t("card"), shape: "left-[20%] top-[24%] h-[52%] w-[60%] rounded-[6px]" },
    { value: "center" as const, label: t("center"), shape: "left-1/2 top-[21%] size-10 -translate-x-1/2 rounded-full" },
  ];
  return (
    <div role="radiogroup" aria-label={t("label")} className="grid grid-cols-2 gap-3">
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
              "flex flex-col gap-2.5 rounded-[14px] bg-surface-2 p-3.5 text-start transition-colors",
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

/** Relative luminance check, so the check mark stays visible on light and dark swatches. */
function isLight(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/** Figma 7:466 swatches plus a custom color (accent, and the solid background color). */
export function AccentPicker({
  value,
  swatches,
  onChange,
  label = "Panel.accent",
}: {
  value: string;
  swatches: string[];
  onChange: (v: string) => void;
  label?: string;
}) {
  const isCustom = !swatches.some((s) => s.toLowerCase() === value.toLowerCase());
  const text = useMessageText();
  return (
    <div role="radiogroup" aria-label={text(label)} className="flex flex-wrap items-center gap-2.5">
      <span className="text-[13px] font-semibold text-muted-foreground">{text(label)}</span>
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
              "flex size-[26px] items-center justify-center rounded-full border border-white/15 ring-offset-2 ring-offset-surface transition",
              selected && "ring-2 ring-white",
            )}
            style={{ backgroundColor: color }}
          >
            {selected && <Check className={cn("size-3.5", isLight(color) ? "text-on-accent" : "text-white")} strokeWidth={3} aria-hidden />}
          </button>
        );
      })}
      <label
        className={cn(
          "relative flex size-[26px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(#f6a8cf,#b9a7ff,#8fe3dc,#f2d49b,#ff6b7a,#f6a8cf)] ring-offset-2 ring-offset-surface",
          isCustom && "ring-2 ring-white",
        )}
        title={text("Panel.otherColor")}
      >
        <span className="sr-only">{text("Panel.otherColor")}</span>
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
  const text = useMessageText();
  const locked = premium && !isPremium;
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-surface-2 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Label htmlFor={id} className="text-sm font-bold text-foreground">
          {text(label)}
          {locked && <PremiumBadge />}
        </Label>
        {description && <p className="text-[13px] text-muted-foreground">{text(description)}</p>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(v) => (locked ? requirePremium(premiumFeature ?? label) : onChange(v))}
      />
    </div>
  );
}

/** Character counter shown under text fields. */
export function Counter({ value, max }: { value: string | null | undefined; max: number }) {
  return (
    <p className="text-end text-xs font-medium text-muted-foreground tabular-nums">
      {(value ?? "").length} / {max}
    </p>
  );
}
