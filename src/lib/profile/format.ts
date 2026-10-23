const numberFormat = new Intl.NumberFormat("es-CO");

/** 48210 → "48.210" */
export function formatCount(value: number) {
  return numberFormat.format(value);
}

/** 94 → "1:34" */
export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** "se unió hace 10 meses" */
export function joinedAgo(createdAt: string, now = Date.now()) {
  const days = Math.max(0, Math.round((now - new Date(createdAt).getTime()) / 86_400_000));
  if (days < 1) return "se unió hoy";
  if (days < 30) return `se unió ${relative.format(-days, "day")}`;
  if (days < 365) return `se unió ${relative.format(-Math.round(days / 30), "month")}`;
  return `se unió ${relative.format(-Math.round(days / 365), "year")}`;
}

/** The bio rotates phrases separated by "|". */
export function bioPhrases(bio: string | null | undefined) {
  return (bio ?? "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
}

export const DEFAULT_ENTER_TEXT = "toca para entrar";

/** Tab title of a profile: custom text or "@username". */
export function tabTitleOf(settings: { tab_title?: string | null }, username: string) {
  return settings.tab_title?.trim() || `@${username}`;
}
