import { cn } from "@/lib/utils";

type GlowOrbProps = {
  /** Any CSS background: a color or a gradient. */
  color: string;
  /** Gaussian blur in px (same value as Figma's layer blur). */
  blur: number;
  opacity: number;
  /** Position and size, e.g. "left-[-81px] top-[-61px] size-[300px]". */
  className?: string;
};

/** Soft blurred light used across the landing and the profile previews. */
export function GlowOrb({ color, blur, opacity, className }: GlowOrbProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full", className)}
      style={{ background: color, filter: `blur(${blur}px)`, opacity }}
    />
  );
}
