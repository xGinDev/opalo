import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthColumn } from "@/components/auth/auth-column";
import { RegisterForm } from "@/components/auth/register-form";
import { Link } from "@/i18n/navigation";
import { type Locale, localePrefix } from "@/i18n/routing";
import { safeNext } from "@/lib/auth/redirect";
import { pageMetadata } from "@/lib/seo";
import { USERNAME_MAX } from "@/lib/username";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ usuario?: string; plan?: string; next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.register" });
  return pageMetadata({ locale, path: "/registro", title: t("title"), description: t("description") });
}

/** Figma 6:222 "03 Registro". `?usuario=` comes from the landing, `?plan=premium` from "Obtener Premium". */
export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [{ usuario, plan, next }, t] = await Promise.all([searchParams, getTranslations("Auth.register")]);
  const prefix = localePrefix(locale);
  const panel = `${prefix}/panel`;
  const destination = plan === "premium" ? `${prefix}/panel/premium` : safeNext(next, panel);

  return (
    <AuthColumn
      title={t("title")}
      description={t("description")}
      footer={t.rich("haveAccount", {
        link: (chunks) => (
          <Link href={destination === panel ? "/login" : { pathname: "/login", query: { next: destination } }}>{chunks}</Link>
        ),
      })}
    >
      <RegisterForm next={destination} initialUsername={usuario?.slice(0, USERNAME_MAX * 2) ?? ""} />
    </AuthColumn>
  );
}
