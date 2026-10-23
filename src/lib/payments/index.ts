import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { RECORDED_PRICE } from "./price";
import type { PaymentEvent, PaymentProvider } from "./types";
import { wompi } from "./wompi";

const PROVIDERS: Partial<Record<string, PaymentProvider>> = { wompi };

/** The gateway selected by PAYMENT_PROVIDER. Add stripe / mercadopago / paypal here. */
export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "wompi";
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`Unsupported PAYMENT_PROVIDER "${name}"`);
  return provider;
}

/** A final state never goes back to pending (events can arrive out of order). */
const RANK = { pending: 0, failed: 1, paid: 2, refunded: 3 } as const;

/**
 * Inserts or updates the payment with the service role. Idempotent thanks to
 * unique(provider, provider_payment_id); the `payments_change` trigger grants or removes Premium.
 */
export async function recordPayment(event: PaymentEvent) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("payments")
    .select("status")
    .eq("provider", event.provider)
    .eq("provider_payment_id", event.providerPaymentId)
    .maybeSingle();

  if (existing && RANK[existing.status] > RANK[event.status]) return { skipped: true as const };
  if (existing?.status === event.status) return { skipped: true as const };

  const { error } = await admin.from("payments").upsert(
    {
      profile_id: event.profileId,
      provider: event.provider,
      provider_payment_id: event.providerPaymentId,
      amount_cents: RECORDED_PRICE.amountCents,
      currency: RECORDED_PRICE.currency,
      status: event.status,
      raw: { charged: event.charged, amount_matches: event.amountMatches, provider: event.raw } as never,
    },
    { onConflict: "provider,provider_payment_id" },
  );
  if (error) throw new Error(`recordPayment: ${error.message}`);
  return { skipped: false as const };
}

export type { PaymentEvent, PaymentProvider } from "./types";
