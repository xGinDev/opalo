import Link from "next/link";
import { GlowOrb } from "@/components/opal/glow-orb";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

/** Figma 5:279 "Llamado final". */
export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-10 pb-16 sm:px-8 lg:px-20 lg:pb-20">
      <Reveal className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl px-6 py-16 text-center border-opal [--opal-border-width:1.5px] sm:py-[72px]">
        <GlowOrb
          color="linear-gradient(90deg, #f6a8cf, #b9a7ff 50%, #8fe3dc)"
          blur={55}
          opacity={0.22}
          className="top-[118px] left-1/2 h-[300px] w-[min(700px,100%)] -translate-x-1/2"
        />
        <h2 className="relative text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[56px]">
          Tu enlace te está esperando.
        </h2>
        <p className="relative text-base text-muted-foreground sm:text-lg">
          Reserva tu nombre antes de que alguien más lo haga.
        </p>
        <Button variant="opal" asChild className="relative">
          <Link href="/registro">Crear mi página gratis</Link>
        </Button>
      </Reveal>
    </section>
  );
}
