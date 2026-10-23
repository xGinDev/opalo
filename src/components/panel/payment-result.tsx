"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Clock, Gem, Sparkle, XCircle } from "lucide-react";
import { Tag } from "@/components/opal/tag";
import { Button } from "@/components/ui/button";

type Status = "paid" | "pending" | "failed" | "unknown";

const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  return { x: Math.cos(angle) * 120, y: Math.sin(angle) * 120, delay: 0.35 + (i % 5) * 0.06, size: 10 + (i % 3) * 4 };
});

/** Return screen after the hosted checkout. Pending payments re-check every 4 s for a minute. */
export function PaymentResult({ status }: { status: Status }) {
  const router = useRouter();
  const reduce = useReducedMotion();

  // The layout may have rendered before the payment was recorded: refresh once to load Premium.
  const refreshed = useRef(false);
  useEffect(() => {
    if (status !== "paid" || refreshed.current) return;
    refreshed.current = true;
    router.refresh();
  }, [status, router]);

  useEffect(() => {
    if (status !== "pending") return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (tries > 15) clearInterval(timer);
      else router.refresh();
    }, 4000);
    return () => clearInterval(timer);
  }, [status, router]);

  if (status === "paid") {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl px-6 py-14 text-center border-opal [--opal-border-fill:var(--opal-surface)]">
        <div className="relative flex size-28 items-center justify-center">
          {!reduce &&
            SPARKS.map((s, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute text-lilac"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.3, 1, 0.6] }}
                transition={{ duration: 1.4, delay: s.delay, ease: "easeOut" }}
              >
                <Sparkle style={{ width: s.size, height: s.size }} fill="currentColor" strokeWidth={0} />
              </motion.span>
            ))}
          <motion.span
            className="flex size-28 items-center justify-center rounded-full bg-opal text-on-accent shadow-[0_0_60px_rgba(185,167,255,0.55)]"
            initial={reduce ? false : { scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
          >
            <Gem className="size-12" aria-hidden />
          </motion.span>
        </div>
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <Tag tone="opal">Premium</Tag>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">¡Ya eres Premium!</h2>
          <p className="max-w-md text-muted-foreground">
            Gracias por apoyar Ópalo. Desbloqueaste fondos en video, música, todos los efectos y redes ilimitadas, para
            siempre.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button variant="opal" asChild>
              <Link href="/panel/apariencia">Personalizar mi perfil</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/panel/musica">Subir mi canción</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
        <Clock className="size-10 animate-pulse text-gold" aria-hidden />
        <h2 className="text-2xl font-bold">Estamos confirmando tu pago</h2>
        <p className="max-w-md text-muted-foreground">
          Algunos métodos (como PSE) tardan unos minutos. Esta página se actualiza sola; también te avisaremos al
          activarse Premium.
        </p>
      </div>
    );
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <XCircle className="size-10 text-danger" aria-hidden />
      <h2 className="text-2xl font-bold">{status === "failed" ? "El pago no se completó" : "No encontramos ese pago"}</h2>
      <p className="max-w-md text-muted-foreground">
        {status === "failed"
          ? "La pasarela rechazó o canceló el pago. No se hizo ningún cobro; puedes intentarlo de nuevo."
          : "Si ya pagaste, espera unos minutos y revisa tu plan. Si el problema sigue, escríbenos a soporte@opalo.me."}
      </p>
      <Button variant="opal" asChild>
        <Link href="/panel/premium">Volver a Premium</Link>
      </Button>
    </div>
  );
}
