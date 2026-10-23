import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { normalizeUsername } from "@/lib/username";
import type { Database } from "@/types/database";
import type { PublicProfile } from "./types";

/** Cookie-less anon client: public profile data never depends on who is looking. */
function anonClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Decodes the `[username]` segment safely; returns null for malformed input. */
export function usernameFromParam(param: string) {
  try {
    return normalizeUsername(decodeURIComponent(param));
  } catch {
    return null;
  }
}

/**
 * Everything needed to render opalo.me/<username> (one RPC). Null when the user doesn't
 * exist or is suspended. Cached per request so metadata, OG image and page share one call.
 */
export const getPublicProfile = cache(async (username: string): Promise<PublicProfile | null> => {
  const { data, error } = await anonClient().rpc("get_public_profile", { p_username: username });
  if (error) {
    console.error("[get_public_profile]", error.message);
    return null;
  }
  return (data as unknown as PublicProfile | null) ?? null;
});
