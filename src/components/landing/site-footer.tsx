import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const FOOTER_LINKS = [
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/contacto", label: "Contacto" },
];

/** Figma 5:286 "Pie de página". */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pt-8 pb-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-20">
        <div className="flex items-center gap-5">
          <Logo href="/" />
          <p className="text-sm font-medium text-muted-foreground">© {new Date().getFullYear()} Ópalo</p>
        </div>
        <nav aria-label="Legal">
          <ul className="flex gap-7 text-sm font-semibold text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="rounded-sm transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
