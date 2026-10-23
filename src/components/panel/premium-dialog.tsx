"use client";

import Link from "next/link";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PREMIUM_PRICE_USD } from "@/lib/plans";

/** Shown when a free user picks a Premium-only option. */
export function PremiumDialog({ feature, onClose }: { feature: string | null; onClose: () => void }) {
  return (
    <Dialog open={feature !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <span className="mb-1 flex size-11 items-center justify-center rounded-md bg-lilac/14 text-lilac">
            <Gem className="size-[22px]" aria-hidden />
          </span>
          <DialogTitle>Esto es de Premium</DialogTitle>
          <DialogDescription>
            Desbloquea {feature ?? "todas las funciones"} y todo lo demás de Premium por {PREMIUM_PRICE_USD} USD. Un solo
            pago y es tuyo para siempre.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Ahora no
          </Button>
          <Button variant="opal" asChild>
            <Link href="/panel/premium" onClick={onClose}>
              Ver Premium
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
