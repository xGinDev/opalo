"use client";

import { motion } from "motion/react";
import { Sparkle } from "lucide-react";
import { nameFontFamily } from "@/lib/profile-fonts";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

type ProfileNameProps = {
  name: string;
  font: string;
  effect: Enums<"name_fx">;
  accent: string;
  still: boolean;
  className?: string;
  /** `h1` on the public page; `p` inside the panel preview (the panel has its own h1). */
  as?: "h1" | "p";
};

/** Fixed spots around the name for the sparkle effect (percent of the text box). */
const SPARKLES = [
  { left: "-6%", top: "8%", size: 12, delay: 0 },
  { left: "22%", top: "-18%", size: 9, delay: 0.7 },
  { left: "58%", top: "86%", size: 10, delay: 1.3 },
  { left: "88%", top: "-10%", size: 13, delay: 0.4 },
  { left: "102%", top: "60%", size: 8, delay: 1.8 },
];

/** Display name in the chosen font with its effect: glow, sparkle, rainbow or none. */
export function ProfileName({ name, font, effect, accent, still, className, as: Tag = "h1" }: ProfileNameProps) {
  const glow = `0 0 10px rgba(255,255,255,0.6), 0 0 26px ${accent}80`;

  return (
    <Tag
      className={cn("relative leading-[1.05] font-extrabold tracking-[-0.02em] break-words", className)}
      style={{ fontFamily: nameFontFamily(font) }}
    >
      {effect === "rainbow" ? (
        <span
          className={cn(
            "bg-[linear-gradient(90deg,#f6a8cf,#b9a7ff,#8fe3dc,#f2d49b,#f6a8cf)] bg-[length:200%_auto] bg-clip-text text-transparent",
            !still && "animate-rainbow",
          )}
          style={{ filter: `drop-shadow(0 0 12px ${accent}66)` }}
        >
          {name}
        </span>
      ) : (
        <span style={{ textShadow: effect === "none" ? undefined : glow }}>{name}</span>
      )}

      {effect === "sparkle" &&
        SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute text-white"
            style={{ left: s.left, top: s.top, filter: `drop-shadow(0 0 6px ${accent})` }}
            initial={{ opacity: still ? 0.8 : 0, scale: still ? 1 : 0.4 }}
            animate={still ? undefined : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 90, 180] }}
            transition={{ duration: 2.2, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkle style={{ width: s.size, height: s.size }} fill="currentColor" strokeWidth={0} />
          </motion.span>
        ))}
    </Tag>
  );
}
