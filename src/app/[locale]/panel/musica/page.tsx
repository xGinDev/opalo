import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MusicEditor } from "@/components/panel/music-editor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel.nav.sections.music");
  return { title: t("label") };
}

export default function MusicPage() {
  return <MusicEditor />;
}
