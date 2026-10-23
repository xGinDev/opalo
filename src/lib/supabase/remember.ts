// "Recordarme": when unchecked, auth cookies are written as session cookies
// (no Max-Age / Expires) so they disappear when the browser closes.

export const REMEMBER_COOKIE = "opalo-remember";

type CookieLifetime = { maxAge?: number; expires?: Date };

export function isRemembered(value: string | undefined) {
  return value !== "0";
}

export function applyRemember<T extends CookieLifetime>(options: T, remember: boolean): T {
  if (remember) return options;
  const rest = { ...options };
  delete rest.maxAge;
  delete rest.expires;
  return rest;
}
