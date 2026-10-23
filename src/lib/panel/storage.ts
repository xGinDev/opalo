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

export function validateFile(bucket: Bucket, file: Blob): string | null {
  const { maxBytes, types } = BUCKETS[bucket];
  if (!(types as readonly string[]).includes(file.type)) return "Ese tipo de archivo no está permitido.";
  if (file.size > maxBytes) return `El archivo pesa más de ${Math.round(maxBytes / 1024 / 1024)} MB.`;
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
      return { error: "Subir fondos y música es solo para Premium." };
    }
    if (/too large|413|exceeded/i.test(error.message)) return { error: "El archivo es demasiado grande." };
    return { error: "No pudimos subir el archivo. Inténtalo de nuevo." };
  }
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}
