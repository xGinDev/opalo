import { useTranslations } from "next-intl";
import { Reveal } from "./reveal";

/** Message keys under Landing.faq.items (also used for the FAQPage structured data). */
export const FAQ_KEYS = ["oneTime", "username", "payment", "business"] as const;

/** Figma 5:263 "Preguntas". */
export function Faq() {
  const t = useTranslations("Landing.faq");
  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      className="mx-auto grid max-w-[1440px] scroll-mt-24 gap-8 px-4 pt-10 pb-20 sm:px-8 lg:grid-cols-[420px_1fr] lg:gap-20 lg:px-20 lg:pt-[60px] lg:pb-[110px]"
    >
      <Reveal>
        <h2 id="preguntas-title" className="text-4xl leading-[1.05] font-bold tracking-[-0.025em] sm:text-[50px]">
          {t("titleLine1")}
          <br className="hidden lg:block" /> {t("titleLine2")}
        </h2>
      </Reveal>
      <dl className="flex flex-col">
        {FAQ_KEYS.map((key, index) => (
          <Reveal key={key} delay={index * 0.05} className="flex flex-col gap-2.5 border-b border-line py-6">
            <dt className="text-lg font-bold">{t(`items.${key}.q`)}</dt>
            <dd className="max-w-[640px] text-[15px] leading-[1.55] text-muted-foreground">{t(`items.${key}.a`)}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
