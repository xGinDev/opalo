import type { LucideIcon } from "lucide-react";
import { GlowOrb } from "@/components/opal/glow-orb";
import { opalIcons } from "@/components/opal/icons";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Example = {
  label: string;
  name: string;
  bio: string;
  background: string;
  colors: [string, string];
  socials: LucideIcon[];
};

const EXAMPLES: Example[] = [
  {
    label: "Gamer",
    name: "kairo",
    bio: "stream de martes a sábado",
    background: "#2a0f2e",
    colors: ["#f6a8cf", "#b9a7ff"],
    socials: [opalIcons.play, opalIcons.chat, opalIcons.music, opalIcons.globe],
  },
  {
    label: "Creadora",
    name: "luna",
    bio: "fotos, viajes y café",
    background: "#2b1a1f",
    colors: ["#f2d49b", "#f6a8cf"],
    socials: [opalIcons.camera, opalIcons.music, opalIcons.globe],
  },
  {
    label: "Negocio",
    name: "Estudio Norte",
    bio: "diseño web para marcas",
    background: "#14181c",
    colors: ["#8fe3dc", "#f2d49b"],
    socials: [opalIcons.globe, opalIcons.chat, opalIcons.camera],
  },
];

/** Figma 5:97 "Ejemplos". */
export function Examples() {
  return (
    <section
      id="ejemplos"
      aria-labelledby="ejemplos-title"
      className="mx-auto flex max-w-[1440px] scroll-mt-6 flex-col gap-10 px-4 pt-10 pb-20 sm:px-8 lg:gap-14 lg:px-20 lg:pb-[110px]"
    >
      <SectionHeading
        id="ejemplos-title"
        title="Un perfil para cada estilo"
        description="Gamers, creadores o negocios: cada quien lo arma a su manera."
      />
      <ul className="grid gap-8 md:grid-cols-3">
        {EXAMPLES.map((example, index) => (
          <Reveal as="li" key={example.label} delay={index * 0.08} className="flex flex-col gap-4">
            <div
              aria-hidden
              className="relative flex h-[420px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/8 pt-14 pb-10"
              style={{ backgroundColor: example.background }}
            >
              <GlowOrb color={example.colors[0]} blur={40} opacity={0.35} className="top-[-41px] left-[-61px] size-[260px]" />
              <GlowOrb color={example.colors[1]} blur={40} opacity={0.35} className="right-[-54px] bottom-[-59px] size-[240px]" />
              <span
                className="relative size-[84px] rounded-full border-3 border-white/20"
                style={{ backgroundImage: `linear-gradient(135deg, ${example.colors[0]}, ${example.colors[1]} 70%)` }}
              />
              <span className="relative font-display text-[28px] font-extrabold tracking-[-0.02em] [text-shadow:0_0_14px_rgba(255,255,255,0.45)]">
                {example.name}
              </span>
              <span className="relative text-sm font-semibold text-muted-foreground">{example.bio}</span>
              <span className="relative flex gap-3.5 pt-2">
                {example.socials.map((Icon, i) => (
                  <Icon key={i} className="size-[22px]" strokeWidth={1.75} />
                ))}
              </span>
            </div>
            <p className="text-base font-bold">
              {example.label}
              <span className="sr-only">: perfil de ejemplo de {example.name}, {example.bio}</span>
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
