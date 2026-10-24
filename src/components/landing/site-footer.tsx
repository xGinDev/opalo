import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

const FOOTER_LINKS = [
  { href: "/terminos", key: "terms" },
  { href: "/privacidad", key: "privacy" },
  { href: "/contacto", key: "contact" },
] as const;

/** Figma 5:286 "Pie de página" + language switcher. */
export function SiteFooter() {
  const t = useTranslations("Landing.footer");
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pt-8 pb-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-20">
        <div className="flex items-center gap-5">
          <Logo href="/" />
          <p className="text-sm font-medium text-muted-foreground">© {new Date().getFullYear()} Ópalo</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
          <nav aria-label={t("legal")}>
            <ul className="flex gap-7 text-sm font-semibold text-muted-foreground">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="rounded-sm transition-colors hover:text-foreground">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
