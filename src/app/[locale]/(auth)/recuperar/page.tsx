import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthColumn } from "@/components/auth/auth-column";
import { RecoverForm } from "@/components/auth/recover-forms";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.recover" });
  return {
    ...pageMetadata({ locale, path: "/recuperar", title: t("title"), description: t("description") }),
    robots: { index: false, follow: true },
  };
}

/** Not in the Figma: reuses the login layout. */
export default async function RecoverPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.recover");
  return (
    <AuthColumn
      title={t("title")}
      description={t("description")}
      footer={t.rich("remembered", { link: (chunks) => <Link href="/login">{chunks}</Link> })}
    >
      <RecoverForm />
    </AuthColumn>
  );
}
