import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isBot, trackingClient, visitorCountry, visitorHash } from "@/lib/tracking";

const bodySchema = z.object({
  username: z.string().min(1).max(40),
  referrer: z.string().max(500).nullish(),
});

/** Counts a profile visit. Duplicates within 30 min (same visitor hash) are ignored by `register_view`. */
export async function POST(request: NextRequest) {
  if (isBot(request)) return new NextResponse(null, { status: 204 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { username, referrer } = parsed.data;
  let referrerHost: string | null = null;
  try {
    referrerHost = referrer ? new URL(referrer).host : null;
  } catch {
    referrerHost = null;
  }

  const { error } = await trackingClient().rpc("register_view", {
    p_username: username,
    p_visitor_hash: visitorHash(request) ?? undefined,
    p_referrer: referrerHost ?? undefined,
    p_country: visitorCountry(request) ?? undefined,
  });
  if (error) {
    console.error("[track/view]", error.message);
    return NextResponse.json({ error: "track_failed" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
