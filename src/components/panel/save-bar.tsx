"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePanel } from "./panel-provider";

/**
 * Floating "unsaved changes" bar pinned to the bottom of the editor column, so saving never
 * needs a scroll back to the header. Ctrl/⌘+S saves too.
 */
export function SaveBar({ aboveMobileButton }: { aboveMobileButton: boolean }) {
  const { dirty, saving, save, discard } = usePanel();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  return (
    <div
      className={cn(
        "pointer-events-none sticky z-40 flex justify-center",
        // The mobile "Vista previa" button sits at the bottom right; stay above it.
        aboveMobileButton ? "bottom-[76px] xl:bottom-5" : "bottom-5",
      )}
    >
      <AnimatePresence>
        {dirty && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-[560px] items-center gap-3 rounded-2xl border border-line bg-surface/90 py-2.5 pr-2.5 pl-4 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <span className="size-2 shrink-0 rounded-full bg-gold" aria-hidden />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">
              <span className="sm:hidden">Sin guardar</span>
              <span className="hidden sm:inline">Tienes cambios sin guardar</span>
            </p>
            <Button variant="ghost" size="sm" onClick={discard} disabled={saving}>
              Descartar
            </Button>
            <Button variant="opal" size="sm" onClick={save} disabled={saving}>
              {saving && <Loader2 className="animate-spin" aria-hidden />}
              Guardar cambios
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
