"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type UnsavedDialogProps = {
  open: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

/** Blocks in-panel navigation while there are unsaved changes. */
export function UnsavedDialog({ open, saving, onSave, onDiscard, onCancel }: UnsavedDialogProps) {
  const t = useTranslations("Panel.unsavedDialog");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={onDiscard}>
            {t("discard")}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel}>
              {t("keepEditing")}
            </Button>
            <Button variant="opal" onClick={onSave} disabled={saving}>
              {t("save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
