import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { requestOrigin, safeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Email links that use `token_hash` (works across devices, unlike PKCE codes).
 * Supabase email templates should point to:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<type>&next=<path>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = await requestOrigin();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"), type === "recovery" ? "/recuperar/nueva" : "/panel");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[auth/confirm]", error.code, error.message);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.code ?? "auth")}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
