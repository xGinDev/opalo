"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TocItem = { id: string; label: string };

/** Offset (px) below the top of the viewport that counts as "reading this section". */
const ACTIVE_OFFSET = 140;

/**
 * Figma 22:540 "Índice": sticky table of contents that highlights the section in view.
 * The active section is the last one whose heading has scrolled past ACTIVE_OFFSET.
 */
export function LegalToc({ items, title }: { items: TocItem[]; title: string }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        setActiveId(items[items.length - 1]?.id);
        return;
      }
      let current = items[0]?.id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) current = item.id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label={title} className="flex flex-col gap-1">
      <p className="mb-2.5 text-[13px] font-bold text-muted-foreground">{title}</p>
      <ol className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "block border-s-2 py-2 pe-2 ps-3.5 text-sm transition-colors",
                  active
                    ? "border-lilac font-bold text-foreground"
                    : "border-line font-medium text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
