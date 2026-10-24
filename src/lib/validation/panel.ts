import { z } from "zod";
import { messageKey } from "@/i18n/message-key";
import { NAME_FONTS } from "@/lib/profile/types";
import { PLATFORMS, linkAction } from "@/lib/profile/links";
import { Constants } from "@/types/database";

const { Enums } = Constants.public;

// Messages are translation keys (shown with useMessageText).
const optionalText = (max: number) =>
  z
    .string()
    .max(max, messageKey("Validation.maxChars", { max }))
    .transform((v) => v.trim() || null)
    .nullable();

/** Mirrors the column checks in 0001_init.sql. */
export const profilePatchSchema = z
  .object({
    display_name: optionalText(32),
    bio: optionalText(300),
    location: optionalText(40),
  })
  .partial();

export const settingsPatchSchema = z
  .object({
    layout: z.enum(Enums.layout_type),
    card_border: z.boolean(),
    card_opacity: z.number().min(0).max(0.9),
    arrangement: z.enum(["default", "stacked", "corners", "links-first", "compact", "minimal"]),
    card_style: z.enum(["classic", "glass", "neon", "opal", "floating", "retro", "aurora"]),
    name_font: z.enum(NAME_FONTS),
    name_effect: z.enum(Enums.name_fx),
    name_fx_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Validation.color").nullable(),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Validation.color"),
    tilt_3d: z.boolean(),
    bg_kind: z.enum(Enums.bg_kind),
    bg_url: z.url().nullable(),
    bg_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Validation.color"),
    bg_blur: z.number().int().min(0).max(20),
    particles: z.enum(Enums.particle_kind),
    cursor_trail: z.boolean(),
    show_location: z.boolean(),
    show_badges: z.boolean(),
    show_online: z.boolean(),
    show_presence: z.boolean(),
    presence_text: optionalText(60),
    presence_source: z.enum(["custom", "discord"]),
    icon_style: z.enum(["mono", "color"]),
    discord_id: z.string().regex(/^[0-9]{17,20}$/, "Validation.discordId").nullable(),
    show_player: z.boolean(),
    music_url: z.url().nullable(),
    music_cover_url: z.url().nullable(),
    music_volume: z.number().int().min(0).max(100),
    music_title: optionalText(60),
    show_branding: z.boolean(),
    tab_title: optionalText(40),
    tab_title_animated: z.boolean(),
    favicon_url: z.url().nullable(),
    enter_text: optionalText(40),
  })
  .partial();

export type ProfilePatch = z.input<typeof profilePatchSchema>;
export type SettingsPatch = z.input<typeof settingsPatchSchema>;

export const PLATFORM_KEYS = Object.keys(PLATFORMS) as [keyof typeof PLATFORMS, ...(keyof typeof PLATFORMS)[]];

export const linkSchema = z
  .object({
    platform: z.enum(PLATFORM_KEYS, "Validation.platform"),
    value: z.string().trim().min(1, "Validation.linkValue").max(300, messageKey("Validation.maxChars", { max: 300 })),
  })
  .refine((l) => linkAction(l.platform, l.value).kind !== "none", {
    path: ["value"],
    message: "Validation.linkInvalid",
  });

export type LinkInput = z.input<typeof linkSchema>;
