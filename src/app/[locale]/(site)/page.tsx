import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Faq, FAQ_KEYS } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { Leaderboard } from "@/components/landing/leaderboard";
import { Pricing } from "@/components/landing/pricing";
import { JsonLd } from "@/components/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import { localizedUrl, pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

/** The leaderboard is regenerated at most every 5 minutes; the rest of the page is static. */
export const revalidate = 300;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.home" });
  return {
    ...pageMetadata({ locale, path: "/", title: t("title"), description: t("description"), absoluteTitle: true }),
    keywords: t("keywords").split(",").map((k) => k.trim()),
  };
}

/** Figma 3:6 "01 Sitio público — Inicio" ("Ejemplos" replaced by the leaderboard). */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meta, faq] = await Promise.all([getTranslations("Meta.home"), getTranslations("Landing.faq")]);
  const url = localizedUrl(locale, "/");

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Ópalo",
            url: siteUrl,
            logo: `${siteUrl}/brand/gem.svg`,
            email: "soporte@opalo.me",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Ópalo",
            url,
            inLanguage: locale,
            description: meta("description"),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ópalo",
            url,
            applicationCategory: "SocialNetworkingApplication",
            operatingSystem: "Web",
            inLanguage: locale,
            description: meta("description"),
            offers: [
              { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
              { "@type": "Offer", name: "Premium", price: "10", priceCurrency: "USD" },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: locale,
            mainEntity: FAQ_KEYS.map((key) => ({
              "@type": "Question",
              name: faq(`items.${key}.q`),
              acceptedAnswer: { "@type": "Answer", text: faq(`items.${key}.a`) },
            })),
          },
        ]}
      />
      <Hero />
      <Features />
      <Leaderboard />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
