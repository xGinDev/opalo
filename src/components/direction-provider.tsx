"use client";

import { Direction } from "radix-ui";

/** Tells Radix (menus, selects, sliders, tabs) to mirror itself in right-to-left languages. */
export function DirectionProvider({ dir, children }: { dir: "ltr" | "rtl"; children: React.ReactNode }) {
  return <Direction.DirectionProvider dir={dir}>{children}</Direction.DirectionProvider>;
}
