import { z } from "zod";
import { USERNAME_REGEX, normalizeUsername } from "@/lib/username";

export const CONTACT_MESSAGE_MAX = 1000;

export const CONTACT_REASONS = [
  { value: "cuenta", label: "Cuenta y acceso" },
  { value: "pagos", label: "Pagos y Premium" },
  { value: "problema", label: "Reportar un problema" },
  { value: "alianzas", label: "Alianzas y prensa" },
  { value: "otro", label: "Otro" },
] as const;

type ContactReason = (typeof CONTACT_REASONS)[number]["value"];
const REASON_VALUES = CONTACT_REASONS.map((r) => r.value) as [ContactReason, ...ContactReason[]];

/** Accepts "nico", "@nico" or "opalo.me/nico" and returns the normalized username. */
function cleanUsername(value: string) {
  const bare = value.trim().replace(/^https?:\/\//i, "").replace(/^(www\.)?opalo\.me\//i, "").replace(/^@/, "");
  return normalizeUsername(bare);
}

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80, "Máximo 80 caracteres."),
  email: z.string().trim().pipe(z.email("Escribe un correo válido.")),
  reason: z.enum(REASON_VALUES, "Elige un motivo."),
  username: z
    .string()
    .transform(cleanUsername)
    .refine((u) => u === "" || USERNAME_REGEX.test(u), "Ese usuario no es válido."),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres).")
    .max(CONTACT_MESSAGE_MAX, `Máximo ${CONTACT_MESSAGE_MAX} caracteres.`),
  /** Honeypot: hidden from people, bots tend to fill it. */
  website: z.string().optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactValues = z.output<typeof contactSchema>;

export function contactReasonLabel(value: ContactReason) {
  return CONTACT_REASONS.find((r) => r.value === value)?.label ?? value;
}
