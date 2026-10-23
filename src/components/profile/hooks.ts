"use client";

import { useSyncExternalStore } from "react";
import { supportsWebGL } from "./background/webgl";

function mediaQueryStore(query: string) {
  return {
    subscribe(onChange: () => void) {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    getSnapshot: () => window.matchMedia(query).matches,
  };
}

const reducedMotion = mediaQueryStore("(prefers-reduced-motion: reduce)");
const finePointer = mediaQueryStore("(hover: hover) and (pointer: fine)");

/** prefers-reduced-motion; false during SSR. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(reducedMotion.subscribe, reducedMotion.getSnapshot, () => false);
}

/** Mouse/trackpad (not touch). Tilt and cursor trail only run with a fine pointer. */
export function useFinePointer() {
  return useSyncExternalStore(finePointer.subscribe, finePointer.getSnapshot, () => false);
}

let webglCache: boolean | undefined;
const noop = () => () => {};

/** WebGL availability; false during SSR so the CSS fallback paints first. */
export function useWebGL() {
  return useSyncExternalStore(
    noop,
    () => (webglCache ??= supportsWebGL()),
    () => false,
  );
}
