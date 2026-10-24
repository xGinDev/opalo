import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { HeaderAccount, SheetAccount } from "@/components/landing/header-account";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { isRtl } from "@/i18n/routing";

const NAV_LINKS = [
  { hash: "funciones", key: "features" },
  { hash: "clasificacion", key: "leaderboard" },
  { hash: "precios", key: "pricing" },
  { hash: "preguntas", key: "faq" },
] as const;

/**
 * Figma 3:7 "Navegación", pinned to the top while scrolling. Links collapse into a sheet below `md`.
 * The account area is client-side so these pages stay static.
 */
export function SiteHeader() {
  const t = useTranslations("Landing.nav");
  // The menu slides in from the end side (left in Arabic).
  const side = isRtl(useLocale()) ? "left" : "right";
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-[22px] sm:px-8 lg:px-20">
        <Logo href="/" />

        <nav aria-label={t("label")} className="hidden md:block">
          <ul className="flex gap-9 text-[15px] font-semibold text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.hash}>
                <Link href={{ pathname: "/", hash: link.hash }} className="rounded-sm transition-colors hover:text-foreground">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <HeaderAccount />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("openMenu")}>
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side={side} className="w-[min(320px,85vw)] gap-0 border-line bg-background">
            <SheetHeader>
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
              <SheetDescription className="sr-only">{t("menuDescription")}</SheetDescription>
              <Logo />
            </SheetHeader>
            <nav aria-label={t("label")} className="px-4">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <li key={link.hash}>
                    <SheetClose asChild>
                      <Link
                        href={{ pathname: "/", hash: link.hash }}
                        className="block rounded-md px-2 py-3 text-base font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {t(link.key)}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto p-4">
              <SheetAccount />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
