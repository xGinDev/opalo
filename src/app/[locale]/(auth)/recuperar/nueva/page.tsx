import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthColumn } from "@/components/auth/auth-column";
import { NewPasswordForm } from "@/components/auth/recover-forms";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.newPassword" });
  return { title: t("title"), robots: { index: false } };
}

/** Landing page of the recovery email link (the link signs the user in first). */
export default async function NewPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.newPassword");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <AuthColumn title={t("expiredTitle")} description={t("expiredBody")}>
        <Button variant="opal" asChild>
          <Link href="/recuperar">{t("requestAnother")}</Link>
        </Button>
      </AuthColumn>
    );
  }

  return (
    <AuthColumn title={t("title")} description={t("description")}>
      <NewPasswordForm />
    </AuthColumn>
  );
}
