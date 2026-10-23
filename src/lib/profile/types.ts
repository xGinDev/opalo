import type { Enums, Tables } from "@/types/database";

/** Appearance settings as returned by `get_public_profile` (no ids or timestamps). */
export type ProfileSettings = Omit<Tables<"profile_settings">, "profile_id" | "updated_at">;

export type PublicLink = { id: string; platform: string; value: string };
export type PublicBadge = { slug: string; name: string; icon: string | null };

/** Shape of `get_public_profile(p_username)`; also what the panel preview feeds the same component. */
export type PublicProfile = {
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    location: string | null;
    avatar_url: string | null;
    plan: Enums<"plan_type">;
    created_at: string;
  };
  settings: ProfileSettings;
  links: PublicLink[];
  badges: PublicBadge[];
  views: number;
};

export const NAME_FONTS = ["Unbounded", "Space Grotesk", "Silkscreen", "Fredoka"] as const;
export type NameFont = (typeof NAME_FONTS)[number];
