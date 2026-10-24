"use client";

import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePathname } from "@/i18n/navigation";
import { profilePath, profileUrl } from "@/lib/username";
import { sectionFor } from "./nav";
import { usePanel } from "./panel-provider";

/** Figma 7:300 "Encabezado": title, share link, "Ver mi página" and "Guardar cambios". */
export function PanelHeader() {
  const t = useTranslations("Panel");
  const section = sectionFor(usePathname());
  const { data, dirty, saving, save } = usePanel();
  const url = profileUrl(data.profile.username);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("header.linkCopied"));
    } catch {
      toast(url);
    }
  }

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.015em] sm:text-[32px]">{t(`nav.sections.${section.key}.label`)}</h1>
        <p className="text-sm text-muted-foreground">{t(`nav.sections.${section.key}.description`)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={copyLink}
          className="flex max-w-full items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm font-bold transition-colors hover:bg-surface-2"
          aria-label={t("header.copyLink", { url })}
        >
          <LinkIcon className="size-4 shrink-0" aria-hidden />
          <span dir="ltr" className="truncate">{url.replace("https://", "")}</span>
        </button>
        <Button variant="secondary" asChild>
          <a href={profilePath(data.profile.username)} target="_blank" rel="noopener noreferrer">
            {t("header.viewPage")}
          </a>
        </Button>
        {section.save && (
          <Button variant="opal" onClick={save} disabled={!dirty || saving}>
            {saving && <Loader2 className="animate-spin" aria-hidden />}
            {dirty ? t("header.save") : t("header.saved")}
          </Button>
        )}
      </div>
    </header>
  );
}
