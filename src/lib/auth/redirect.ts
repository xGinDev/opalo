import "server-only";
import { headers } from "next/headers";

/** Only allow same-site relative paths as post-auth destinations (no open redirects). */
export function safeNext(next: string | null | undefined, fallback = "/panel") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/** Origin of the current request, so auth emails and OAuth come back to the same host (localhost or opalo.me). */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
