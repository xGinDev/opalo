"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { profileUrl } from "@/lib/username";

type EnterScreenProps = { open: boolean; username: string; text?: string | null; onEnter: () => void };

/**
 * Figma 9:444 "toca para entrar": blurred cover over the profile. The tap is the user gesture
 * browsers require before playing audio.
 */
export function EnterScreen({ open, username, text, onEnter }: EnterScreenProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Profile");

  useEffect(() => {
    if (open) ref.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.button
          ref={ref}
          type="button"
          onClick={onEnter}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-2.5 bg-black/45 backdrop-blur-[15px] focus-visible:outline-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeOut" } }}
          aria-label={t("enterLabel", { username })}
        >
          <motion.span
            className="font-display text-[26px] font-bold tracking-[0.02em] [text-shadow:0_0_22px_rgba(255,255,255,0.7)]"
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {text?.trim() || t("enter")}
          </motion.span>
          <span dir="ltr" className="text-[13px] font-semibold text-muted-foreground">
            {profileUrl(username).replace("https://", "")}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
