import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppearanceEditor } from "@/components/panel/appearance-editor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel.nav.sections.appearance");
  return { title: t("label") };
}

export default function AppearancePage() {
  return <AppearanceEditor />;
}
