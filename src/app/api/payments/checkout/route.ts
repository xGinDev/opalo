import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/auth/redirect";
import { getPaymentProvider } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

/**
 * "Obtener Premium" → 303 to the gateway's hosted checkout. POST from the panel form, GET from
 * the landing link (it only builds a signed URL; nothing is written until the gateway confirms).
 * The price and signature are computed here, never in the browser.
 */
async function startCheckout() {
  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return NextResponse.redirect(`${origin}/registro?plan=premium`, 303);

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userId).single();
  if (profile?.plan === "premium") return NextResponse.redirect(`${origin}/panel/premium`, 303);

  try {
    const { url } = await getPaymentProvider().createCheckout({
      userId,
      email: (claims.claims.email as string | undefined) ?? null,
      returnUrl: `${origin}/panel/premium/listo`,
    });
    return NextResponse.redirect(url, 303);
  } catch (error) {
    console.error("[payments/checkout]", error);
    return NextResponse.redirect(`${origin}/panel/premium?error=checkout`, 303);
  }
}

export const POST = startCheckout;
export const GET = startCheckout;
