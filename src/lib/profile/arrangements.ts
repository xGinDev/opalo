import type { ProfileSettings } from "./types";

export type ArrangementId = ProfileSettings["arrangement"];

/** Blocks that go under the identity (photo + name + bio), in this order. */
export type FlowBlock = "presence" | "links" | "player";

export type Arrangement = {
  id: ArrangementId;
  label: string;
  description: string;
  premium: boolean;
  /** Show the photo at all ("Minimal" hides it). */
  avatar: boolean;
  /** "row": photo beside the text at every size, left aligned. "auto": the layout decides (card = row on desktop). */
  identity: "auto" | "row";
  /** Badges next to the name, or on their own line under it. */
  badges: "inline" | "below";
  /** Location: with the views, on its own line under the bio, or in the card's bottom-right corner. */
  location: "stats" | "line" | "corner";
  /** Views: in a row at the end, or in the card's bottom-left corner. */
  stats: "inline" | "corner";
  order: FlowBlock[];
  /** Mini sketch for the picker: rows from top to bottom. */
  sketch: ("avatar" | "avatar-row" | "name" | "badges" | "bio" | "presence" | "links" | "corner-left" | "corners")[];
};

/** Order = order in the picker. Must match the arrangement check (0011_distribuciones.sql). */
export const ARRANGEMENTS: Arrangement[] = [
  {
    id: "default",
    label: "Predeterminada",
    description: "Foto, nombre con insignias, estado, redes y visitas al final.",
    premium: false,
    avatar: true,
    identity: "auto",
    badges: "inline",
    location: "stats",
    stats: "inline",
    order: ["presence", "links", "player"],
    sketch: ["avatar", "name", "bio", "presence", "links"],
  },
  {
    id: "stacked",
    label: "Apilada",
    description: "Las insignias bajo el nombre, la ubicación en su línea y las visitas en la esquina.",
    premium: true,
    avatar: true,
    identity: "auto",
    badges: "below",
    location: "line",
    stats: "corner",
    order: ["presence", "links", "player"],
    sketch: ["avatar", "name", "badges", "bio", "presence", "links", "corner-left"],
  },
  {
    id: "corners",
    label: "Esquinas",
    description: "Visitas abajo a la izquierda y ubicación abajo a la derecha.",
    premium: true,
    avatar: true,
    identity: "auto",
    badges: "inline",
    location: "corner",
    stats: "corner",
    order: ["presence", "links", "player"],
    sketch: ["avatar", "name", "bio", "presence", "links", "corners"],
  },
  {
    id: "links-first",
    label: "Redes arriba",
    description: "Tus redes justo debajo del nombre, el estado después.",
    premium: true,
    avatar: true,
    identity: "auto",
    badges: "inline",
    location: "stats",
    stats: "inline",
    order: ["links", "presence", "player"],
    sketch: ["avatar", "name", "bio", "links", "presence"],
  },
  {
    id: "compact",
    label: "Compacta",
    description: "Foto al lado del nombre también en el celular, todo alineado a la izquierda.",
    premium: true,
    avatar: true,
    identity: "row",
    badges: "below",
    location: "line",
    stats: "inline",
    order: ["presence", "links", "player"],
    sketch: ["avatar-row", "presence", "links"],
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Sin foto: el nombre manda. Redes y estado debajo.",
    premium: true,
    avatar: false,
    identity: "auto",
    badges: "below",
    location: "stats",
    stats: "inline",
    order: ["links", "presence", "player"],
    sketch: ["name", "badges", "bio", "links", "presence"],
  },
];

export function arrangementMeta(id: string | null | undefined) {
  return ARRANGEMENTS.find((a) => a.id === id) ?? ARRANGEMENTS[0];
}
