"use client";

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
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tienes cambios sin guardar</DialogTitle>
          <DialogDescription>Si sales ahora, se perderán.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={onDiscard}>
            Descartar
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Seguir editando
            </Button>
            <Button variant="opal" onClick={onSave} disabled={saving}>
              Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
