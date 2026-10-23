import { notFound } from "next/navigation";
import { PanelProvider } from "@/components/panel/panel-provider";
import { PanelShell } from "@/components/panel/panel-shell";
import type { PanelData } from "@/lib/panel/types";
import { profileFontVariables } from "@/lib/profile-fonts";

export const metadata = { title: "Panel de prueba", robots: { index: false } };

const NOW = "2026-10-22T12:00:00.000Z";
const link = (id: number, platform: string, value: string, enabled = true) => ({
  id: `00000000-0000-4000-8000-00000000000${id}`,
  profile_id: "00000000-0000-0000-0000-000000000000",
  platform,
  value,
  position: id,
  enabled,
  created_at: NOW,
});

/** Mock data matching the Figma ("nico"). */
export const MOCK_PANEL: PanelData = {
  profile: {
    id: "00000000-0000-0000-0000-000000000000",
    username: "nico",
    display_name: "nico",
    bio: "dev de día, gamer de noche | si lees esto, toma agua",
    location: "en algún lugar",
    avatar_url: null,
    plan: "free",
    premium_since: null,
    role: "user",
    status: "active",
    username_changed_at: null,
    created_at: "2025-12-26T12:00:00.000Z",
    updated_at: NOW,
  },
  settings: {
    profile_id: "00000000-0000-0000-0000-000000000000",
    layout: "card",
    card_border: true,
    card_opacity: 0.5,
    card_style: "classic",
    arrangement: "default",
    name_font: "Unbounded",
    name_effect: "glow",
    name_fx_color: null,
    accent_color: "#B9A7FF",
    tilt_3d: true,
    bg_kind: "color",
    bg_url: null,
    bg_color: "#0B0812",
    bg_blur: 6,
    particles: "stars",
    cursor_trail: false,
    show_location: true,
    show_badges: true,
    show_online: true,
    show_presence: true,
    presence_text: "jugando Valorant, competitivo",
    presence_source: "custom",
    discord_id: null,
    icon_style: "mono",
    show_player: true,
    music_url: null,
    music_title: null,
    music_cover_url: null,
    music_volume: 60,
    show_branding: true,
    tab_title: null,
    tab_title_animated: true,
    favicon_url: null,
    enter_text: null,
    updated_at: NOW,
  },
  links: [
    link(0, "discord", "nico"),
    link(1, "instagram", "instagram.com/nico"),
    link(2, "youtube", "youtube.com/@nico"),
    link(3, "spotify", "open.spotify.com/user/nico", false),
  ],
  badges: [{ slug: "early", name: "Early supporter", icon: "zap" }],
  stats: { views: 48210, clicks: 3904 },
  email: "nico@example.com",
  discordAccountId: "94490510688792576",
};

/** Dev-only review harness for the panel: same components, mock data, no session. */
export default function DevPanelLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className={profileFontVariables}>
      <PanelProvider initial={MOCK_PANEL}>
        <PanelShell>{children}</PanelShell>
      </PanelProvider>
    </div>
  );
}
