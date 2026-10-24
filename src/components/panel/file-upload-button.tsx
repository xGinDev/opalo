"use client";

import { useRef, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMessageText } from "@/i18n/use-message-text";
import { BUCKETS, type Bucket, uploadUserFile } from "@/lib/panel/storage";
import { usePanel } from "./panel-provider";

type FileUploadButtonProps = {
  bucket: Bucket;
  name: string;
  label: string;
  /** Narrows the bucket's allowed types (e.g. only audio/mpeg). */
  accept?: string[];
  onUploaded: (url: string, file: File) => void;
  /** Optional processing before upload (e.g. crop and compress an image). */
  transform?: (file: File) => Promise<Blob>;
};

/** Uploads straight to Supabase Storage under the user's folder. */
export function FileUploadButton({ bucket, name, label, accept, onUploaded, transform }: FileUploadButtonProps) {
  const { data } = usePanel();
  const t = useTranslations("Panel.upload");
  const text = useMessageText();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const types = accept ?? [...BUCKETS[bucket].types];

  function upload(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const blob = transform ? await transform(file).catch(() => file) : file;
      const result = await uploadUserFile(bucket, data.profile.id, blob, name);
      if ("error" in result) toast.error(text(result.error));
      else onUploaded(result.url, file);
    });
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
        {isPending ? t("uploading") : text(label)}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={types.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );
}
