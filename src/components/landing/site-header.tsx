import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
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
  { href: "/#ejemplos", label: "Ejemplos" },
  { href: "/#precios", label: "Precios" },
  { href: "/#preguntas", label: "Preguntas" },
];

/** Figma 3:7 "Navegación". Links collapse into a sheet below `md`. */
export function SiteHeader() {
  return (
    <header className="border-b border-line">
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

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button variant="opal" asChild>
            <Link href="/registro">Crear mi página</Link>
          </Button>
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
            <div className="mt-auto flex flex-col gap-2 p-4">
              <Button variant="secondary" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button variant="opal" asChild>
                <Link href="/registro">Crear mi página</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
