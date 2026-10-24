"use client";

import { Gem } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";
import { useMessageText } from "@/i18n/use-message-text";
import { PREMIUM_PRICE_USD } from "@/lib/plans";

/** Shown when a free user picks a Premium-only option. `feature` is a message key or text. */
export function PremiumDialog({ feature, onClose }: { feature: string | null; onClose: () => void }) {
  const t = useTranslations("Panel.premiumDialog");
  const text = useMessageText();
  return (
    <Dialog open={feature !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <span className="mb-1 flex size-11 items-center justify-center rounded-md bg-lilac/14 text-lilac">
            <Gem className="size-[22px]" aria-hidden />
          </span>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("body", { feature: feature ? text(feature) : t("allFeatures"), price: PREMIUM_PRICE_USD })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t("later")}
          </Button>
          <Button variant="opal" asChild>
            <Link href="/panel/premium" onClick={onClose}>
              {t("see")}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
