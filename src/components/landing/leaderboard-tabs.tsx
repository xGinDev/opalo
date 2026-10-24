"use client";

import NextLink from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { Crown, Eye, Gem } from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import type { LeaderboardRow } from "@/lib/landing/leaderboard";
import { Link } from "@/i18n/navigation";
import { profilePath } from "@/lib/username";
import { cn } from "@/lib/utils";

const PODIUM = [
  { ring: "#F2D49B", label: "first" },
  { ring: "#D9D4E6", label: "second" },
  { ring: "#E0A27C", label: "third" },
];

function Avatar({ row, className, ring }: { row: LeaderboardRow; className: string; ring?: string }) {
  const style = ring ? { boxShadow: `0 0 0 3px ${ring}, 0 0 24px ${ring}55` } : undefined;
  return row.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element -- user upload from Supabase Storage
    <img src={row.avatar_url} alt="" className={cn("shrink-0 rounded-full object-cover", className)} style={style} loading="lazy" />
  ) : (
    <span aria-hidden className={cn("shrink-0 rounded-full bg-opal", className)} style={style} />
  );
}

function Name({ row, className }: { row: LeaderboardRow; className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <span className="truncate">{row.display_name?.trim() || row.username}</span>
      {row.plan === "premium" && <Gem className="size-3.5 shrink-0 text-lilac" aria-label="Premium" />}
    </span>
  );
}

function Views({ value, period }: { value: number; period: "all" | "month" }) {
  const t = useTranslations("Landing.leaderboard");
  const format = useFormatter();
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold tabular-nums">
      <Eye className="size-4 text-muted-foreground" aria-hidden />
      {format.number(value)}
      <span className="sr-only">{period === "month" ? t("viewsMonth") : t("views")}</span>
    </span>
  );
}

function Board({ rows, period }: { rows: LeaderboardRow[]; period: "all" | "month" }) {
  const t = useTranslations("Landing.leaderboard");
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <Crown className="size-8 text-gold" aria-hidden />
        <p className="max-w-[420px] text-muted-foreground">
          {period === "month"
            ? t("emptyMonth")
            : t("emptyAll")}
        </p>
        <Button variant="opal" asChild>
          <Link href="/registro">{t("cta")}</Link>
        </Button>
      </div>
    );
  }

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="flex flex-col gap-6">
      <ol className="grid grid-cols-3 items-end gap-2 sm:items-start sm:gap-4" aria-label={t("podium")}>
        {podium.map((row, i) => (
          <li key={row.username} className={cn("min-w-0", i === 0 && "order-2", i === 1 && "order-1", i === 2 && "order-3")}>
            <NextLink
              href={profilePath(row.username)}
              className={cn(
                "group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-line bg-surface px-2 pt-4 pb-4 text-center transition-colors hover:border-muted-foreground/40 sm:gap-3 sm:px-5 sm:pt-7 sm:pb-6",
                i === 0 && "pt-6 sm:-mt-4 sm:pt-10",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
                style={{ backgroundImage: `radial-gradient(60% 100% at 50% 0%, ${PODIUM[i].ring}33, transparent)` }}
              />
              <span className="relative text-xs font-extrabold tracking-wide" style={{ color: PODIUM[i].ring }}>
                {i === 0 && <Crown className="mx-auto mb-1 size-5" aria-hidden />}
                <span className="sr-only">{t("place")} </span>
                {t(PODIUM[i].label)}
              </span>
              <Avatar row={row} ring={PODIUM[i].ring} className={i === 0 ? "size-16 sm:size-[84px]" : "size-12 sm:size-[72px]"} />
              <span className="flex w-full min-w-0 flex-col items-center gap-0.5">
                <Name row={row} className="max-w-full justify-center text-sm font-bold sm:text-lg" />
                <span className="hidden max-w-full truncate text-[13px] font-medium sm:block text-muted-foreground group-hover:text-foreground">
                  opalo.me{profilePath(row.username)}
                </span>
              </span>
              <Views value={row.views} period={period} />
            </NextLink>
          </li>
        ))}
      </ol>

      {rest.length > 0 && (
        <ol start={4} className="grid gap-x-6 gap-y-1 rounded-2xl border border-line bg-surface p-2 sm:p-3 md:grid-cols-2" aria-label={t("rest")}>
          {rest.map((row) => (
            <li key={row.username}>
              <NextLink
                href={profilePath(row.username)}
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition-colors hover:bg-surface-2"
              >
                <span className="w-6 shrink-0 text-end text-sm font-bold text-muted-foreground tabular-nums">{row.rank}</span>
                <Avatar row={row} className="size-9" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <Name row={row} className="text-sm font-bold" />
                  <span className="truncate text-xs font-medium text-muted-foreground">opalo.me{profilePath(row.username)}</span>
                </span>
                <Views value={row.views} period={period} />
              </NextLink>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const TRIGGER =
  "rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-surface-2 data-[state=active]:text-foreground";

/** "Histórico" / "Este mes" switch; both lists come pre-rendered from the server. */
export function LeaderboardTabs({ allTime, month }: { allTime: LeaderboardRow[]; month: LeaderboardRow[] }) {
  const t = useTranslations("Landing.leaderboard");
  return (
    <TabsPrimitive.Root defaultValue="all" className="flex flex-col gap-6">
      <TabsPrimitive.List aria-label={t("period")} className="flex w-fit gap-1 rounded-full border border-line bg-surface p-1">
        <TabsPrimitive.Trigger value="all" className={TRIGGER}>
          {t("allTime")}
        </TabsPrimitive.Trigger>
        <TabsPrimitive.Trigger value="month" className={TRIGGER}>
          {t("month")}
        </TabsPrimitive.Trigger>
      </TabsPrimitive.List>
      <TabsPrimitive.Content value="all" className="outline-none">
        <Board rows={allTime} period="all" />
      </TabsPrimitive.Content>
      <TabsPrimitive.Content value="month" className="outline-none">
        <Board rows={month} period="month" />
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
}
