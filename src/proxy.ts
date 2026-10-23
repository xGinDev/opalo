import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, tracking beacons and the payment webhook (no session needed).
    "/((?!_next/static|_next/image|favicon.ico|brand/|api/payments/webhook|api/track/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|webm)$).*)",
  ],
};
