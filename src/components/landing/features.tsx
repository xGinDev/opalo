import type { LucideIcon } from "lucide-react";
import { opalIcons } from "@/components/opal/icons";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: opalIcons.play,
    title: "Fondos en video o imagen",
    description: "Sube un video, un GIF o una foto y ajusta el desenfoque a tu gusto.",
  },
  {
    icon: opalIcons.music,
    title: "Tu música sonando",
    description: "Agrega una canción que suena cuando alguien entra a tu perfil.",
  },
  {
    icon: opalIcons.palette,
    title: "Efectos con personalidad",
    description: "Partículas, brillo en tu nombre, rastro del cursor y tipografías a elegir.",
  },
  {
    icon: opalIcons.chat,
    title: "Estado en vivo",
    description: "Muestra si estás en línea, qué estás jugando o qué estás escuchando.",
  },
  {
    icon: opalIcons.chart,
    title: "Estadísticas de visitas",
    description: "Mira cuántas personas ven tu perfil y en qué redes hacen clic.",
  },
  {
    icon: opalIcons.link,
    title: "Un enlace corto",
    description: "opalo.me/tunombre: fácil de recordar y de poner en cualquier bio.",
  },
];

/** Figma 5:43 "Funciones". */
export function Features() {
  return (
    <section
      id="funciones"
      aria-labelledby="funciones-title"
      className="mx-auto flex max-w-[1440px] scroll-mt-6 flex-col gap-10 px-4 py-20 sm:px-8 lg:gap-14 lg:px-20 lg:py-[110px]"
    >
      <SectionHeading
        id="funciones-title"
        title="Hecho para destacar"
        description="Todo lo que necesitas para que tu perfil se vea único, sin tocar una línea de código."
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {FEATURES.map(({ icon: Icon, title, description }, index) => (
          <Reveal
            as="li"
            key={title}
            delay={(index % 3) * 0.08}
            className="flex flex-col items-start gap-3.5 rounded-xl border border-line bg-surface px-7 pt-7 pb-[30px]"
          >
            <span className="rounded-md bg-lilac/14 p-[11px] text-lilac">
              <Icon className="size-[22px]" strokeWidth={1.75} aria-hidden />
            </span>
            <h3 className="font-sans text-[19px] font-bold">{title}</h3>
            <p className="text-[15px] leading-normal text-muted-foreground">{description}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
