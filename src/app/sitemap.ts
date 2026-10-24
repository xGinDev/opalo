import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { anonClient } from "@/lib/profile/get-public-profile";
import { localizedUrl } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { profilePath } from "@/lib/username";

/** Regenerated hourly so new profiles get discovered. */
export const revalidate = 3600;

/** Public, translated pages: every language version, linked to each other with hreflang. */
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/registro", priority: 0.8, changeFrequency: "monthly" },
  { path: "/login", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contacto", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terminos", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" },
];

/** Sitemaps allow 50,000 URLs; profiles get what the pages leave. */
const MAX_PROFILES = 40_000;

async function publicProfiles(): Promise<MetadataRoute.Sitemap> {
  try {
    // RLS hides suspended profiles from the anon role.
    const { data } = await anonClient()
      .from("profiles")
      .select("username, updated_at")
      .order("updated_at", { ascending: false })
      .limit(MAX_PROFILES);
    return (data ?? []).map((p) => ({
      url: `${siteUrl}${profilePath(p.username)}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = PAGES.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency,
      priority,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, localizedUrl(l, path)])) },
    })),
  );
  return [...pages, ...(await publicProfiles())];
}
