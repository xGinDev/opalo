import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { bioPhrases, tabTitleOf } from "@/lib/profile/format";
import { getPublicProfile, usernameFromParam } from "@/lib/profile/get-public-profile";
import { profilePath } from "@/lib/username";

type Props = { params: Promise<{ username: string }> };

async function load(params: Props["params"]) {
  const username = usernameFromParam((await params).username);
  return username ? getPublicProfile(username) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params);
  if (!data) return { title: "Perfil no encontrado" };

  const { username, display_name, bio } = data.profile;
  const name = display_name?.trim() || username;
  const description = bioPhrases(bio).join(" · ") || `Mira el perfil de ${name} en Ópalo.`;
  const title = name === username ? `@${username}` : `${name} (@${username})`;
  const favicon = data.settings.favicon_url;

  return {
    // Tab shows "@username" (or the custom title) without the " · Ópalo" suffix; it animates on the client.
    title: { absolute: tabTitleOf(data.settings, username) },
    ...(favicon ? { icons: { icon: favicon } } : {}),
    description,
    alternates: { canonical: profilePath(username) },
    openGraph: { title, description, type: "profile", url: profilePath(username) },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** opalo.me/<username> — public profile. */
export default async function PublicProfilePage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();
  return <ProfileView data={data} />;
}
