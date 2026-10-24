"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Award, CreditCard, Flag, House, LogOut, Menu, User, Users } from "lucide-react";
import { signOut } from "@/app/[locale]/(auth)/actions";
import { Logo } from "@/components/brand/logo";
import { NavItem } from "@/components/opal/nav-item";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "/admin", label: "Resumen", icon: House },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { href: "/admin/reportes", label: "Reportes", icon: Flag },
  { href: "/admin/insignias", label: "Insignias", icon: Award },
];

type Admin = { username: string; display_name: string | null; avatar_url: string | null };

function Sidebar({ admin, openReports, onNavigate }: { admin: Admin; openReports: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = [...NAV].reverse().find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.href;

  return (
    <div className="flex h-full flex-col justify-between gap-8 px-5 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <Logo href="/" />
          <span className="rounded-full border border-line bg-surface-2 px-[11px] py-[5px] text-xs font-bold text-muted-foreground">Admin</span>
        </div>
        <nav aria-label="Administración">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href} className="relative">
                <NavItem href={item.href} icon={item.icon} label={item.label} active={item.href === active} onClick={onNavigate} />
                {item.href === "/admin/reportes" && openReports > 0 && (
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-gold/16 px-2 py-0.5 text-[11px] font-bold text-gold">
                    {openReports}
                  </span>
                )}
              </li>
            ))}
            <li>
              <NavItem href="/panel" icon={User} label="Mi panel" onClick={onNavigate} />
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex items-center gap-3 rounded-[14px] bg-surface p-2.5">
        {admin.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- user upload from Supabase Storage
          <img src={admin.avatar_url} alt="" className="size-[38px] shrink-0 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="size-[38px] shrink-0 rounded-full bg-opal" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-bold">{admin.display_name?.trim() || admin.username}</p>
          <p className="text-xs font-medium text-muted-foreground">Administrador</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="rounded-sm p-1 text-muted-foreground hover:text-foreground" aria-label="Cerrar sesión">
            <LogOut className="size-[18px]" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}

/** Figma 8:353 layout: admin sidebar + content. */
export function AdminShell({ admin, openReports, children }: { admin: Admin; openReports: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 overflow-y-auto border-r border-line lg:block">
        <Sidebar admin={admin} openReports={openReports} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <Logo href="/" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú de administración">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-line bg-background p-0">
              <SheetTitle className="sr-only">Administración</SheetTitle>
              <SheetDescription className="sr-only">Secciones del panel de administración</SheetDescription>
              <Sidebar admin={admin} openReports={openReports} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex flex-col gap-6 px-4 pt-6 pb-12 sm:px-8 lg:px-10 lg:pt-7">{children}</main>
      </div>
    </div>
  );
}

/** Page title + description, with optional actions on the right (Figma 8:422). */
export function AdminHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.015em] sm:text-[32px]">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </header>
  );
}
