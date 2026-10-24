import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LinksCard } from "@/components/panel/profile-sections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel.nav.sections.links");
  return { title: t("label") };
}

export default function LinksPage() {
  return <LinksCard />;
}
