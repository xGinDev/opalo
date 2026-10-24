import type { Metadata } from "next";
import { Gem } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PlanCard } from "@/components/opal/plan-card";
import { Tag } from "@/components/opal/tag";
import { PanelCard } from "@/components/panel/editor-ui";
import { Button } from "@/components/ui/button";
import { premiumPriceCop } from "@/lib/payments/price";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel.premium");
  return { title: t("metaTitle") };
}

type Props = { searchParams: Promise<{ error?: string }> };

/** Plan comparison and purchase (hosted checkout via /api/payments/checkout). */
export default async function PremiumPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const [t, pricing, plans, format] = await Promise.all([
    getTranslations("Panel.premium"),
    getTranslations("Landing.pricing"),
    getTranslations("Plans"),
    getFormatter(),
  ]);
  const freeFeatures = plans.raw("free") as string[];
  const premiumFeatures = plans.raw("premium") as string[];

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_since")
    .eq("id", claims?.claims.sub ?? "")
    .single();

  if (profile?.plan === "premium") {
    return (
      <PanelCard title={t("alreadyTitle")} description={t("alreadyDescription")}>
        <div className="flex flex-col items-start gap-4 rounded-lg p-6 border-opal [--opal-border-fill:var(--opal-surface-2)]">
          <span className="flex size-12 items-center justify-center rounded-full bg-opal text-on-accent">
            <Gem className="size-6" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold">{t("lifetime")}</p>
            {profile.premium_since && (
              <p className="text-sm text-muted-foreground">
                {t("purchasedOn", {
                  date: format.dateTime(new Date(profile.premium_since), { day: "numeric", month: "long", year: "numeric" }),
                })}
              </p>
            )}
          </div>
          <Tag>{t("oneTimeTag")}</Tag>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {premiumFeatures.slice(1).map((f) => (
            <li key={f} className="rounded-md bg-surface-2 px-4 py-3 text-sm font-medium">
              {f}
            </li>
          ))}
        </ul>
      </PanelCard>
    );
  }

  return (
    <>
      {error === "checkout" && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {t("checkoutError")}
        </p>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <PlanCard
          name={pricing("free.name")}
          tag={t("yourPlan")}
          price="$0"
          period={pricing("free.period")}
          description={pricing("free.description")}
          features={freeFeatures}
          action={
            <Button variant="secondary" disabled>
              {t("currentPlan")}
            </Button>
          }
        />
        <PlanCard
          highlighted
          name={pricing("premium.name")}
          tag={pricing("premium.tag")}
          price="$10"
          period={pricing("premium.period")}
          description={pricing("premium.description")}
          features={premiumFeatures}
          action={
            <form action="/api/payments/checkout" method="post" className="flex flex-col gap-2">
              <Button type="submit" variant="opal" className="w-full">
                {pricing("premium.cta")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t("payNote", { amount: format.number(premiumPriceCop()) })}
              </p>
            </form>
          }
        />
      </div>
    </>
  );
}
