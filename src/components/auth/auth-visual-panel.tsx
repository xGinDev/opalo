import type { LucideIcon } from "lucide-react";
import { GlowOrb } from "@/components/opal/glow-orb";
import { opalIcons } from "@/components/opal/icons";
import { cn } from "@/lib/utils";

type SampleCard = {
  name: string;
  bio: string;
  colors: [string, string];
  icons: LucideIcon[];
  className: string;
};

const CARDS: SampleCard[] = [
  {
    name: "kairo",
    bio: "stream de martes a sábado",
    colors: ["#f6a8cf", "#b9a7ff"],
    icons: [opalIcons.play, opalIcons.chat, opalIcons.music],
    className: "top-[26px] left-0 -rotate-6",
  },
  {
    name: "luna",
    bio: "fotos, viajes y café",
    colors: ["#f2d49b", "#f6a8cf"],
    icons: [opalIcons.camera, opalIcons.music, opalIcons.globe],
    className: "top-0 left-[292px] rotate-5",
  },
  {
    name: "Estudio Norte",
    bio: "diseño web para marcas",
    colors: ["#8fe3dc", "#f2d49b"],
    icons: [opalIcons.globe, opalIcons.chat],
    className: "top-[232px] left-[180px] -rotate-2",
  },
];

/** Figma 6:169 "Panel visual" shared by login and sign-up. Decorative. */
export function AuthVisualPanel({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative isolate flex-col justify-end gap-4 overflow-hidden rounded-[28px] border border-line bg-surface p-20",
        className,
      )}
    >
      <GlowOrb color="#f6a8cf" blur={55} opacity={0.28} className="top-[39px] left-[379px] size-[360px]" />
      <GlowOrb color="#b9a7ff" blur={55} opacity={0.28} className="top-[179px] left-[139px] size-[420px]" />
      <GlowOrb color="#8fe3dc" blur={55} opacity={0.28} className="top-[329px] left-[459px] size-[300px]" />

      <div className="absolute top-[89px] left-[119px] h-[460px] w-[480px]">
        {CARDS.map((card) => (
          <div
            key={card.name}
            className={cn(
              "absolute flex flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-[rgba(13,11,18,0.72)] px-7 pt-7 pb-6 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] backdrop-blur-[12px]",
              card.className,
            )}
          >
            <span
              className="size-16 rounded-full"
              style={{ backgroundImage: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]} 70%)` }}
            />
            <span className="font-display text-2xl font-extrabold tracking-[-0.02em] whitespace-nowrap [text-shadow:0_0_12px_rgba(255,255,255,0.45)]">
              {card.name}
            </span>
            <span className="text-[13px] font-semibold whitespace-nowrap text-muted-foreground">{card.bio}</span>
            <span className="flex gap-3 pt-1.5">
              {card.icons.map((Icon, i) => (
                <Icon key={i} className="size-[18px]" strokeWidth={1.75} />
              ))}
            </span>
          </div>
        ))}
      </div>

      <p className="relative font-display text-[52px] leading-none font-extrabold tracking-[-0.03em]">
        Tu perfil, tu estilo.
      </p>
      <p className="relative max-w-[520px] text-[17px] leading-normal text-muted-foreground">
        Más de 40 opciones para personalizar: fondos, música, efectos, tipografías y más.
      </p>
    </div>
  );
}
