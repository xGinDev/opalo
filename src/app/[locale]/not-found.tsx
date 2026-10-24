import { getLocale, getTranslations } from "next-intl/server";
import { NotFoundView } from "@/components/not-found-view";
import { localePrefix } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("NotFound");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function NotFound() {
  const [t, locale] = await Promise.all([getTranslations("NotFound"), getLocale()]);
  return <NotFoundView title={t("title")} body={t("body")} create={t("create")} home={t("home")} prefix={localePrefix(locale)} />;
}
