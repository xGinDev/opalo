"use client";

import { useEffect, useState } from "react";
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
  /** Sparkle color for the "sparkle" effect; null = white sparkles with an accent glow. */
  sparkleColor?: string | null;
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
  { left: "40%", top: "-22%", size: 7, delay: 2.2 },
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&*@";

/** Types the name, waits, deletes it and starts again. Starts from the full name (SSR, reduced motion). */
function useTypewriter(text: string, active: boolean) {
  const chars = [...text];
  const [count, setCount] = useState(chars.length);
  const length = chars.length;

  useEffect(() => {
    if (!active) return;
    let shown = length;
    let direction = -1;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      shown += direction;
      if (shown <= 0) {
        shown = 0;
        direction = 1;
      } else if (shown >= length) {
        shown = length;
        direction = -1;
      }
      setCount(shown);
      const pause = shown === length ? 1800 : shown === 0 ? 500 : direction > 0 ? 120 : 60;
      timer = setTimeout(tick, pause);
    };
    timer = setTimeout(tick, 1400);
    return () => clearTimeout(timer);
  }, [active, length]);

  return active ? chars.slice(0, count).join("") : text;
}

/** Every few seconds the letters turn into random glyphs and resolve left to right. */
function useScramble(text: string, active: boolean) {
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    const chars = [...text];
    let interval: ReturnType<typeof setInterval> | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      let step = 0;
      interval = setInterval(() => {
        step += 1;
        const revealed = Math.floor(step / 3);
        if (revealed >= chars.length) {
          clearInterval(interval);
          setOutput(null);
          timer = setTimeout(run, 3200);
          return;
        }
        setOutput(chars.map((c, i) => (i < revealed || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
      }, 45);
    };
    timer = setTimeout(run, 900);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [active, text]);

  return active && output !== null ? output : text;
}

/**
 * Display name in the chosen font with its effect: glow, sparkle (any color), rainbow,
 * typewriter, blur, scramble or none. Animated variants keep the full name's width
 * (an invisible copy underneath) so the layout never jumps, and expose the real name to
 * screen readers.
 */
export function ProfileName({ name, font, effect, accent, sparkleColor, still, className, as: Tag = "h1" }: ProfileNameProps) {
  const glow = `0 0 10px rgba(255,255,255,0.6), 0 0 26px ${accent}80`;
  const typed = useTypewriter(name, effect === "typewriter" && !still);
  const scrambled = useScramble(name, effect === "scramble" && !still);

  let content: React.ReactNode;
  if (effect === "rainbow") {
    content = (
      <span
        className={cn(
          "bg-[linear-gradient(90deg,#f6a8cf,#b9a7ff,#8fe3dc,#f2d49b,#f6a8cf)] bg-[length:200%_auto] bg-clip-text text-transparent",
          !still && "animate-rainbow",
        )}
        style={{ filter: `drop-shadow(0 0 12px ${accent}66)` }}
      >
        {name}
      </span>
    );
  } else if (effect === "typewriter" || effect === "scramble") {
    content = (
      <span className="inline-grid" style={{ textShadow: glow }}>
        <span className="invisible col-start-1 row-start-1">{name}</span>
        <span aria-hidden className="col-start-1 row-start-1 whitespace-pre">
          {effect === "typewriter" ? typed : scrambled}
          {effect === "typewriter" && !still && (
            <span className="ml-[0.04em] inline-block w-[0.08em] animate-blink bg-current align-[-0.08em]" style={{ height: "0.9em" }} />
          )}
        </span>
        <span className="sr-only">{name}</span>
      </span>
    );
  } else if (effect === "blur") {
    content = (
      <span className={cn("inline-block", !still && "animate-name-blur")} style={{ textShadow: glow }}>
        {name}
      </span>
    );
  } else {
    content = <span style={{ textShadow: effect === "none" ? undefined : glow }}>{name}</span>;
  }

  return (
    <Tag
      className={cn("relative leading-[1.05] font-extrabold tracking-[-0.02em] break-words", className)}
      style={{ fontFamily: nameFontFamily(font) }}
    >
      {content}

      {effect === "sparkle" &&
        SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: s.left, top: s.top, color: sparkleColor ?? "#ffffff", filter: `drop-shadow(0 0 6px ${sparkleColor ?? accent})` }}
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
