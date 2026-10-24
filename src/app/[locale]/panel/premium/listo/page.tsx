import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaymentResult } from "@/components/panel/payment-result";
import { getPaymentProvider, recordPayment } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel.payment");
  return { title: t("metaTitle") };
}

type Props = { searchParams: Promise<{ id?: string }> };

/**
 * The gateway sends the buyer back here with ?id=<transaction>. We never trust the redirect:
 * the status is fetched from the gateway and recorded (same as the webhook, idempotent).
 */
export default async function PaymentReturnPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userId ?? "").single();
  if (profile?.plan === "premium") return <PaymentResult status="paid" />;
  if (!id || !userId) return <PaymentResult status="unknown" />;

  const event = await getPaymentProvider()
    .fetchPayment(id)
    .catch(() => null);
  if (!event || event.profileId !== userId) return <PaymentResult status="unknown" />;

  try {
    await recordPayment(event);
  } catch (error) {
    // The webhook will still record it; show the gateway's status meanwhile.
    console.error("[premium/listo] record", error);
  }

  const status = event.status === "paid" ? "paid" : event.status === "pending" ? "pending" : "failed";
  return <PaymentResult status={status} />;
}
