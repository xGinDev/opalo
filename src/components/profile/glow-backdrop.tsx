import { GlowOrb } from "@/components/opal/glow-orb";
import { cn } from "@/lib/utils";

type GlowBackdropProps = {
  /** Three light colors: top-left, right, bottom-left. */
  colors?: [string, string, string];
  className?: string;
};

/**
 * Static CSS version of the profile background (Figma 7:490): soft blurred lights,
 * a dot texture and a radial vignette. Used in previews and as the no-WebGL fallback.
 */
export function GlowBackdrop({ colors = ["#f6a8cf", "#b9a7ff", "#8fe3dc"], className }: GlowBackdropProps) {
  const [a, b, c] = colors;
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-[#120f1a]", className)}>
      <GlowOrb color={a} blur={45} opacity={0.32} className="top-[-6%] left-[-24%] aspect-square w-[76%]" />
      <GlowOrb color={b} blur={45} opacity={0.32} className="top-[31%] left-[41%] aspect-square w-[76%]" />
      <GlowOrb color={c} blur={45} opacity={0.32} className="top-[66%] left-[-18%] aspect-square w-[70%]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
