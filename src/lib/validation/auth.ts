import { z } from "zod";
import { USERNAME_MAX, USERNAME_REGEX, normalizeUsername } from "@/lib/username";

export const PASSWORD_MIN = 8;

const email = z.string().trim().pipe(z.email("Escribe un correo válido."));

const newPassword = z
  .string()
  .min(PASSWORD_MIN, `Usa al menos ${PASSWORD_MIN} caracteres.`)
  .max(72, "Máximo 72 caracteres.");

/** Local (no network) reason why a username is invalid, or null if the format is fine. */
export function usernameFormatError(raw: string): string | null {
  const value = normalizeUsername(raw);
  if (!value) return "Elige un nombre de usuario.";
  if (/\s/.test(value)) return "No puede tener espacios.";
  if ([...value].length > USERNAME_MAX) return `Máximo ${USERNAME_MAX} caracteres.`;
  const invalid = [...new Set([...value].filter((c) => !/[a-z0-9ñáéíóúü$_.~!*-]/.test(c)))];
  if (invalid.length) return `No se permite: ${invalid.join(" ")}`;
  if (/[.!]$/.test(value)) return "No puede terminar en “.” ni en “!”.";
  if (!USERNAME_REGEX.test(value)) return "Ese nombre no es válido.";
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
  identifier: z.string().trim().min(1, "Escribe tu correo o tu usuario."),
  password: z.string().min(1, "Escribe tu contraseña."),
  remember: z.boolean(),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email,
  password: newPassword,
  terms: z.boolean().refine((v) => v, "Debes aceptar los Términos y la Política de privacidad."),
});

export const recoverSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden." });

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
