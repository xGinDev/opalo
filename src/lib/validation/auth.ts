import { z } from "zod";
import { messageKey } from "@/i18n/message-key";
import { USERNAME_MAX, USERNAME_REGEX, normalizeUsername } from "@/lib/username";

// Messages are translation keys (shown with useMessageText).

export const PASSWORD_MIN = 8;

const email = z.string().trim().pipe(z.email("Validation.email"));

const newPassword = z.string().min(PASSWORD_MIN, "Validation.passwordMin").max(72, "Validation.passwordMax");

/** Local (no network) reason why a username is invalid (a message key), or null if the format is fine. */
export function usernameFormatError(raw: string): string | null {
  const value = normalizeUsername(raw);
  if (!value) return "Validation.username.required";
  if (/\s/.test(value)) return "Validation.username.spaces";
  if ([...value].length > USERNAME_MAX) return messageKey("Validation.username.max", { max: USERNAME_MAX });
  const invalid = [...new Set([...value].filter((c) => !/[a-z0-9ñáéíóúü$_.~!*-]/.test(c)))];
  if (invalid.length) return messageKey("Validation.username.notAllowed", { chars: invalid.join(" ") });
  if (/[.!]$/.test(value)) return "Validation.username.endsWith";
  if (!USERNAME_REGEX.test(value)) return "Validation.username.invalid";
  return null;
}

export const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .superRefine((value, ctx) => {
    const error = usernameFormatError(value);
    if (error) ctx.addIssue({ code: "custom", message: error });
  });

/** Login accepts an email or a username ("nico", "@nico" or "opalo.me/nico"). */
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Validation.identifier"),
  password: z.string().min(1, "Validation.password"),
  remember: z.boolean(),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email,
  password: newPassword,
  terms: z.boolean().refine((v) => v, "Validation.terms"),
});

export const recoverSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Validation.passwordsMismatch" });

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;
export type RecoverInput = z.input<typeof recoverSchema>;
export type NewPasswordInput = z.input<typeof newPasswordSchema>;

const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Splits the login identifier into an email or a normalized username. */
export function parseLoginIdentifier(raw: string): { email: string } | { username: string } {
  const value = raw.trim();
  if (EMAIL_LIKE.test(value)) return { email: value };
  return { username: normalizeUsername(value.replace(/^(https?:\/\/)?(www\.)?opalo\.me\//i, "").replace(/^@/, "")) };
}
