"use client";

import { useEffect } from "react";

const TYPE_MS = 260;
const HOLD_MS = 1600;

/**
 * Browser tab identity for the public profile: the title types itself out and erases letter by
 * letter (never fully empty, or browsers show the URL), plus the user's own favicon.
 * Both are restored when leaving the profile.
 */
export function TabIdentity({ title, animated, faviconUrl }: { title: string; animated: boolean; faviconUrl: string | null }) {
  useEffect(() => {
    const original = document.title;
    const chars = [...title];
    if (!animated || chars.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.title = title;
      // Streamed metadata can set <title> after this effect; put ours back if that happens.
      const observer = new MutationObserver(() => {
        if (document.title !== title) document.title = title;
      });
      observer.observe(document.head, { childList: true, subtree: true, characterData: true });
      return () => {
        observer.disconnect();
        document.title = original;
      };
    }

    let length = 1;
    let direction = 1;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      document.title = chars.slice(0, length).join("");
      let delay = TYPE_MS;
      if (direction === 1 && length === chars.length) {
        direction = -1;
        delay = HOLD_MS;
      } else if (direction === -1 && length === 1) {
        direction = 1;
        delay = TYPE_MS * 2;
      }
      length += direction;
      timer = setTimeout(tick, delay);
    };
    tick();
    return () => {
      clearTimeout(timer);
      document.title = original;
    };
  }, [title, animated]);

  useEffect(() => {
    if (!faviconUrl) return;
    const links = [...document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']")];
    const previous = links.map((l) => [l, l.href, l.type] as const);
    let added: HTMLLinkElement | null = null;
    if (links.length === 0) {
      added = document.createElement("link");
      added.rel = "icon";
      document.head.appendChild(added);
      links.push(added);
    }
    for (const link of links) {
      link.href = faviconUrl;
      link.removeAttribute("type");
    }
    return () => {
      for (const [link, href, type] of previous) {
        link.href = href;
        if (type) link.type = type;
      }
      added?.remove();
    };
  }, [faviconUrl]);

  return null;
}
