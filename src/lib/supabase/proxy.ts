import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";
import { REMEMBER_COOKIE, applyRemember, isRemembered } from "./remember";

const PROTECTED_PREFIXES = ["/panel", "/admin"];
const AUTH_PAGES = ["/login", "/registro"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refreshes the Supabase session cookie on every request and guards private routes.
 * The admin role itself is checked server-side in the /admin layout (404 if not admin).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseEnv) return response;

  const remember = isRemembered(request.cookies.get(REMEMBER_COOKIE)?.value);

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, applyRemember(options, remember)),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  // Redirects must carry over any refreshed session cookies.
  const redirectTo = (target: string) => {
    const redirect = NextResponse.redirect(new URL(target, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!isSignedIn && pathname === "/panel/premium") {
    // "Obtener Premium" without an account: sign up first, then come back here.
    return redirectTo("/registro?plan=premium");
  }
  if (!isSignedIn && matches(pathname, PROTECTED_PREFIXES)) {
    return redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`);
  }
  if (isSignedIn && matches(pathname, AUTH_PAGES)) {
    const params = request.nextUrl.searchParams;
    const next = params.get("next");
    if (params.get("plan") === "premium") return redirectTo("/panel/premium");
    const isSafe = next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
    return redirectTo(isSafe ? next! : "/panel");
  }

  return response;
}
