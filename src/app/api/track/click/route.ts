import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isBot, trackingClient, visitorHash } from "@/lib/tracking";

const bodySchema = z.object({ linkId: z.uuid() });

/** Counts a click on a social link (sent with navigator.sendBeacon). */
export async function POST(request: NextRequest) {
  if (isBot(request)) return new NextResponse(null, { status: 204 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { error } = await trackingClient().rpc("register_click", {
    p_link_id: parsed.data.linkId,
    p_visitor_hash: visitorHash(request) ?? undefined,
  });
  if (error) {
    console.error("[track/click]", error.message);
    return NextResponse.json({ error: "track_failed" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
