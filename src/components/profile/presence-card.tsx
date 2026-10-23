"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { type DiscordStatus, type LanyardResult, STATUS_LABELS, fetchDiscordPresence } from "@/lib/profile/discord";

type PresenceCardProps = {
  name: string;
  text: string;
  avatarUrl: string | null;
  status?: DiscordStatus;
  imageUrl?: string | null;
};

const STATUS_DOT: Record<DiscordStatus, string> = {
  online: "bg-[#23a55a]",
  idle: "bg-[#f0b232]",
  dnd: "bg-[#f23f43]",
  offline: "bg-[#80848e]",
};

const shell = "flex max-w-full items-center gap-3 rounded-lg border border-white/12 bg-black/40 py-2.5 pr-5 pl-2.5 text-left backdrop-blur-[8px]";

/** Figma 9:784 "estado": Discord-style status (custom text, or live from Discord). */
export function PresenceCard({ name, text, avatarUrl, status, imageUrl }: PresenceCardProps) {
  return (
    <div className={shell}>
      <span className="relative shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage or Discord CDN
          <img src={avatarUrl} alt="" className="size-11 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="block size-11 rounded-full bg-opal" />
        )}
        {status && (
          <span
            role="img"
            aria-label={STATUS_LABELS[status]}
            className={cn("absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-[2.5px] border-[#14111c]", STATUS_DOT[status])}
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-bold">{name}</span>
        <span className="truncate text-xs font-medium text-muted-foreground">{text}</span>
      </span>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- activity art from Discord/Spotify CDNs
        <img src={imageUrl} alt="" className="-mr-2 size-10 shrink-0 rounded-md object-cover" />
      )}
    </div>
  );
}

const POLL_MS = 30_000;

/** Polls Lanyard while the tab is visible. `null` while the first request is in flight. */
function useDiscordPresence(discordId: string) {
  const [result, setResult] = useState<{ id: string; value: LanyardResult } | null>(null);

  useEffect(() => {
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      clearTimeout(timer);
      controller?.abort();
      controller = new AbortController();
      try {
        const value = await fetchDiscordPresence(discordId, controller.signal);
        setResult({ id: discordId, value });
      } catch {
        return; // aborted
      }
      if (document.visibilityState === "visible") timer = setTimeout(load, POLL_MS);
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
      else clearTimeout(timer);
    };

    void load();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [discordId]);

  // Ignore a result that belongs to a previous ID (while the panel input changes).
  return result?.id === discordId ? result.value : null;
}

/**
 * Live Discord status. On the public page it hides itself until Lanyard answers and when the
 * account isn't available; the panel preview explains what's missing instead.
 */
export function DiscordPresenceCard({ discordId, preview }: { discordId: string; preview: boolean }) {
  const result = useDiscordPresence(discordId);

  if (!result) {
    return (
      <div className={shell} aria-hidden>
        <span className="size-11 shrink-0 animate-pulse rounded-full bg-white/10" />
        <span className="flex flex-col gap-1.5">
          <span className="h-3.5 w-24 animate-pulse rounded bg-white/10" />
          <span className="h-3 w-36 animate-pulse rounded bg-white/10" />
        </span>
      </div>
    );
  }

  if (result.state === "ok") {
    const p = result.presence;
    return <PresenceCard name={p.name} text={p.text} avatarUrl={p.avatarUrl} status={p.status} imageUrl={p.imageUrl} />;
  }

  if (!preview) return null;
  return (
    <div className={cn(shell, "border-dashed")}>
      <span aria-hidden className="block size-11 shrink-0 rounded-full bg-white/10" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-bold">Discord sin conectar</span>
        <span className="text-xs font-medium text-muted-foreground">
          {result.state === "not-monitored" ? "Entra al servidor de Lanyard para que se vea." : "No pudimos leer tu estado de Discord."}
        </span>
      </span>
    </div>
  );
}
