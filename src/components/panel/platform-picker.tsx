"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PLATFORMS, PLATFORM_GROUPS, type Platform } from "@/lib/profile/links";
import { cn } from "@/lib/utils";

const ENTRIES = Object.entries(PLATFORMS) as [Platform, (typeof PLATFORMS)[Platform]][];

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Searchable, grouped grid of ~70 networks for the link editor. */
export function PlatformPicker({ value, onChange }: { value: string; onChange: (platform: Platform) => void }) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return PLATFORM_GROUPS.map((group) => ({
      group,
      items: ENTRIES.filter(([key, meta]) => meta.group === group && (!q || normalize(meta.label).includes(q) || key.includes(q))),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar red (Instagram, Kick, OnlyFans…)"
          aria-label="Buscar red"
          className="pl-10"
        />
      </div>
      <div role="radiogroup" aria-label="Red" className="flex max-h-60 flex-col gap-3 overflow-y-auto rounded-md border border-line bg-background/40 p-2.5">
        {groups.length === 0 && (
          <p className="px-1 py-4 text-center text-sm text-muted-foreground">
            No la encontramos. Usa “Enlace” o “Sitio web” para cualquier otra.
          </p>
        )}
        {groups.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-1.5">
            <p className="px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{group}</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {items.map(([key, meta]) => {
                const Icon = meta.icon;
                const selected = key === value;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(key)}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-sm border px-2.5 py-2 text-left text-[13px] font-semibold transition-colors",
                      selected
                        ? "border-lilac bg-lilac/16 text-foreground"
                        : "border-transparent bg-surface-2 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
