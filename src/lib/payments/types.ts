import type { Enums } from "@/types/database";

export type ProviderName = "stripe" | "mercadopago" | "wompi" | "paypal";

/** A payment as the provider reports it, normalized to our `payments` table. */
export type PaymentEvent = {
  provider: ProviderName;
  providerPaymentId: string;
  profileId: string;
  status: Enums<"payment_status">;
  /** What the gateway actually charged (e.g. COP for Wompi). */
  charged: { amountCents: number; currency: string };
  /** False if the charged amount doesn't match our price (the payment is then recorded as failed). */
  amountMatches: boolean;
  raw: unknown;
};

export type CheckoutInput = {
  userId: string;
  email: string | null;
  /** Absolute URL the gateway sends the buyer back to. */
  returnUrl: string;
};

/**
 * Swappable payment gateway. Only these three operations touch provider specifics;
 * recording the payment and granting Premium is shared (the DB trigger does the rest).
 */
export interface PaymentProvider {
  name: ProviderName;
  /** URL of the hosted checkout for the one-time Premium purchase. */
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  /** Verifies the webhook signature. Null = not authentic (respond 401); "ignore" = authentic but irrelevant. */
  parseWebhook(request: Request): Promise<PaymentEvent | "ignore" | null>;
  /** Looks a payment up by id straight from the gateway (used on the return page). */
  fetchPayment(providerPaymentId: string): Promise<PaymentEvent | null>;
}
