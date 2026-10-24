import type { Metadata } from "next";
import { OG_LOCALES, defaultLocale, localePrefix, locales, type Locale } from "@/i18n/routing";
import { siteUrl } from "./site";

/** Absolute URL of a localized page: ("en", "/terminos") → https://opalo.me/en/terminos */
export function localizedUrl(locale: string, path: string) {
  const clean = path === "/" ? "" : path;
  return `${siteUrl}${localePrefix(locale)}${clean}` || siteUrl;
}

/** canonical + hreflang for every language (+ x-default → Spanish, the unprefixed version). */
export function languageAlternates(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: localizedUrl(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localizedUrl(l, path)])),
      "x-default": localizedUrl(defaultLocale, path),
    },
  };
}

/** Metadata for a public, translated page: title, description, hreflang, Open Graph and Twitter. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** The home page uses the full title without the "· Ópalo" template. */
  absoluteTitle?: boolean;
}): Metadata {
  const url = localizedUrl(locale, path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: languageAlternates(locale, path),
    openGraph: {
      type: "website",
      siteName: "Ópalo",
      url,
      title,
      description,
      locale: OG_LOCALES[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
