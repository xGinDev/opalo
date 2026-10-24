/** 48210 → "48.210" (es) / "48,210" (en). */
export function formatCount(value: number, locale = "es-CO") {
  return new Intl.NumberFormat(locale).format(value);
}

/** 94 → "1:34" */
export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * How long ago the account was created, in the visitor's language ("hace 10 meses", "10 months ago"),
 * or null for today. The sentence around it ("se unió …") lives in Profile.joined.
 */
export function joinedRelative(createdAt: string, locale: string, now = Date.now()) {
  const days = Math.max(0, Math.round((now - new Date(createdAt).getTime()) / 86_400_000));
  if (days < 1) return null;
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (days < 30) return relative.format(-days, "day");
  if (days < 365) return relative.format(-Math.round(days / 30), "month");
  return relative.format(-Math.round(days / 365), "year");
}

/** The bio rotates phrases separated by "|". */
export function bioPhrases(bio: string | null | undefined) {
  return (bio ?? "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Tab title of a profile: custom text or "@username". */
export function tabTitleOf(settings: { tab_title?: string | null }, username: string) {
  return settings.tab_title?.trim() || `@${username}`;
}
