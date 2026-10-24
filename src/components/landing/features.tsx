import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { opalIcons } from "@/components/opal/icons";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const FEATURES: { key: string; icon: LucideIcon }[] = [
  { key: "background", icon: opalIcons.play },
  { key: "music", icon: opalIcons.music },
  { key: "effects", icon: opalIcons.palette },
  { key: "presence", icon: opalIcons.chat },
  { key: "stats", icon: opalIcons.chart },
  { key: "link", icon: opalIcons.link },
];

/** Figma 5:43 "Funciones". */
export function Features() {
  const t = useTranslations("Landing.features");
  return (
    <section
      id="funciones"
      aria-labelledby="funciones-title"
      className="mx-auto flex max-w-[1440px] scroll-mt-24 flex-col gap-10 px-4 py-20 sm:px-8 lg:gap-14 lg:px-20 lg:py-[110px]"
    >
      <SectionHeading id="funciones-title" title={t("title")} description={t("description")} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {FEATURES.map(({ key, icon: Icon }, index) => (
          <Reveal
            as="li"
            key={key}
            delay={(index % 3) * 0.08}
            className="flex flex-col items-start gap-3.5 rounded-xl border border-line bg-surface px-7 pt-7 pb-[30px]"
          >
            <span className="rounded-md bg-lilac/14 p-[11px] text-lilac">
              <Icon className="size-[22px]" strokeWidth={1.75} aria-hidden />
            </span>
            <h3 className="font-sans text-[19px] font-bold">{t(`items.${key}.title`)}</h3>
            <p className="text-[15px] leading-normal text-muted-foreground">{t(`items.${key}.description`)}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
