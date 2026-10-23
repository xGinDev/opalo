import { notFound } from "next/navigation";
import { ProfilePreview } from "@/components/opal/profile-preview";
import { ProfileView } from "@/components/profile/profile-view";
import { profileFontVariables } from "@/lib/profile-fonts";
import type { PublicProfile } from "@/lib/profile/types";
import { Constants } from "@/types/database";

export const metadata = { title: "Perfil de prueba", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

function pick<T extends string>(value: string | undefined, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

/**
 * Dev-only: the real ProfileView with the Figma sample data ("nico"), to review layouts
 * without a database row. Try ?layout=center&particles=rain&effect=rainbow&preview=1
 */
export default async function DevProfilePage({ searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const { Enums } = Constants.public;

  const data: PublicProfile = {
    profile: {
      id: "00000000-0000-0000-0000-000000000000",
      username: "nico",
      display_name: q.nombre ?? "nico",
      bio: q.bio ?? "dev de día, gamer de noche|stream los viernes|siempre con música",
      location: "en algún lugar",
      avatar_url: null,
      plan: "premium",
      created_at: "2025-12-26T12:00:00.000Z",
    },
    settings: {
      layout: pick(q.layout, Enums.layout_type, "card"),
      card_border: q.border !== "0",
      card_opacity: 0.5,
      name_font: q.font ?? "Unbounded",
      name_effect: pick(q.effect, Enums.name_fx, "glow"),
      accent_color: q.accent ? `#${q.accent}` : "#B9A7FF",
      tilt_3d: true,
      bg_kind: "color",
      bg_url: null,
      bg_blur: 6,
      particles: pick(q.particles, Enums.particle_kind, "stars"),
      cursor_trail: q.trail === "1",
      show_location: true,
      show_badges: true,
      show_online: true,
      show_presence: true,
      presence_text: "jugando Valorant, competitivo",
      show_player: true,
      music_url: q.music ?? null,
      music_title: "midnight drive",
      show_branding: true,
      tab_title: q.tab ?? null,
      tab_title_animated: q.tabanim !== "0",
      favicon_url: null,
      enter_text: q.entrada ?? null,
    },
    links: [
      { id: "11111111-1111-4111-8111-111111111111", platform: "discord", value: "nico" },
      { id: "22222222-2222-4222-8222-222222222222", platform: "instagram", value: "nico" },
      { id: "33333333-3333-4333-8333-333333333333", platform: "youtube", value: "@nico" },
      { id: "44444444-4444-4444-8444-444444444444", platform: "spotify", value: "https://open.spotify.com/user/nico" },
      { id: "55555555-5555-4555-8555-555555555555", platform: "web", value: "nico.dev" },
    ],
    badges: [
      { slug: "premium", name: "Premium", icon: "gem" },
      { slug: "fundador", name: "Fundador", icon: "crown" },
      { slug: "verificado", name: "Verificado", icon: "check" },
    ],
    views: 48210,
  };

  if (q.preview === "1") {
    return (
      <div className={`${profileFontVariables} flex min-h-dvh items-center justify-center p-6`}>
        <ProfilePreview>
          <ProfileView data={data} variant="preview" />
        </ProfilePreview>
      </div>
    );
  }

  return (
    <div className={profileFontVariables}>
      <ProfileView data={data} />
    </div>
  );
}
