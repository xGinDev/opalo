import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GlowBackdrop } from "@/components/profile/glow-backdrop";
import { Button } from "@/components/ui/button";

export const metadata = { title: "No encontrado" };

/** 404 in Ópalo style: missing pages and missing or suspended profiles. */
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-4 text-center">
      <GlowBackdrop className="-z-10" />
      <Logo href="/" />
      <p className="text-opal font-display text-[96px] leading-none font-extrabold tracking-[-0.04em] sm:text-[140px]">404</p>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Aquí no hay nada… todavía</h1>
        <p className="text-muted-foreground">
          Esta página no existe, o el perfil que buscas no está disponible. Si el nombre está libre, puede ser tuyo.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="opal" asChild>
          <Link href="/registro">Crear mi página</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
