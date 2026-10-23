// Must match the database rules (0002_usernames_especiales.sql).
export const USERNAME_MIN = 1;
export const USERNAME_MAX = 20;
export const USERNAME_REGEX = /^[a-z0-9ñáéíóúü$_.~!*-]{0,19}[a-z0-9ñáéíóúü$_~*-]$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().normalize("NFC");
}

export function isValidUsername(value: string) {
  return USERNAME_REGEX.test(normalizeUsername(value));
}

/** Path segment for a username, keeping `$` readable. */
export function profilePath(username: string) {
  return "/" + encodeURIComponent(username).replace(/%24/g, "$");
}

export function profileUrl(username: string) {
  return "https://opalo.me" + profilePath(username);
}
