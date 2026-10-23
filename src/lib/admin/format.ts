const shortDate = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });
const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** "12 ago 2026" */
export function formatDate(iso: string) {
  return shortDate.format(new Date(iso)).replace(".", "");
}

/** "hace 12 min", "hace 3 h", "ayer"… */
export function timeAgo(iso: string, now: number) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "justo ahora";
  if (abs < 3600) return `hace ${Math.round(abs / 60)} min`;
  if (abs < 86_400) return `hace ${Math.round(abs / 3600)} h`;
  return relative.format(Math.round(seconds / 86_400), "day");
}

const compact = new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 1 });

/** 1_200_000 → "1,2 M" */
export function formatCompact(value: number) {
  return value >= 10_000 ? compact.format(value) : new Intl.NumberFormat("es-CO").format(value);
}

export function formatUsd(value: number) {
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)} USD`;
}

/** Request time for server components ("hace 12 min"). Kept out of render so it reads as data. */
export function requestTime() {
  return Date.now();
}
