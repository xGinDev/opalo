import { defineRouting } from "next-intl/routing";

export const locales = ["es", "en", "pt", "fr", "de", "tr", "pl", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

/**
 * Spanish lives at the root (opalo.me/terminos); the rest get a prefix (opalo.me/en/terminos).
 * Profiles are always opalo.me/<username>: the proxy rewrites them to the visitor's language
 * without changing the URL (see src/proxy.ts).
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

/** Right-to-left scripts. */
export const RTL_LOCALES: readonly Locale[] = ["ar"];

export function isRtl(locale: string) {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}

/** Native names for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  tr: "Türkçe",
  pl: "Polski",
  ar: "العربية",
};

/** Open Graph locale codes. */
export const OG_LOCALES: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
  pt: "pt_BR",
  fr: "fr_FR",
  de: "de_DE",
  tr: "tr_TR",
  pl: "pl_PL",
  ar: "ar_AR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value) && (locales as readonly string[]).includes(value!);
}

/** "" for Spanish, "/en" for English… (as-needed prefix). */
export function localePrefix(locale: string) {
  return locale === defaultLocale ? "" : `/${locale}`;
}
