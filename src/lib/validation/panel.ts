import { z } from "zod";
import { NAME_FONTS } from "@/lib/profile/types";
import { PLATFORMS, linkAction } from "@/lib/profile/links";
import { Constants } from "@/types/database";

const { Enums } = Constants.public;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label}: máximo ${max} caracteres.`)
    .transform((v) => v.trim() || null)
    .nullable();

/** Mirrors the column checks in 0001_init.sql. */
export const profilePatchSchema = z
  .object({
    display_name: optionalText(32, "Nombre"),
    bio: optionalText(300, "Bio"),
    location: optionalText(40, "Ubicación"),
  })
  .partial();

export const settingsPatchSchema = z
  .object({
    layout: z.enum(Enums.layout_type),
    card_border: z.boolean(),
    card_opacity: z.number().min(0).max(0.9),
    name_font: z.enum(NAME_FONTS),
    name_effect: z.enum(Enums.name_fx),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color no válido."),
    tilt_3d: z.boolean(),
    bg_kind: z.enum(Enums.bg_kind),
    bg_url: z.url().nullable(),
    bg_blur: z.number().int().min(0).max(20),
    particles: z.enum(Enums.particle_kind),
    cursor_trail: z.boolean(),
    show_location: z.boolean(),
    show_badges: z.boolean(),
    show_online: z.boolean(),
    show_presence: z.boolean(),
    presence_text: optionalText(60, "Estado"),
    show_player: z.boolean(),
    music_url: z.url().nullable(),
    music_title: optionalText(60, "Título"),
    show_branding: z.boolean(),
    tab_title: optionalText(40, "Título de la pestaña"),
    tab_title_animated: z.boolean(),
    favicon_url: z.url().nullable(),
    enter_text: optionalText(40, "Texto de entrada"),
  })
  .partial();

export type ProfilePatch = z.input<typeof profilePatchSchema>;
export type SettingsPatch = z.input<typeof settingsPatchSchema>;

export const PLATFORM_KEYS = Object.keys(PLATFORMS) as [keyof typeof PLATFORMS, ...(keyof typeof PLATFORMS)[]];

export const linkSchema = z
  .object({
    platform: z.enum(PLATFORM_KEYS, "Elige una red."),
    value: z.string().trim().min(1, "Escribe tu usuario o enlace.").max(300, "Máximo 300 caracteres."),
  })
  .refine((l) => linkAction(l.platform, l.value).kind !== "none", {
    path: ["value"],
    message: "Ese enlace no es válido.",
  });

export type LinkInput = z.input<typeof linkSchema>;
