import { ChartNoAxesColumn, Gem, Link, Music, Palette, Settings, User, type LucideIcon } from "lucide-react";

export type PanelSection = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Shows the live preview column. */
  preview: boolean;
  /** Shows "Guardar cambios" (the page edits the draft). */
  save: boolean;
};

export const PANEL_SECTIONS: PanelSection[] = [
  { href: "/panel", label: "Mi perfil", icon: User, description: "Los cambios se ven en la vista previa al instante.", preview: true, save: true },
  { href: "/panel/apariencia", label: "Apariencia", icon: Palette, description: "Estilo, tipografía, fondo y efectos de tu página.", preview: true, save: true },
  { href: "/panel/redes", label: "Redes", icon: Link, description: "Tus redes y enlaces. Se guardan al instante.", preview: true, save: false },
  { href: "/panel/musica", label: "Música", icon: Music, description: "La canción que suena cuando alguien entra.", preview: true, save: true },
  { href: "/panel/estadisticas", label: "Estadísticas", icon: ChartNoAxesColumn, description: "Visitas a tu perfil y clics en tus redes.", preview: false, save: false },
  { href: "/panel/premium", label: "Premium", icon: Gem, description: "Desbloquea todo con un solo pago.", preview: false, save: false },
  { href: "/panel/ajustes", label: "Ajustes", icon: Settings, description: "Tu usuario, correo, contraseña y cuenta.", preview: false, save: false },
];

export function sectionFor(rawPathname: string) {
  // /dev/panel/* is the dev-only review harness for these same screens.
  const pathname = rawPathname.replace(/^\/dev(?=\/panel)/, "");
  return [...PANEL_SECTIONS].reverse().find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`)) ?? PANEL_SECTIONS[0];
}
