import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { DirectionProvider } from "@/components/direction-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isRtl } from "@/i18n/routing";
import { bricolage, manrope, plexArabic } from "@/lib/fonts";
import "@/app/globals.css";

/** Namespaces only Server Components read (long legal texts, SEO copy): kept out of the client bundle. */
const SERVER_ONLY = ["Legal", "Meta"];

/**
 * <html>/<body> shared by the root layouts ([locale], admin, dev): language and direction,
 * fonts, providers, toasts and analytics.
 */
export async function RootDocument({ locale, children }: { locale: string; children: React.ReactNode }) {
  const dir = isRtl(locale) ? "rtl" : "ltr";
  const all = await getMessages({ locale });
  const messages = Object.fromEntries(Object.entries(all).filter(([ns]) => !SERVER_ONLY.includes(ns)));

  return (
    <html lang={locale} dir={dir} className={`dark ${bricolage.variable} ${manrope.variable} ${plexArabic.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider dir={dir}>
            <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
            <Toaster position="bottom-center" />
          </DirectionProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
