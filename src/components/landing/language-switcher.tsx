"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_NAMES, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Native <select> (accessible, works on every phone) that switches the language of the current page. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Landing.footer");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        "relative flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted-foreground focus-within:border-ring",
        isPending && "opacity-60",
        className,
      )}
    >
      <Globe className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(() => router.replace(pathname, { locale: next, scroll: false }));
        }}
        className="cursor-pointer appearance-none bg-transparent pe-1 text-foreground outline-none"
      >
        {locales.map((l) => (
          <option key={l} value={l} lang={l} className="bg-surface text-foreground">
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
