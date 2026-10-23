"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/brand/logo";
import { NavItem } from "@/components/opal/nav-item";
import { Button } from "@/components/ui/button";
import { profileUrl } from "@/lib/username";
import { cn } from "@/lib/utils";
import { PANEL_SECTIONS, sectionFor } from "./nav";
import { usePanel } from "./panel-provider";

function guard(navigate: (href: string) => void, dirty: boolean, href: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!dirty || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(href);
  };
}

/** Figma 7:210 "Barra lateral": user, menu, Premium card and sign out. */
export function PanelSidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = sectionFor(pathname);
  const { data, isPremium, dirty, navigate } = usePanel();
  const { profile } = data;
  const name = profile.display_name?.trim() || profile.username;

  return (
    <div className={cn("flex h-full flex-col justify-between gap-8 px-5 py-6", className)}>
      <div className="flex flex-col gap-6">
        <Logo href="/" />
        <div className="flex items-center gap-3 rounded-[14px] bg-surface p-2.5">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- user upload from Supabase Storage
            <img src={profile.avatar_url} alt="" className="size-[38px] shrink-0 rounded-full object-cover" />
          ) : (
            <span aria-hidden className="size-[38px] shrink-0 rounded-full bg-opal" />
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-sm font-bold">{name}</p>
            <p className="truncate text-xs font-medium text-muted-foreground">
              {profileUrl(profile.username).replace("https://", "")}
            </p>
          </div>
        </div>
        <nav aria-label="Panel">
          <ul className="flex flex-col gap-1">
            {PANEL_SECTIONS.map((s) => (
              <li key={s.href}>
                <NavItem
                  href={s.href}
                  icon={s.icon}
                  label={s.label}
                  active={s.href === active.href}
                  onClick={(e) => {
                    guard(navigate, dirty, s.href)(e);
                    onNavigate?.();
                  }}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {!isPremium && (
          <div className="flex flex-col items-start gap-2.5 rounded-lg px-[18px] py-5 border-opal [--opal-border-fill:var(--opal-surface-2)]">
            <Gem className="size-[22px] text-lilac" aria-hidden />
            <p className="text-[15px] font-bold">Hazte Premium</p>
            <p className="text-[13px] leading-[1.45] text-muted-foreground">
              Video de fondo, música y todos los efectos. 10 USD, un solo pago.
            </p>
            <Button variant="opal" className="w-full" asChild>
              <Link href="/panel/premium" onClick={guard(navigate, dirty, "/panel/premium")}>
                Desbloquear
              </Link>
            </Button>
          </div>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
          >
            <LogOut className="size-5" strokeWidth={1.75} aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
