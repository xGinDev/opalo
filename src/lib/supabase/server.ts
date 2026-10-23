import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";
import { REMEMBER_COOKIE, applyRemember, isRemembered } from "./remember";

type Options = {
  /** Overrides the saved "Recordarme" preference (used right when signing in). */
  remember?: boolean;
};

/** Per-request client bound to the user's session cookies. Never cache it globally. */
export async function createClient({ remember }: Options = {}) {
  const cookieStore = await cookies();
  const keepSession = remember ?? isRemembered(cookieStore.get(REMEMBER_COOKIE)?.value);

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, applyRemember(options, keepSession)),
          );
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}
