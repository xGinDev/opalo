import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SettingsForms } from "@/components/panel/settings-forms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel.nav.sections.settings");
  return { title: t("label") };
}

export default function SettingsPage() {
  return <SettingsForms />;
}
