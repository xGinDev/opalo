import { messageKey } from "@/i18n/message-key";
import { createClient } from "@/lib/supabase/client";

/** Mirrors the bucket limits in 0001_init.sql. */
export const BUCKETS = {
  avatars: { maxBytes: 5 * 1024 * 1024, types: ["image/png", "image/jpeg", "image/webp", "image/gif"] },
  backgrounds: {
    maxBytes: 50 * 1024 * 1024,
    types: ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/webm"],
  },
  music: { maxBytes: 15 * 1024 * 1024, types: ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav"] },
} as const;

export type Bucket = keyof typeof BUCKETS;

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

/** Returns a message key (Panel.upload.*) when the file can't be uploaded, else null. */
export function validateFile(bucket: Bucket, file: Blob): string | null {
  const { maxBytes, types } = BUCKETS[bucket];
  if (!(types as readonly string[]).includes(file.type)) return "Panel.upload.typeNotAllowed";
  if (file.size > maxBytes) return messageKey("Panel.upload.tooBig", { mb: Math.round(maxBytes / 1024 / 1024) });
  return null;
}

/** Uploads to `<bucket>/<userId>/<name>-<timestamp>.<ext>` and returns the public URL. */
export async function uploadUserFile(
  bucket: Bucket,
  userId: string,
  file: Blob,
  name: string,
): Promise<{ url: string } | { error: string }> {
  const invalid = validateFile(bucket, file);
  if (invalid) return { error: invalid };

  const supabase = createClient();
  const path = `${userId}/${name}-${Date.now()}.${EXT[file.type] ?? "bin"}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

  if (error) {
    if (/row-level security|unauthorized|403/i.test(error.message)) {
      return { error: "Panel.upload.premiumOnly" };
    }
    if (/too large|413|exceeded/i.test(error.message)) return { error: "Panel.upload.tooLarge" };
    return { error: "Panel.upload.failed" };
  }
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}
