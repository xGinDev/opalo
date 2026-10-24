import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tag } from "@/components/opal/tag";
import { ClaimLinkForm } from "./claim-link-form";
import { HeroProfileCard } from "./hero-profile-card";
import { Reveal } from "./reveal";

/** Figma 3:24 "Hero". */
export function Hero() {
  const t = useTranslations("Landing.hero");
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-4 pt-14 pb-20 sm:px-8 lg:grid-cols-[minmax(0,660px)_460px] lg:justify-between lg:px-20 lg:pt-24 lg:pb-[120px]">
      <Reveal immediate className="flex flex-col items-start gap-7">
        <Tag>{t("tag")}</Tag>
        <h1 className="text-[44px] leading-[0.98] font-extrabold tracking-[-0.03em] sm:text-6xl lg:text-[76px]">
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
        </h1>
        <p className="max-w-[540px] text-[17px] leading-normal text-muted-foreground sm:text-[19px]">{t("lead")}</p>
        <ClaimLinkForm />
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Check className="size-4 shrink-0 text-success" aria-hidden />
          {t("note")}
        </p>
      </Reveal>

      <Reveal immediate delay={0.15}>
        <HeroProfileCard bio={t("sampleBio")} location={t("sampleLocation")} />
      </Reveal>
    </section>
  );
}
