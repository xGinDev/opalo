import { z } from "zod";
import { USERNAME_REGEX, normalizeUsername } from "@/lib/username";

export const CONTACT_MESSAGE_MAX = 1000;

/** Reason values; their labels live in Contact.reasons. The email to support uses these Spanish labels. */
export const CONTACT_REASONS = ["cuenta", "pagos", "problema", "alianzas", "otro"] as const;
type ContactReason = (typeof CONTACT_REASONS)[number];

const SUPPORT_LABELS: Record<ContactReason, string> = {
  cuenta: "Cuenta y acceso",
  pagos: "Pagos y Premium",
  problema: "Reportar un problema",
  alianzas: "Alianzas y prensa",
  otro: "Otro",
};

/** Accepts "nico", "@nico" or "opalo.me/nico" and returns the normalized username. */
function cleanUsername(value: string) {
  const bare = value.trim().replace(/^https?:\/\//i, "").replace(/^(www\.)?opalo\.me\//i, "").replace(/^@/, "");
  return normalizeUsername(bare);
}

// Messages are translation keys (shown with useMessageText).
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Validation.contact.name").max(80, "Validation.contact.nameMax"),
  email: z.string().trim().pipe(z.email("Validation.contact.email")),
  reason: z.enum(CONTACT_REASONS, "Validation.contact.reason"),
  username: z
    .string()
    .transform(cleanUsername)
    .refine((u) => u === "" || USERNAME_REGEX.test(u), "Validation.contact.username"),
  message: z
    .string()
    .trim()
    .min(10, "Validation.contact.messageMin")
    .max(CONTACT_MESSAGE_MAX, "Validation.contact.messageMax"),
  /** Honeypot: hidden from people, bots tend to fill it. */
  website: z.string().optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactValues = z.output<typeof contactSchema>;

/** Spanish label for the email Ópalo support receives. */
export function contactReasonLabel(value: ContactReason) {
  return SUPPORT_LABELS[value] ?? value;
}
