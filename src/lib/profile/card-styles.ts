import type { ProfileSettings } from "./types";

export type CardStyle = ProfileSettings["card_style"];

type CardStyleMeta = {
  id: CardStyle;
  /** Label and description live in Panel.cardStyles.<id>. */
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
  { id: "classic", premium: false, className: "", ownBorder: false, detachedPlayer: false },
  { id: "glass", premium: true, className: "opal-card-glass rounded-[28px]", ownBorder: false, detachedPlayer: true },
  { id: "neon", premium: true, className: "opal-ring opal-card-neon rounded-[24px]", ownBorder: true, detachedPlayer: false },
  { id: "opal", premium: true, className: "opal-ring opal-card-opal rounded-[26px]", ownBorder: true, detachedPlayer: false },
  { id: "floating", premium: true, className: "opal-card-floating rounded-[28px]", ownBorder: false, detachedPlayer: true },
  { id: "retro", premium: true, className: "opal-card-retro rounded-[10px]", ownBorder: true, detachedPlayer: false },
  { id: "aurora", premium: true, className: "opal-card-aurora rounded-[28px]", ownBorder: false, detachedPlayer: true },
];

export function cardStyleMeta(id: string | null | undefined) {
  return CARD_STYLES.find((s) => s.id === id) ?? CARD_STYLES[0];
}
