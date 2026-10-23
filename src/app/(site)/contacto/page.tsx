import type { Metadata } from "next";
import { Flag, Mail, MessageCircle, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { GlowOrb } from "@/components/opal/glow-orb";
import { Tag } from "@/components/opal/tag";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos: cuenta, pagos, Premium, alianzas o prensa.",
};

type Channel = { icon: LucideIcon; title: string; detail: React.ReactNode; description: string };

const CHANNELS: Channel[] = [
  {
    icon: Mail,
    title: "Soporte",
    detail: <a href="mailto:soporte@opalo.me">soporte@opalo.me</a>,
    description: "Cuenta, acceso, pagos y Premium.",
  },
  {
    icon: MessageCircle,
    title: "Alianzas y prensa",
    detail: <a href="mailto:hola@opalo.me">hola@opalo.me</a>,
    description: "Colaboraciones, creadores y medios.",
  },
  {
    icon: Flag,
    title: "Reportar un perfil",
    detail: "Botón “Reportar” en cualquier perfil",
    description: "Suplantación, estafas o contenido que incumple las reglas.",
  },
];

/** Figma 23:548 "12 Contacto". */
export default function ContactPage() {
  return (
    <div className="relative mx-auto grid max-w-[1440px] items-start gap-12 px-4 pt-14 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_560px] lg:gap-20 lg:px-20 lg:pt-24 lg:pb-[120px]">
      <GlowOrb
        color="linear-gradient(90deg, #f6a8cf, #b9a7ff 50%, #8fe3dc)"
        blur={70}
        opacity={0.16}
        className="top-[120px] right-[60px] hidden h-[420px] w-[620px] lg:block"
      />

      <div className="relative flex flex-col items-start gap-7">
        <Tag>Contacto</Tag>
        <h1 className="text-5xl font-extrabold tracking-[-0.03em] sm:text-[72px] sm:leading-none">Hablemos.</h1>
        <p className="max-w-[520px] text-base leading-[1.55] text-muted-foreground sm:text-lg">
          ¿Tienes un problema con tu cuenta, una duda sobre Premium o una idea para Ópalo? Escríbenos y te respondemos en
          menos de 48 horas hábiles.
        </p>
        <ul className="flex w-full flex-col gap-3">
          {CHANNELS.map(({ icon: Icon, title, detail, description }) => (
            <li
              key={title}
              className="flex items-start gap-4 rounded-[18px] border border-line bg-surface py-[18px] pr-5 pl-[18px]"
            >
              <span className="rounded-md bg-lilac/14 p-[11px] text-lilac">
                <Icon className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col gap-[3px]">
                <p className="text-[15px] font-bold">{title}</p>
                <p className="text-[15px] font-bold text-lilac [&_a]:underline-offset-4 [&_a:hover]:underline">
                  {detail}
                </p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative rounded-[28px] border border-line bg-surface p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:p-9">
        <ContactForm />
      </div>
    </div>
  );
}
