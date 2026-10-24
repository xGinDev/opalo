"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { setAvatar } from "@/app/[locale]/panel/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useMessageText } from "@/i18n/use-message-text";
import { uploadUserFile, validateFile } from "@/lib/panel/storage";
import { usePanel } from "./panel-provider";

const VIEW = 280; // crop viewport (px)
const OUTPUT = 512; // exported avatar (px)

type Crop = { zoom: number; x: number; y: number };

/** Square crop: drag to frame, slider to zoom. Exports a 512×512 WebP. */
function CropDialog({ src, onCancel, onDone }: { src: string; onCancel: () => void; onDone: (blob: Blob) => void }) {
  const t = useTranslations("Panel.avatar");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>({ zoom: 1, x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = src;
  }, [src]);

  // Base scale makes the shorter side fill the viewport.
  const base = img ? VIEW / Math.min(img.naturalWidth, img.naturalHeight) : 1;
  const scale = base * crop.zoom;
  const w = img ? img.naturalWidth * scale : VIEW;
  const h = img ? img.naturalHeight * scale : VIEW;
  const clamp = (c: Crop): Crop => {
    const s = base * c.zoom;
    const maxX = img ? (img.naturalWidth * s - VIEW) / 2 : 0;
    const maxY = img ? (img.naturalHeight * s - VIEW) / 2 : 0;
    return { ...c, x: Math.max(-maxX, Math.min(maxX, c.x)), y: Math.max(-maxY, Math.min(maxY, c.y)) };
  };

  function exportBlob() {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d")!;
    const k = OUTPUT / VIEW;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, ((VIEW - w) / 2 + crop.x) * k, ((VIEW - h) / 2 + crop.y) * k, w * k, h * k);
    canvas.toBlob((blob) => blob && onDone(blob), "image/webp", 0.9);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("cropTitle")}</DialogTitle>
          <DialogDescription>{t("cropDescription")}</DialogDescription>
        </DialogHeader>
        <div
          className="relative mx-auto touch-none overflow-hidden rounded-full bg-surface-2"
          style={{ width: VIEW, height: VIEW, cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { startX: e.clientX, startY: e.clientY, x: crop.x, y: crop.y };
            setDragging(true);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (d) setCrop((c) => clamp({ ...c, x: d.x + e.clientX - d.startX, y: d.y + e.clientY - d.startY }));
          }}
          onPointerUp={() => {
            drag.current = null;
            setDragging(false);
          }}
        >
          {img && (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL being cropped
            <img
              src={src}
              alt={t("cropAlt")}
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none"
              style={{ width: w, height: h, left: (VIEW - w) / 2 + crop.x, top: (VIEW - h) / 2 + crop.y }}
            />
          )}
        </div>
        <Slider
          value={[crop.zoom]}
          min={1}
          max={3}
          step={0.01}
          onValueChange={([zoom]) => setCrop((c) => clamp({ ...c, zoom }))}
          aria-label={t("zoom")}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button variant="opal" onClick={exportBlob} disabled={!img}>
            {t("use")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Avatar row in "Información": upload (with crop) or remove. Saved immediately. */
export function AvatarUploader() {
  const t = useTranslations("Panel");
  const text = useMessageText();
  const { data, setSavedProfile } = usePanel();
  const { profile } = data;
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function pick(file: File | undefined) {
    if (!file) return;
    const invalid = validateFile("avatars", file);
    if (invalid) {
      toast.error(text(invalid));
      return;
    }
    setSource(URL.createObjectURL(file));
  }

  function upload(blob: Blob) {
    if (source) URL.revokeObjectURL(source);
    setSource(null);
    startTransition(async () => {
      const uploaded = await uploadUserFile("avatars", profile.id, blob, "avatar");
      if ("error" in uploaded) {
        toast.error(text(uploaded.error));
        return;
      }
      const previous = profile.avatar_url;
      setSavedProfile({ avatar_url: uploaded.url });
      const result = await setAvatar(uploaded.url);
      if (result.ok) toast.success(t("avatar.updated"));
      else {
        setSavedProfile({ avatar_url: previous });
        toast.error(text(result.error));
      }
    });
  }

  function remove() {
    const previous = profile.avatar_url;
    setSavedProfile({ avatar_url: null });
    startTransition(async () => {
      const result = await setAvatar(null);
      if (!result.ok) {
        setSavedProfile({ avatar_url: previous });
        toast.error(text(result.error));
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-3 border-white/16 bg-opal">
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element -- user upload from Supabase Storage
          <img src={profile.avatar_url} alt={t("avatar.photoAlt")} className="size-full object-cover" />
        )}
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-5 animate-spin" aria-label={t("upload.uploading")} />
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={isPending}>
          <Camera aria-hidden /> {profile.avatar_url ? t("avatar.change") : t("avatar.upload")}
        </Button>
        {profile.avatar_url && (
          <Button variant="ghost" size="sm" onClick={remove} disabled={isPending}>
            <Trash2 aria-hidden /> {t("avatar.remove")}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {source && (
        <CropDialog
          src={source}
          onCancel={() => {
            URL.revokeObjectURL(source);
            setSource(null);
          }}
          onDone={upload}
        />
      )}
    </div>
  );
}
