import { Menu } from "lucide-react";
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

const NAV_LINKS = [
  { href: "/#funciones", label: "Funciones" },
  { href: "/#clasificacion", label: "Clasificación" },
  { href: "/#precios", label: "Precios" },
  { href: "/#preguntas", label: "Preguntas" },
];

/**
 * Figma 3:7 "Navegación", pinned to the top while scrolling. Links collapse into a sheet below `md`.
 * The account area is client-side so these pages stay static.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-[22px] sm:px-8 lg:px-20">
        <Logo href="/" />

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex gap-9 text-[15px] font-semibold text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="rounded-sm transition-colors hover:text-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <HeaderAccount />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(320px,85vw)] gap-0 border-line bg-background">
            <SheetHeader>
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <SheetDescription className="sr-only">Navegación del sitio</SheetDescription>
              <Logo />
            </SheetHeader>
            <nav aria-label="Principal" className="px-4">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <a
                        href={link.href}
                        className="block rounded-md px-2 py-3 text-base font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </a>
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
