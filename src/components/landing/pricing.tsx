import Link from "next/link";
import { PlanCard } from "@/components/opal/plan-card";
import { Button } from "@/components/ui/button";
import { FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/plans";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/** Figma 5:169 "Precios". */
export function Pricing() {
  return (
    <section
      id="precios"
      aria-labelledby="precios-title"
      className="mx-auto flex max-w-[1440px] scroll-mt-24 flex-col items-center gap-10 px-4 py-20 sm:px-8 lg:gap-14 lg:px-20 lg:py-[110px]"
    >
      <SectionHeading
        id="precios-title"
        align="center"
        title="Precios simples"
        description="Empieza gratis. Si quieres todo, pagas una vez y es tuyo para siempre."
      />
      <div className="grid w-full max-w-[864px] items-start gap-6 md:grid-cols-2">
        <Reveal>
          <PlanCard
            name="Gratis"
            price="$0"
            period="para siempre"
            description="Todo lo básico para tener tu página lista hoy."
            features={FREE_FEATURES}
            action={
              <Button variant="secondary" asChild>
                <Link href="/registro">Empezar gratis</Link>
              </Button>
            }
          />
        </Reveal>
        <Reveal delay={0.08}>
          <PlanCard
            highlighted
            name="Premium"
            tag="Pago único"
            price="$10"
            period="USD, de por vida"
            description="Desbloquea todo sin suscripciones ni cobros mensuales."
            features={PREMIUM_FEATURES}
            action={
              <Button variant="opal" asChild>
                {/* Route handler (redirects to the gateway, or to sign-up without a session): a full navigation, not a page. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/api/payments/checkout">Obtener Premium</a>
              </Button>
            }
          />
        </Reveal>
      </div>
    </section>
  );
}
