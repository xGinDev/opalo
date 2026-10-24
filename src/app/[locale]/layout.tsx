import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RootDocument } from "@/components/root-document";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

/** All languages are prerendered (pages opt into dynamic rendering on their own). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("home.title"), template: "%s · Ópalo" },
    description: t("home.description"),
    applicationName: "Ópalo",
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d0b12",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <RootDocument locale={locale}>
      {children}
      <Analytics />
    </RootDocument>
  );
}
