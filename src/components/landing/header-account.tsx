"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SheetClose } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { profilePath } from "@/lib/username";
import { cn } from "@/lib/utils";

type HeaderUser = { username: string; name: string; avatarUrl: string | null; isAdmin: boolean } | null;

// Shares an in-flight lookup between components mounted together; cleared once it settles
// so a later mount (after signing in or out) asks again.
let pending: Promise<HeaderUser> | null = null;

function loadUser() {
  pending ??= (async () => {
    const supabase = createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims.sub;
    if (!userId) return null;
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, role")
      .eq("id", userId)
      .maybeSingle();
    if (!data) return null;
    return {
      username: data.username,
      name: data.display_name?.trim() || data.username,
      avatarUrl: data.avatar_url,
      isAdmin: data.role === "admin",
    };
  })()
    .catch(() => null)
    .finally(() => {
      pending = null;
    });
  return pending;
}

/** `undefined` while loading, `null` when signed out. */
function useHeaderUser() {
  const [user, setUser] = useState<HeaderUser | undefined>(undefined);
  useEffect(() => {
    let active = true;
    loadUser().then((u) => active && setUser(u));
    return () => {
      active = false;
    };
  }, []);
  return user;
}

function Avatar({ user, size }: { user: NonNullable<HeaderUser>; size: number }) {
  return user.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- user upload from Supabase Storage
    <img src={user.avatarUrl} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span aria-hidden className="shrink-0 rounded-full bg-opal" style={{ width: size, height: size }} />
  );
}

/** Desktop: login/register, or "Ir al panel" + an account menu when signed in. */
export function HeaderAccount() {
  const user = useHeaderUser();

  if (user === undefined) return <div className="h-[46px] w-[260px]" aria-hidden />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
        <Button variant="opal" asChild>
          <Link href="/registro">Crear mi página</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="opal" asChild>
        <Link href="/panel">
          <LayoutDashboard aria-hidden /> Ir al panel
        </Link>
      </Button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className="rounded-full ring-offset-2 ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Tu cuenta: ${user.name}`}
        >
          <Avatar user={user} size={40} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex items-center gap-3 py-2">
            <Avatar user={user} size={36} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{user.name}</span>
              <span className="truncate text-xs font-medium text-muted-foreground">opalo.me{profilePath(user.username)}</span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <AccountItems user={user} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AccountItems({ user }: { user: NonNullable<HeaderUser> }) {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link href={profilePath(user.username)}>
          <ExternalLink aria-hidden /> Ver mi perfil
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/panel">
          <LayoutDashboard aria-hidden /> Mi panel
        </Link>
      </DropdownMenuItem>
      {user.isAdmin && (
        <DropdownMenuItem asChild>
          <Link href="/admin">
            <ShieldCheck aria-hidden /> Administración
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <form action={signOut}>
        <DropdownMenuItem asChild>
          <button type="submit" className="w-full">
            <LogOut aria-hidden /> Cerrar sesión
          </button>
        </DropdownMenuItem>
      </form>
    </>
  );
}

/** Mobile sheet footer: same choices as the desktop header, stacked. */
export function SheetAccount() {
  const user = useHeaderUser();
  const wrap = (node: React.ReactNode) => <SheetClose asChild>{node}</SheetClose>;
  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="flex flex-col gap-2">
        {wrap(
          <Button variant="secondary" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>,
        )}
        {wrap(
          <Button variant="opal" asChild>
            <Link href="/registro">Crear mi página</Link>
          </Button>,
        )}
      </div>
    );
  }

  const row = "flex items-center gap-3 rounded-md px-2 py-3 text-base font-semibold text-muted-foreground hover:text-foreground [&_svg]:size-5";
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-2 flex items-center gap-3 rounded-[14px] bg-surface p-2.5">
        <Avatar user={user} size={38} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold">{user.name}</span>
          <span className="truncate text-xs font-medium text-muted-foreground">opalo.me{profilePath(user.username)}</span>
        </span>
      </div>
      {wrap(
        <Link href={profilePath(user.username)} className={row}>
          <ExternalLink aria-hidden /> Ver mi perfil
        </Link>,
      )}
      {user.isAdmin &&
        wrap(
          <Link href="/admin" className={row}>
            <ShieldCheck aria-hidden /> Administración
          </Link>,
        )}
      <form action={signOut}>
        <button type="submit" className={cn(row, "w-full")}>
          <LogOut aria-hidden /> Cerrar sesión
        </button>
      </form>
      {wrap(
        <Button variant="opal" className="mt-2" asChild>
          <Link href="/panel">
            <LayoutDashboard aria-hidden /> Ir al panel
          </Link>
        </Button>,
      )}
    </div>
  );
}
