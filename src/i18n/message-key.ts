// Message keys with values, shared by server code (schemas, actions) and the browser.

/** "Validation.username.notAllowed?chars=%40" → key + values for the placeholders. */
export function parseMessageKey(message: string): { key: string; values: Record<string, string> } | null {
  const [key, query] = message.split("?", 2);
  if (!/^[A-Z][\w-]*(\.[\w-]+)+$/.test(key)) return null;
  return { key, values: Object.fromEntries(new URLSearchParams(query ?? "")) };
}

/** Builds a message key with values (used by schemas and server actions). */
export function messageKey(key: string, values?: Record<string, string | number>) {
  if (!values) return key;
  return `${key}?${new URLSearchParams(Object.entries(values).map(([k, v]) => [k, String(v)]))}`;
}
