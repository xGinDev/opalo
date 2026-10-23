import type { ProfileSettings } from "./types";

export type CardStyle = ProfileSettings["card_style"];

type CardStyleMeta = {
  id: CardStyle;
  label: string;
  description: string;
  premium: boolean;
  /** Classes for the profile <section> (CSS lives in globals.css). */
  className: string;
  /** The style draws its own border, so "Borde grueso" doesn't apply. */
  ownBorder: boolean;
  /** The music player sits under the card as its own panel. */
  detachedPlayer: boolean;
};

/** Order = order in the panel picker. Must match the card_style check (0010_disenos_de_tarjeta.sql). */
export const CARD_STYLES: CardStyleMeta[] = [
  { id: "classic", label: "Clásica", description: "La de siempre: limpia y oscura.", premium: false, className: "", ownBorder: false, detachedPlayer: false },
  { id: "glass", label: "Cristal", description: "Vidrio esmerilado con reflejo arriba.", premium: true, className: "opal-card-glass rounded-[28px]", ownBorder: false, detachedPlayer: true },
  { id: "neon", label: "Neón", description: "Borde de luz que gira con tu color.", premium: true, className: "opal-ring opal-card-neon rounded-[24px]", ownBorder: true, detachedPlayer: false },
  { id: "opal", label: "Ópalo", description: "Borde iridiscente y un destello que cruza.", premium: true, className: "opal-ring opal-card-opal rounded-[26px]", ownBorder: true, detachedPlayer: false },
  { id: "floating", label: "Avatar flotante", description: "Tu foto sale por encima de la tarjeta.", premium: true, className: "opal-card-floating rounded-[28px]", ownBorder: false, detachedPlayer: true },
  { id: "retro", label: "Retro", description: "Sombra sólida y líneas de monitor viejo.", premium: true, className: "opal-card-retro rounded-[10px]", ownBorder: true, detachedPlayer: false },
  { id: "aurora", label: "Aurora", description: "Luces suaves que se mueven dentro.", premium: true, className: "opal-card-aurora rounded-[28px]", ownBorder: false, detachedPlayer: true },
];

export function cardStyleMeta(id: string | null | undefined) {
  return CARD_STYLES.find((s) => s.id === id) ?? CARD_STYLES[0];
}
