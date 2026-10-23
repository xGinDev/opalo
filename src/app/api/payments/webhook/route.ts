import { NextResponse } from "next/server";
import { getPaymentProvider, recordPayment } from "@/lib/payments";

/**
 * Gateway webhook (Wompi: `transaction.updated`). Verifies the signature, then upserts
 * `payments` with the service role. Safe to receive the same event more than once.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();

  let event;
  try {
    event = await provider.parseWebhook(request);
  } catch (error) {
    console.error("[payments/webhook] parse", error);
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  if (event === null) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  if (event === "ignore") return NextResponse.json({ ok: true, ignored: true });

  try {
    const result = await recordPayment(event);
    if (!event.amountMatches) console.warn("[payments/webhook] amount mismatch", event.providerPaymentId, event.charged);
    return NextResponse.json({ ok: true, skipped: result.skipped });
  } catch (error) {
    // 500 makes the gateway retry later.
    console.error("[payments/webhook] record", error);
    return NextResponse.json({ error: "record_failed" }, { status: 500 });
  }
}
