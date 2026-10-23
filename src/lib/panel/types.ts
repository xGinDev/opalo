import type { PublicBadge, PublicProfile } from "@/lib/profile/types";
import type { Tables } from "@/types/database";

export type ProfileRow = Tables<"profiles">;
export type SettingsRow = Tables<"profile_settings">;
export type LinkRow = Tables<"social_links">;

/** Profile fields the user edits from the panel (the rest is protected by triggers). */
export const EDITABLE_PROFILE_FIELDS = ["display_name", "bio", "location"] as const;
export type EditableProfile = Pick<ProfileRow, (typeof EDITABLE_PROFILE_FIELDS)[number]>;
export type EditableSettings = Omit<SettingsRow, "profile_id" | "updated_at">;

export type PanelData = {
  profile: ProfileRow;
  settings: SettingsRow;
  links: LinkRow[];
  badges: PublicBadge[];
  stats: { views: number; clicks: number };
  email: string | null;
};

/** Accent swatches from Figma 7:466 "Color de acento". */
export const ACCENT_SWATCHES = ["#B9A7FF", "#F6A8CF", "#8FE3DC", "#F2D49B", "#FF6B7A", "#F5F2FA"];
/** Solid backgrounds: Ópalo night first, then dark tones that keep white text legible. */
export const BACKGROUND_SWATCHES = ["#0B0812", "#000000", "#16112B", "#2A0F24", "#0C2326", "#2B1D0E", "#3A0D16"];

/** Builds the same shape as `get_public_profile`, so the preview renders exactly like the public page. */
export function toPublicProfile(data: Pick<PanelData, "profile" | "settings" | "links" | "badges" | "stats">): PublicProfile {
  const { profile, settings } = data;
  const { profile_id: _p, updated_at: _u, ...publicSettings } = settings;
  return {
    profile: {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      location: settings.show_location ? profile.location : null,
      avatar_url: profile.avatar_url,
      plan: profile.plan,
      created_at: profile.created_at,
    },
    settings: publicSettings,
    links: [...data.links]
      .filter((l) => l.enabled)
      .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
      .map(({ id, platform, value }) => ({ id, platform, value })),
    badges: settings.show_badges ? data.badges : [],
    views: data.stats.views,
  };
}
