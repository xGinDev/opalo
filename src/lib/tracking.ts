import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|embedly|headless/i;

export function isBot(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  return !ua || BOT_UA.test(ua);
}

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    ""
  );
}

/**
 * sha256(ip + user-agent + day + secret). The raw IP is never stored, and the hash
 * changes every day, so visitors can't be followed across days.
 */
export function visitorHash(request: NextRequest) {
  const secret = process.env.VISITOR_HASH_SECRET;
  if (!secret) return null;
  const day = new Date().toISOString().slice(0, 10);
  const ua = request.headers.get("user-agent") ?? "";
  return createHash("sha256").update(`${clientIp(request)}|${ua}|${day}|${secret}`).digest("hex");
}

export function visitorCountry(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  return country && /^[A-Z]{2}$/.test(country) ? country : null;
}

/** RPCs register_view / register_click are granted to anon; no user session involved. */
export function trackingClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
