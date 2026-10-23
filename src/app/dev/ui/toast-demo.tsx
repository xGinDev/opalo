"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => toast.success("Cambios guardados")}>
        Toast de éxito
      </Button>
      <Button variant="secondary" onClick={() => toast.error("Esta función es solo para Premium")}>
        Toast de error
      </Button>
      <Button variant="secondary" onClick={() => toast("Usuario de Discord copiado")}>
        Toast simple
      </Button>
    </div>
  );
}
