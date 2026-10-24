import { ChartNoAxesColumn, Gem, Link, Music, Palette, Settings, User, type LucideIcon } from "lucide-react";

export type PanelSection = {
  href: string;
  /** Key under Panel.nav.sections (label + description). */
  key: "profile" | "appearance" | "links" | "music" | "stats" | "premium" | "settings";
  icon: LucideIcon;
  /** Shows the live preview column. */
  preview: boolean;
  /** Shows "Guardar cambios" (the page edits the draft). */
  save: boolean;
};

export const PANEL_SECTIONS: PanelSection[] = [
  { href: "/panel", key: "profile", icon: User, preview: true, save: true },
  { href: "/panel/apariencia", key: "appearance", icon: Palette, preview: true, save: true },
  { href: "/panel/redes", key: "links", icon: Link, preview: true, save: false },
  { href: "/panel/musica", key: "music", icon: Music, preview: true, save: true },
  { href: "/panel/estadisticas", key: "stats", icon: ChartNoAxesColumn, preview: false, save: false },
  { href: "/panel/premium", key: "premium", icon: Gem, preview: false, save: false },
  { href: "/panel/ajustes", key: "settings", icon: Settings, preview: false, save: false },
];

/** Section for a pathname without the language prefix (next-intl's usePathname). */
export function sectionFor(rawPathname: string) {
  // /dev/panel/* is the dev-only review harness for these same screens.
  const pathname = rawPathname.replace(/^\/dev(?=\/panel)/, "");
  return [...PANEL_SECTIONS].reverse().find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`)) ?? PANEL_SECTIONS[0];
}
