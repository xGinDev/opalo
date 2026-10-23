import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Figma 8:589 filter pills (links, so filters live in the URL). */
export function FilterPills({ items, label }: { items: { label: string; href: string; active: boolean }[]; label: string }) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "rounded-full px-3 py-[7px] text-[13px] font-bold transition-colors",
            item.active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** "Mostrando 6 de 12.480" + Anterior / Siguiente (Figma 8:757). */
export function Pagination({
  shown,
  total,
  prevHref,
  nextHref,
}: {
  shown: string;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
      <p className="text-[13px] font-medium text-muted-foreground">
        Mostrando {shown} de {new Intl.NumberFormat("es-CO").format(total)}
      </p>
      <div className="flex gap-2">
        {prevHref ? (
          <Button variant="ghost" asChild>
            <Link href={prevHref}>Anterior</Link>
          </Button>
        ) : (
          <Button variant="ghost" disabled>
            Anterior
          </Button>
        )}
        {nextHref ? (
          <Button variant="secondary" asChild>
            <Link href={nextHref}>Siguiente</Link>
          </Button>
        ) : (
          <Button variant="secondary" disabled>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}

/** Figma 8:427 search box; GET form so it works without JS and keeps the query in the URL. */
export function SearchBox({ action = "/admin/usuarios", defaultValue, hidden }: { action?: string; defaultValue?: string; hidden?: Record<string, string> }) {
  return (
    <form action={action} method="get" role="search" className="w-full sm:w-[300px]">
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <label className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-3.5 py-[11px] focus-within:border-ring">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Buscar usuario</span>
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar usuario o enlace"
          autoComplete="off"
          className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
        />
      </label>
    </form>
  );
}

export function AdminCard({ title, description, action, children, className }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans text-[17px] font-bold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
