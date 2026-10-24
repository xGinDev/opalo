import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, localePrefix, routing, type Locale } from "@/i18n/routing";
import { refreshSession, withSessionCookies } from "@/lib/supabase/proxy";

const intl = createIntlMiddleware(routing);

/** Not localized: handled as-is (session refresh only). */
const BYPASS = ["/api", "/auth", "/admin", "/dev", "/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/icon.svg"];
/** First path segments of localized app pages; any other single segment is a profile. */
const APP_SEGMENTS = new Set(["terminos", "privacidad", "contacto", "login", "registro", "recuperar", "panel"]);
// /admin is deliberately not protected here: anonymous visitors get the same 404 as non-admins.
const PROTECTED = ["/panel"];
const AUTH_PAGES = ["/login", "/registro"];

const starts = (path: string, prefixes: string[]) => prefixes.some((p) => path === p || path.startsWith(`${p}/`));

/** Visitor's language for profiles: the cookie set by next-intl, else Accept-Language, else Spanish. */
function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(cookie)) return cookie;
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}

/** "/en/panel" → { locale: "en", path: "/panel" }; "/panel" → { locale: "es", path: "/panel" }. */
function splitLocale(pathname: string): { locale: Locale; path: string } {
  const first = pathname.split("/")[1];
  if (isLocale(first)) return { locale: first, path: pathname.slice(first.length + 1) || "/" };
  return { locale: defaultLocale, path: pathname };
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await refreshSession(request);

  if (starts(pathname, BYPASS)) {
    return withSessionCookies(NextResponse.next({ request }), session.cookies);
  }

  // Profiles keep their URL (opalo.me/nico) in every language: rewrite to the visitor's locale.
  const first = pathname.split("/")[1] ?? "";
  if (first && !isLocale(first) && !APP_SEGMENTS.has(first)) {
    const locale = preferredLocale(request);
    const target = new URL(`/${locale}${pathname}${search}`, request.url);
    return withSessionCookies(NextResponse.rewrite(target, { request }), session.cookies);
  }

  const { locale: urlLocale, path } = splitLocale(pathname);
  const prefix = localePrefix(urlLocale);
  const redirectTo = (target: string) =>
    withSessionCookies(NextResponse.redirect(new URL(`${prefix}${target}`, request.url)), session.cookies);

  // Auth guards, on the path without the language prefix.
  if (!session.isSignedIn && path === "/panel/premium") {
    // "Obtener Premium" without an account: sign up first, then come back here.
    return redirectTo("/registro?plan=premium");
  }
  if (!session.isSignedIn && starts(path, PROTECTED)) {
    return redirectTo(`/login?next=${encodeURIComponent(prefix + path + search)}`);
  }
  if (session.isSignedIn && starts(path, AUTH_PAGES)) {
    const params = request.nextUrl.searchParams;
    const next = params.get("next");
    if (params.get("plan") === "premium") return redirectTo("/panel/premium");
    const isSafe = next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
    return withSessionCookies(NextResponse.redirect(new URL(isSafe ? next! : `${prefix}/panel`, request.url)), session.cookies);
  }

  // next-intl: language detection, /es → / redirects and the internal /es rewrite.
  const intlResponse = intl(request);
  if (intlResponse.headers.get("location")) return withSessionCookies(intlResponse, session.cookies);

  // Rebuild rewrites with `{ request }` so Server Components read the refreshed session cookies.
  const rewrite = intlResponse.headers.get("x-middleware-rewrite");
  const response = rewrite ? NextResponse.rewrite(new URL(rewrite), { request }) : NextResponse.next({ request });
  intlResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return withSessionCookies(response, session.cookies);
}

export const config = {
  matcher: [
    // Everything except static assets, tracking beacons and the payment webhook (no session needed).
    "/((?!_next/static|_next/image|favicon.ico|brand/|api/payments/webhook|api/track/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|webm)$).*)",
  ],
};

