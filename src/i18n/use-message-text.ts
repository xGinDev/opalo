"use client";

import { useTranslations } from "next-intl";
import { parseMessageKey } from "./message-key";

/**
 * Schemas and server actions return message keys ("Validation.contact.name", "Errors.network"…)
 * so they work the same on the server and in the browser; this turns them into text.
 * Anything that isn't a known key is shown as-is.
 */
export function useMessageText() {
  const t = useTranslations();
  return (message: string | undefined | null) => {
    if (!message) return "";
    const parsed = parseMessageKey(message);
    return parsed && t.has(parsed.key) ? t(parsed.key, parsed.values) : message;
  };
}
