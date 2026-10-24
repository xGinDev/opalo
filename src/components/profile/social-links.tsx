"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMessageText } from "@/i18n/use-message-text";
import { brandColor, linkAction, platformMeta } from "@/lib/profile/links";
import type { PublicLink } from "@/lib/profile/types";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  links: PublicLink[];
  accent: string;
  /** "mono": white icons with an accent glow (Figma); "color": each brand in its own color. */
  iconStyle?: "mono" | "color";
  still: boolean;
  /** Called on every click (the page sends it to /api/track/click; the preview ignores it). */
  onLinkClick?: (link: PublicLink) => void;
  className?: string;
  iconClassName?: string;
};

/** Figma 9:789 "redes": glowing icons (white or brand colors) with tooltip and a small hop on hover. */
export function SocialLinks({ links, accent, iconStyle = "mono", still, onLinkClick, className, iconClassName }: SocialLinksProps) {
  const t = useTranslations("Profile.links");
  const text = useMessageText();
  const tPanel = useTranslations("Panel.links");
  if (links.length === 0) return null;

  const monoGlow = { filter: `drop-shadow(0 0 4px rgba(255,255,255,0.75)) drop-shadow(0 0 12px ${accent}73)` };
  const styleFor = (platform: string) => {
    if (iconStyle !== "color") return monoGlow;
    const color = brandColor(platform);
    return { color, filter: `drop-shadow(0 0 3px ${color}99) drop-shadow(0 0 10px ${color}59)` };
  };
  const hover = still ? undefined : { y: -4, scale: 1.08 };

  return (
    <ul aria-label={tPanel("title")} className={cn("flex flex-wrap items-center justify-center", className)}>
      {links.map((link) => {
        const meta = platformMeta(link.platform);
        const action = linkAction(link.platform, link.value);
        const Icon = meta.icon;
        const icon = <Icon className={cn("size-full", iconClassName)} aria-hidden />;
        const name = text(meta.label);
        const label = action.kind === "copy" ? t("copyLabel", { name, value: action.text }) : name;

        const common = {
          "aria-label": label,
          className: "block size-full rounded-sm text-white",
          style: styleFor(link.platform),
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
                  toast.success(t("copied", { name, value: action.text }));
                } catch {
                  toast(`${name}: ${action.text}`);
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
              <TooltipContent>{action.kind === "copy" ? t("tapToCopy", { name }) : name}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
