"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Monitor, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfilePreview } from "@/components/opal/profile-preview";
import { ProfileView } from "@/components/profile/profile-view";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { profileUrl } from "@/lib/username";
import { cn } from "@/lib/utils";
import { type PreviewMode, usePanel } from "./panel-provider";

/** Virtual desktop viewport: wide enough for the @3xl layout (card, border, opacity, tilt). */
const DESKTOP = { width: 1280, height: 800 };

/** Renders the profile at desktop size and scales it down to fit its container. */
function ScaledDesktop({ className }: { className?: string }) {
  const { preview } = usePanel();
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.26);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / DESKTOP.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className={cn("relative w-full overflow-hidden", className)} style={{ height: DESKTOP.height * scale }}>
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: DESKTOP.width, height: DESKTOP.height, transform: `scale(${scale})` }}
      >
        <ProfileView data={preview} variant="preview" />
      </div>
    </div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  const { data } = usePanel();
  return (
    <div className="w-full overflow-hidden rounded-[14px] border-4 border-white/12 bg-[#120f1a]">
      <div className="flex items-center gap-2 border-b border-white/8 bg-surface px-2.5 py-1.5" aria-hidden>
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-danger/70" />
          <span className="size-1.5 rounded-full bg-gold/70" />
          <span className="size-1.5 rounded-full bg-success/70" />
        </span>
        <span className="flex-1 truncate rounded-full bg-background px-2 py-0.5 text-center text-[10px] text-muted-foreground">
          {profileUrl(data.profile.username).replace("https://", "")}
        </span>
      </div>
      {children}
    </div>
  );
}

function ModeToggle({ value, onChange }: { value: PreviewMode; onChange: (mode: PreviewMode) => void }) {
  const t = useTranslations("Panel.preview");
  const options = [
    { value: "mobile" as const, label: t("mobile"), icon: Smartphone },
    { value: "desktop" as const, label: t("desktop"), icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label={t("size")} className="flex gap-0.5 rounded-sm bg-surface p-0.5">
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          aria-label={label}
          title={label}
          onClick={() => onChange(v)}
          className={cn(
            "rounded-[6px] p-1.5 transition-colors",
            value === v ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}

/** Live preview column: phone frame (mobile layout) or a scaled desktop browser. */
export function LivePreview() {
  const t = useTranslations("Panel.preview");
  const { preview, previewMode, setPreviewMode } = usePanel();
  const [expanded, setExpanded] = useState(false);

  return (
    <div data-slot="live-preview" className="flex w-[340px] max-w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          {t("live")}
        </p>
        <div className="flex items-center gap-1.5">
          {previewMode === "desktop" && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("expand")}
              title={t("expandShort")}
            >
              <Maximize2 className="size-4" aria-hidden />
            </button>
          )}
          <ModeToggle value={previewMode} onChange={setPreviewMode} />
        </div>
      </div>

      {previewMode === "mobile" ? (
        <ProfilePreview showLabel={false}>
          <ProfileView data={preview} variant="preview" />
        </ProfilePreview>
      ) : (
        <>
          <BrowserFrame>
            <ScaledDesktop />
          </BrowserFrame>
          <p className="text-xs text-muted-foreground">{t("desktopNote")}</p>
        </>
      )}

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          className="w-[min(1100px,94vw)] max-w-none border-line p-3 sm:max-w-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">{t("desktopTitle")}</DialogTitle>
          <DialogDescription className="sr-only">{t("desktopDescription")}</DialogDescription>
          {expanded && (
            <BrowserFrame>
              <ScaledDesktop />
            </BrowserFrame>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
