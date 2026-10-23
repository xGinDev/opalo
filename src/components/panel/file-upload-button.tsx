"use client";

import { useRef, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BUCKETS, type Bucket, uploadUserFile } from "@/lib/panel/storage";
import { usePanel } from "./panel-provider";

type FileUploadButtonProps = {
  bucket: Bucket;
  name: string;
  label: string;
  /** Narrows the bucket's allowed types (e.g. only audio/mpeg). */
  accept?: string[];
  onUploaded: (url: string, file: File) => void;
};

/** Uploads straight to Supabase Storage under the user's folder. */
export function FileUploadButton({ bucket, name, label, accept, onUploaded }: FileUploadButtonProps) {
  const { data } = usePanel();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const types = accept ?? [...BUCKETS[bucket].types];

  function upload(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const result = await uploadUserFile(bucket, data.profile.id, file, name);
      if ("error" in result) toast.error(result.error);
      else onUploaded(result.url, file);
    });
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
        {isPending ? "Subiendo…" : label}
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
