import type { Metadata } from "next";
import { Flag, Mail, MessageCircle, type LucideIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { GlowOrb } from "@/components/opal/glow-orb";
import { Tag } from "@/components/opal/tag";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.contact" });
  return pageMetadata({ locale, path: "/contacto", title: t("title"), description: t("description") });
}

const CHANNELS: { key: "support" | "press" | "report"; icon: LucideIcon; email?: string }[] = [
  { key: "support", icon: Mail, email: "soporte@opalo.me" },
  { key: "press", icon: MessageCircle, email: "hola@opalo.me" },
  { key: "report", icon: Flag },
];

/** Figma 23:548 "12 Contacto". */
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <div className="relative mx-auto grid max-w-[1440px] items-start gap-12 px-4 pt-14 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_560px] lg:gap-20 lg:px-20 lg:pt-24 lg:pb-[120px]">
      <GlowOrb
        color="linear-gradient(90deg, #f6a8cf, #b9a7ff 50%, #8fe3dc)"
        blur={70}
        opacity={0.16}
        className="end-[60px] top-[120px] hidden h-[420px] w-[620px] lg:block"
      />

      <div className="relative flex flex-col items-start gap-7">
        <Tag>{t("tag")}</Tag>
        <h1 className="text-5xl font-extrabold tracking-[-0.03em] sm:text-[72px] sm:leading-none">{t("title")}</h1>
        <p className="max-w-[520px] text-base leading-[1.55] text-muted-foreground sm:text-lg">{t("lead")}</p>
        <ul className="flex w-full flex-col gap-3">
          {CHANNELS.map(({ key, icon: Icon, email }) => (
            <li key={key} className="flex items-start gap-4 rounded-[18px] border border-line bg-surface py-[18px] ps-[18px] pe-5">
              <span className="rounded-md bg-lilac/14 p-[11px] text-lilac">
                <Icon className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col gap-[3px]">
                <p className="text-[15px] font-bold">{t(`channels.${key}.title`)}</p>
                <p className="text-[15px] font-bold text-lilac [&_a]:underline-offset-4 [&_a:hover]:underline">
                  {email ? <a href={`mailto:${email}`}>{email}</a> : t("channels.report.detail")}
                </p>
                <p className="text-sm text-muted-foreground">{t(`channels.${key}.description`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative rounded-[28px] border border-line bg-surface p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:p-9">
        <ContactForm />
      </div>
    </div>
  );
}
