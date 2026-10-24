import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileView } from "@/components/profile/profile-view";
import { JsonLd } from "@/components/seo/json-ld";
import { OG_LOCALES, type Locale } from "@/i18n/routing";
import { bioPhrases, tabTitleOf } from "@/lib/profile/format";
import { getPublicProfile, usernameFromParam } from "@/lib/profile/get-public-profile";
import { linkAction } from "@/lib/profile/links";
import { siteUrl } from "@/lib/site";
import { profilePath } from "@/lib/username";

type Props = { params: Promise<{ locale: Locale; username: string }> };

async function load(params: Props["params"]) {
  const username = usernameFromParam((await params).username);
  return username ? getPublicProfile(username) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [data, t] = await Promise.all([load(params), getTranslations({ locale, namespace: "Profile.meta" })]);
  if (!data) return { title: t("notFound"), robots: { index: false } };

  const { username, display_name, bio } = data.profile;
  const name = display_name?.trim() || username;
  const description = bioPhrases(bio).join(" · ") || t("fallbackDescription", { name });
  const title = name === username ? `@${username}` : `${name} (@${username})`;
  const favicon = data.settings.favicon_url;
  // One canonical URL per profile (no language prefix), whatever language it was rendered in.
  const url = `${siteUrl}${profilePath(username)}`;

  return {
    // Tab shows "@username" (or the custom title) without the " · Ópalo" suffix; it animates on the client.
    title: { absolute: tabTitleOf(data.settings, username) },
    ...(favicon ? { icons: { icon: favicon } } : {}),
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "profile", url, username, siteName: "Ópalo", locale: OG_LOCALES[locale] },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** opalo.me/<username> — public profile. */
export default async function PublicProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await load(params);
  if (!data) notFound();

  const { username, display_name, bio, avatar_url, created_at } = data.profile;
  const url = `${siteUrl}${profilePath(username)}`;
  // Public links to the person's other profiles help search engines connect them (schema.org sameAs).
  const sameAs = data.links.flatMap((l) => {
    const action = linkAction(l.platform, l.value);
    return action.kind === "open" ? [action.href] : [];
  });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url,
          dateCreated: created_at,
          mainEntity: {
            "@type": "Person",
            name: display_name?.trim() || username,
            alternateName: `@${username}`,
            identifier: username,
            url,
            ...(bio ? { description: bioPhrases(bio).join(" · ") } : {}),
            ...(avatar_url ? { image: avatar_url } : {}),
            ...(sameAs.length ? { sameAs } : {}),
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/ViewAction",
              userInteractionCount: data.views,
            },
          },
        }}
      />
      <ProfileView data={data} />
    </>
  );
}
