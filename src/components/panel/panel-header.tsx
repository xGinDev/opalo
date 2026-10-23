"use client";

import { usePathname } from "next/navigation";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { profilePath, profileUrl } from "@/lib/username";
import { sectionFor } from "./nav";
import { usePanel } from "./panel-provider";

/** Figma 7:300 "Encabezado": title, share link, "Ver mi página" and "Guardar cambios". */
export function PanelHeader() {
  const section = sectionFor(usePathname());
  const { data, dirty, saving, save } = usePanel();
  const url = profileUrl(data.profile.username);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch {
      toast(url);
    }
  }

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.015em] sm:text-[32px]">{section.label}</h1>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={copyLink}
          className="flex max-w-full items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm font-bold transition-colors hover:bg-surface-2"
          aria-label={`Copiar enlace ${url}`}
        >
          <LinkIcon className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{url.replace("https://", "")}</span>
        </button>
        <Button variant="secondary" asChild>
          <a href={profilePath(data.profile.username)} target="_blank" rel="noopener noreferrer">
            Ver mi página
          </a>
        </Button>
        {section.save && (
          <Button variant="opal" onClick={save} disabled={!dirty || saving}>
            {saving && <Loader2 className="animate-spin" aria-hidden />}
            {dirty ? "Guardar cambios" : "Guardado"}
          </Button>
        )}
      </div>
    </header>
  );
}
