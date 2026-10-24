import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthColumn } from "@/components/auth/auth-column";
import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { translateError } from "@/lib/errors";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ next?: string; error?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.login" });
  return pageMetadata({ locale, path: "/login", title: t("title"), description: t("description") });
}

/** Figma 6:127 "02 Iniciar sesión". */
export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [{ next, error }, t] = await Promise.all([searchParams, getTranslations()]);
  const errorKey = error ? translateError({ code: error }, "Errors.loginFailed") : undefined;

  return (
    <AuthColumn
      title={t("Auth.login.title")}
      description={t("Auth.login.description")}
      footer={t.rich("Auth.login.noAccount", {
        link: (chunks) => <Link href={next ? { pathname: "/registro", query: { next } } : "/registro"}>{chunks}</Link>,
      })}
    >
      <LoginForm next={next} initialError={errorKey ? t(errorKey) : undefined} />
    </AuthColumn>
  );
}
