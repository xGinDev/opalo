"use server";

import { Resend } from "resend";
import { profileUrl } from "@/lib/username";
import { type ContactInput, contactReasonLabel, contactSchema } from "@/lib/validation/contact";

const SUPPORT_EMAIL = "soporte@opalo.me";

export type ContactResult =
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<keyof ContactInput, string>> };

export async function sendContactMessage(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactInput;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors };
  }

  const { name, email, reason, username, message, website } = parsed.data;

  // Honeypot filled: pretend it worked so bots don't retry.
  if (website) return { status: "success" };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contacto] RESEND_API_KEY is not set");
    return { status: "error", message: "No pudimos enviar tu mensaje. Escríbenos directamente a soporte@opalo.me." };
  }

  const reasonLabel = contactReasonLabel(reason);
  const text = [
    `Nombre: ${name}`,
    `Correo: ${email}`,
    `Motivo: ${reasonLabel}`,
    `Usuario: ${username ? `${username} (${profileUrl(username)})` : "—"}`,
    "",
    message,
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "Ópalo <contacto@opalo.me>",
    to: SUPPORT_EMAIL,
    replyTo: email,
    subject: `[Contacto · ${reasonLabel}] ${name}`,
    text,
  });

  if (error) {
    console.error("[contacto] Resend error", error);
    return { status: "error", message: "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos." };
  }

  return { status: "success" };
}
