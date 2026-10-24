import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";
import { REMEMBER_COOKIE, applyRemember, isRemembered } from "./remember";

type CookieToSet = { name: string; value: string; options?: Parameters<typeof applyRemember>[0] };

/**
 * Refreshes the Supabase session for this request. Updated cookies are written to
 * `request.cookies` (so Server Components see the fresh session) and returned so the caller can
 * put them on whatever response it builds (next, rewrite or redirect).
 */
export async function refreshSession(request: NextRequest) {
  const cookies: CookieToSet[] = [];
  if (!hasSupabaseEnv) return { isSignedIn: false, cookies };

  const remember = isRemembered(request.cookies.get(REMEMBER_COOKIE)?.value);
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          cookies.push({ name, value, options: applyRemember(options, remember) });
        });
      },
    },
  });

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  return { isSignedIn: Boolean(data?.claims), cookies };
}

/** Copies the refreshed session cookies onto a response. */
export function withSessionCookies<T extends { cookies: { set: (name: string, value: string, options?: object) => unknown } }>(
  response: T,
  cookies: CookieToSet[],
) {
  cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
