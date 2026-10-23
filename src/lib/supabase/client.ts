import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";
import { REMEMBER_COOKIE, applyRemember, isRemembered } from "./remember";

type CookieOptions = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

function readCookies() {
  if (!document.cookie) return [];
  return document.cookie.split("; ").map((pair) => {
    const i = pair.indexOf("=");
    return { name: decodeURIComponent(pair.slice(0, i)), value: decodeURIComponent(pair.slice(i + 1)) };
  });
}

function writeCookie(name: string, value: string, options: CookieOptions) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${options.path ?? "/"}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
  if (options.domain) cookie += `; Domain=${options.domain}`;
  if (options.sameSite) cookie += `; SameSite=${options.sameSite === true ? "Strict" : options.sameSite}`;
  if (options.secure) cookie += "; Secure";
  document.cookie = cookie;
}

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: readCookies,
      setAll(cookiesToSet) {
        const remember = isRemembered(readCookies().find((c) => c.name === REMEMBER_COOKIE)?.value);
        cookiesToSet.forEach(({ name, value, options }) => writeCookie(name, value, applyRemember(options, remember)));
      },
    },
  });
}
