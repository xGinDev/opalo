import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { Enums } from "@/types/database";
import { premiumPriceCop } from "./price";
import type { PaymentEvent, PaymentProvider } from "./types";

/**
 * Wompi (Colombia). Web Checkout + `transaction.updated` events.
 * Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/ and /eventos/
 *
 * Env:
 *   PAYMENT_PUBLIC_KEY      pub_test_… / pub_prod_…
 *   PAYMENT_SECRET_KEY      integrity secret (test_integrity_… / prod_integrity_…)
 *   PAYMENT_WEBHOOK_SECRET  events secret (test_events_… / prod_events_…)
 */

const CHECKOUT_URL = "https://checkout.wompi.co/p/";
const REFERENCE = /^opalo-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-\d+$/;

type WompiTransaction = {
  id: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  amount_in_cents: number;
  currency: string;
  reference: string;
  [key: string]: unknown;
};

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function apiBase() {
  return env("PAYMENT_PUBLIC_KEY").startsWith("pub_prod_") ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1";
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

const STATUS: Record<WompiTransaction["status"], Enums<"payment_status">> = {
  PENDING: "pending",
  APPROVED: "paid",
  DECLINED: "failed",
  ERROR: "failed",
  VOIDED: "refunded",
};

function toEvent(tx: WompiTransaction, raw: unknown): PaymentEvent | null {
  const profileId = REFERENCE.exec(tx.reference)?.[1];
  if (!profileId) return null; // not one of our references
  const expectedCents = premiumPriceCop() * 100;
  const amountMatches = tx.currency === "COP" && tx.amount_in_cents === expectedCents;
  return {
    provider: "wompi",
    providerPaymentId: tx.id,
    profileId,
    status: amountMatches ? STATUS[tx.status] ?? "pending" : "failed",
    charged: { amountCents: tx.amount_in_cents, currency: tx.currency },
    amountMatches,
    raw,
  };
}

/** Reads "transaction.id" style paths from the event's data object. */
function pick(data: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((obj, key) => (obj as Record<string, unknown> | undefined)?.[key], data);
  return value === undefined || value === null ? "" : String(value);
}

export const wompi: PaymentProvider = {
  name: "wompi",

  async createCheckout({ userId, email, returnUrl }) {
    const reference = `opalo-${userId}-${Date.now()}`;
    const amountInCents = String(premiumPriceCop() * 100);
    const currency = "COP";
    const signature = sha256(`${reference}${amountInCents}${currency}${env("PAYMENT_SECRET_KEY")}`);

    const params = new URLSearchParams({
      "public-key": env("PAYMENT_PUBLIC_KEY"),
      currency,
      "amount-in-cents": amountInCents,
      reference,
      "signature:integrity": signature,
      "redirect-url": returnUrl,
    });
    if (email) params.set("customer-data:email", email);
    return { url: `${CHECKOUT_URL}?${params}` };
  },

  async parseWebhook(request) {
    const body = (await request.json().catch(() => null)) as {
      event?: string;
      data?: { transaction?: WompiTransaction };
      signature?: { properties?: string[]; checksum?: string };
      timestamp?: number;
    } | null;
    if (!body?.signature?.properties || !body.timestamp) return null;

    // checksum = sha256(values of signature.properties in order + timestamp + events secret)
    const concatenated =
      body.signature.properties.map((p) => pick(body.data, p)).join("") + body.timestamp + env("PAYMENT_WEBHOOK_SECRET");
    const received = (request.headers.get("x-event-checksum") ?? body.signature.checksum ?? "").toLowerCase();
    if (!received || !safeEqual(sha256(concatenated), received)) return null;

    if (body.event !== "transaction.updated" || !body.data?.transaction) return "ignore";
    return toEvent(body.data.transaction, body) ?? "ignore";
  },

  async fetchPayment(id) {
    if (!/^[\w-]{6,80}$/.test(id)) return null;
    const res = await fetch(`${apiBase()}/transactions/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: WompiTransaction };
    return json.data ? toEvent(json.data, json) : null;
  },
};
