import { useTranslations } from "next-intl";
import { PlanCard } from "@/components/opal/plan-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/** Figma 5:169 "Precios". */
export function Pricing() {
  const t = useTranslations("Landing.pricing");
  const plans = useTranslations("Plans");
  return (
    <section
      id="precios"
      aria-labelledby="precios-title"
      className="mx-auto flex max-w-[1440px] scroll-mt-24 flex-col items-center gap-10 px-4 py-20 sm:px-8 lg:gap-14 lg:px-20 lg:py-[110px]"
    >
      <SectionHeading id="precios-title" align="center" title={t("title")} description={t("description")} />
      <div className="grid w-full max-w-[864px] items-start gap-6 md:grid-cols-2">
        <Reveal>
          <PlanCard
            name={t("free.name")}
            price="$0"
            period={t("free.period")}
            description={t("free.description")}
            features={plans.raw("free") as string[]}
            action={
              <Button variant="secondary" asChild>
                <Link href="/registro">{t("free.cta")}</Link>
              </Button>
            }
          />
        </Reveal>
        <Reveal delay={0.08}>
          <PlanCard
            highlighted
            name={t("premium.name")}
            tag={t("premium.tag")}
            price="$10"
            period={t("premium.period")}
            description={t("premium.description")}
            features={plans.raw("premium") as string[]}
            action={
              <Button variant="opal" asChild>
                {/* Route handler (redirects to the gateway, or to sign-up without a session): a full navigation, not a page. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/api/payments/checkout">{t("premium.cta")}</a>
              </Button>
            }
          />
        </Reveal>
      </div>
    </section>
  );
}
