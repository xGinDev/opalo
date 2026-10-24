import { Fredoka, Silkscreen, Space_Grotesk, Unbounded } from "next/font/google";
import type { NameFont } from "@/lib/profile/types";

// Only imported by the public profile and the panel preview, so other routes never load them.
const unbounded = Unbounded({ subsets: ["latin", "latin-ext"], variable: "--font-unbounded", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-space-grotesk", display: "swap" });
const silkscreen = Silkscreen({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-silkscreen", display: "swap" });
const fredoka = Fredoka({ subsets: ["latin", "latin-ext"], variable: "--font-fredoka", display: "swap" });

/** Add to a wrapper so `nameFontFamily` can resolve the CSS variables. */
export const profileFontVariables = [unbounded, spaceGrotesk, silkscreen, fredoka].map((f) => f.variable).join(" ");

const FAMILY: Record<NameFont, string> = {
  Unbounded: "var(--font-unbounded)",
  "Space Grotesk": "var(--font-space-grotesk)",
  Silkscreen: "var(--font-silkscreen)",
  Fredoka: "var(--font-fredoka)",
};

export function nameFontFamily(font: string) {
  return `${FAMILY[font as NameFont] ?? FAMILY.Unbounded}, var(--font-bricolage), sans-serif`;
}
