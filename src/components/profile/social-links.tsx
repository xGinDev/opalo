"use client";

import { motion } from "motion/react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { linkAction, platformMeta } from "@/lib/profile/links";
import type { PublicLink } from "@/lib/profile/types";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  links: PublicLink[];
  accent: string;
  still: boolean;
  /** Called on every click (the page sends it to /api/track/click; the preview ignores it). */
  onLinkClick?: (link: PublicLink) => void;
  className?: string;
  iconClassName?: string;
};

/** Figma 9:789 "redes": white glowing icons with tooltip and a small hop on hover. */
export function SocialLinks({ links, accent, still, onLinkClick, className, iconClassName }: SocialLinksProps) {
  if (links.length === 0) return null;

  const glow = { filter: `drop-shadow(0 0 4px rgba(255,255,255,0.75)) drop-shadow(0 0 12px ${accent}73)` };
  const hover = still ? undefined : { y: -4, scale: 1.08 };

  return (
    <ul aria-label="Redes" className={cn("flex flex-wrap items-center justify-center", className)}>
      {links.map((link) => {
        const meta = platformMeta(link.platform);
        const action = linkAction(link.platform, link.value);
        const Icon = meta.icon;
        const icon = <Icon className={cn("size-full", iconClassName)} aria-hidden />;
        const label =
          action.kind === "copy" ? `${meta.label}: ${action.text} (copiar)` : `${meta.label}`;

        const common = {
          "aria-label": label,
          className: "block size-full rounded-sm text-white",
          style: glow,
          whileHover: hover,
          whileFocus: hover,
          transition: { type: "spring" as const, stiffness: 420, damping: 16 },
        };

        let control: React.ReactNode;
        if (action.kind === "copy") {
          control = (
            <motion.button
              type="button"
              {...common}
              onClick={async () => {
                onLinkClick?.(link);
                try {
                  await navigator.clipboard.writeText(action.text);
                  toast.success(`${meta.label} copiado: ${action.text}`);
                } catch {
                  toast(`${meta.label}: ${action.text}`);
                }
              }}
            >
              {icon}
            </motion.button>
          );
        } else if (action.kind === "open" || action.kind === "mailto") {
          control = (
            <motion.a
              {...common}
              href={action.href}
              target={action.kind === "open" ? "_blank" : undefined}
              rel={action.kind === "open" ? "noopener noreferrer nofollow ugc" : undefined}
              onClick={() => onLinkClick?.(link)}
            >
              {icon}
            </motion.a>
          );
        } else {
          return null;
        }

        return (
          <li key={link.id} className="size-[var(--icon-size,30px)]">
            <Tooltip>
              <TooltipTrigger asChild>{control}</TooltipTrigger>
              <TooltipContent>{action.kind === "copy" ? `${meta.label} · toca para copiar` : meta.label}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
