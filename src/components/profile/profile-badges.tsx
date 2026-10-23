"use client";

import { Award, BadgeCheck, Crown, Gem, Shield, Zap, type LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PublicBadge } from "@/lib/profile/types";

export const BADGE_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  gem: { icon: Gem, color: "text-lilac" },
  crown: { icon: Crown, color: "text-gold" },
  zap: { icon: Zap, color: "text-pink" },
  check: { icon: BadgeCheck, color: "text-aqua" },
  shield: { icon: Shield, color: "text-lilac" },
};

/** Figma 9:768 "insignias": pill with one icon per badge and a tooltip with its name. */
export function ProfileBadges({ badges }: { badges: PublicBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <ul
      aria-label="Insignias"
      className="flex shrink-0 items-center gap-[7px] rounded-full border border-white/12 bg-white/9 px-2.5 py-1.5"
    >
      {badges.map((badge) => {
        const { icon: Icon, color } = BADGE_ICONS[badge.icon ?? ""] ?? { icon: Award, color: "text-gold" };
        return (
          <li key={badge.slug} className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-sm" aria-label={badge.name}>
                  <Icon className={`size-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.5)] ${color}`} aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent>{badge.name}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
