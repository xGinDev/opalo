"use client";

import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before animating (for staggering siblings). */
  delay?: number;
  /** Animate on mount instead of when scrolled into view (above-the-fold content). */
  immediate?: boolean;
  as?: "div" | "li" | "section";
};

/** Subtle fade + rise when the element enters the viewport. Fade-only with reduced motion. */
export function Reveal({ children, className, delay = 0, immediate = false, as = "div" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];
  const hidden = { opacity: 0, y: reduceMotion ? 0 : 24 };
  const visible = { opacity: 1, y: 0 };

  return (
    <Component
      className={className}
      initial={hidden}
      {...(immediate ? { animate: visible } : { whileInView: visible, viewport: { once: true, margin: "-80px" } })}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
