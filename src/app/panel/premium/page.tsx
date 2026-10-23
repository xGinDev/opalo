import { Gem } from "lucide-react";
import { PlanCard } from "@/components/opal/plan-card";
import { Tag } from "@/components/opal/tag";
import { PanelCard } from "@/components/panel/editor-ui";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/profile/format";
import { premiumPriceCop } from "@/lib/payments/price";
import { FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Premium" };

const longDate = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" });

type Props = { searchParams: Promise<{ error?: string }> };

/** Plan comparison and purchase (hosted checkout via /api/payments/checkout). */
export default async function PremiumPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_since")
    .eq("id", claims?.claims.sub ?? "")
    .single();

  if (profile?.plan === "premium") {
    return (
      <PanelCard title="Ya eres Premium" description="Gracias por apoyar Ópalo.">
        <div className="flex flex-col items-start gap-4 rounded-lg p-6 border-opal [--opal-border-fill:var(--opal-surface-2)]">
          <span className="flex size-12 items-center justify-center rounded-full bg-opal text-on-accent">
            <Gem className="size-6" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold">Ópalo Premium, de por vida</p>
            {profile.premium_since && (
              <p className="text-sm text-muted-foreground">
                Compraste Premium el {longDate.format(new Date(profile.premium_since))}.
              </p>
            )}
          </div>
          <Tag>Pago único · sin renovaciones</Tag>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {PREMIUM_FEATURES.slice(1).map((f) => (
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
          No pudimos abrir el pago. Inténtalo de nuevo en unos minutos.
        </p>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <PlanCard
          name="Gratis"
          tag="Tu plan"
          price="$0"
          period="para siempre"
          description="Todo lo básico para tener tu página lista hoy."
          features={FREE_FEATURES}
          action={
            <Button variant="secondary" disabled>
              Plan actual
            </Button>
          }
        />
        <PlanCard
          highlighted
          name="Premium"
          tag="Pago único"
          price="$10"
          period="USD, de por vida"
          description="Desbloquea todo sin suscripciones ni cobros mensuales."
          features={PREMIUM_FEATURES}
          action={
            <form action="/api/payments/checkout" method="post" className="flex flex-col gap-2">
              <Button type="submit" variant="opal" className="w-full">
                Obtener Premium
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Pagas con Wompi: tarjeta, PSE o Nequi. Se cobra en pesos: ${formatCount(premiumPriceCop())} COP.
              </p>
            </form>
          }
        />
      </div>
    </>
  );
}
