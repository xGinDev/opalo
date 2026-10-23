import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

/** Figma 2:156 / 2:161 "Ítem de menú" — Normal and Activo states. */
export function NavItem({ href, icon: Icon, label, active = false, className, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-surface-2 font-bold text-foreground"
          : "font-semibold text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
        className,
      )}
    >
      <Icon className={cn("size-5 shrink-0", active && "text-lilac")} strokeWidth={1.75} aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}
