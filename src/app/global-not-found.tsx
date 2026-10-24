import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NotFoundView } from "@/components/not-found-view";
import { RootDocument } from "@/components/root-document";
import { defaultLocale, isLocale, localePrefix, type Locale } from "@/i18n/routing";

export const metadata: Metadata = { title: "404 · Ópalo", robots: { index: false } };

/** Language for URLs that match no route: the /en, /pt… prefix if present, else the browser's. */
async function guessLocale(): Promise<Locale> {
  const h = await headers();
  const fromPath = (h.get("x-invoke-path") ?? h.get("next-url") ?? "").split("/")[1];
  if (isLocale(fromPath)) return fromPath;
  for (const part of (h.get("accept-language") ?? "").split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}

/** 404 for URLs that match no route (enabled by experimental.globalNotFound). */
export default async function GlobalNotFound() {
  const locale = await guessLocale();
  const t = await getTranslations({ locale, namespace: "NotFound" });
  return (
    <RootDocument locale={locale}>
      <NotFoundView title={t("title")} body={t("body")} create={t("create")} home={t("home")} prefix={localePrefix(locale)} />
    </RootDocument>
  );
}
