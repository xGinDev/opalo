import { Award, Check, Eye, Gem } from "lucide-react";
import { GlowOrb } from "@/components/opal/glow-orb";
import { opalIcons } from "@/components/opal/icons";

const OPAL_DIAGONAL = "linear-gradient(135deg, #f6a8cf 0%, #b9a7ff 35.7%, #8fe3dc 71.4%)";
const SOCIALS = [
  { icon: opalIcons.chat, label: "Discord" },
  { icon: opalIcons.camera, label: "Instagram" },
  { icon: opalIcons.play, label: "YouTube" },
  { icon: opalIcons.music, label: "Spotify" },
  { icon: opalIcons.globe, label: "Sitio web" },
];

/** Figma 3:41 — decorative sample profile shown in the hero. */
export function HeroProfileCard() {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[460px] sm:h-[660px]" aria-hidden>
      <GlowOrb
        color="linear-gradient(135deg, #f6a8cf, #b9a7ff 50%, #8fe3dc)"
        blur={60}
        opacity={0.35}
        className="top-[70px] left-1/2 size-[min(520px,110%)] -translate-x-1/2"
      />

      <div className="absolute top-[10px] left-1/2 flex w-[min(400px,100%)] -translate-x-1/2 flex-col items-center gap-4 overflow-hidden rounded-3xl border border-white/8 bg-[#120f1a] px-8 pt-12 pb-9 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
        <GlowOrb color="#f6a8cf" blur={45} opacity={0.32} className="top-[-61px] left-[-81px] size-[300px]" />
        <GlowOrb color="#b9a7ff" blur={45} opacity={0.32} className="top-[119px] left-[179px] size-[280px]" />
        <GlowOrb color="#8fe3dc" blur={45} opacity={0.32} className="top-[379px] left-[-41px] size-[260px]" />

        <div
          className="relative flex size-[108px] items-center justify-center rounded-full border-3 border-white/18 shadow-[0_0_40px_rgba(185,167,255,0.55)]"
          style={{ backgroundImage: OPAL_DIAGONAL }}
        >
          <span className="font-display text-[44px] font-extrabold text-on-accent">N</span>
        </div>

        <div className="relative flex items-center gap-2.5">
          <span className="font-display text-[38px] leading-none font-extrabold tracking-[-0.02em] [text-shadow:0_0_16px_rgba(255,255,255,0.55)]">
            nico
          </span>
          <span className="flex gap-1.5 rounded-full bg-white/8 px-[9px] py-[5px]">
            <Gem className="size-[15px] text-lilac" />
            <Award className="size-[15px] text-gold" />
            <Check className="size-[15px] text-aqua" />
          </span>
        </div>

        <p className="relative text-base font-semibold">dev de día, gamer de noche</p>

        <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-black/35 py-2.5 pr-[18px] pl-2.5">
          <span className="size-10 rounded-full bg-opal" />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-bold">nico</span>
            <span className="text-xs font-medium text-muted-foreground">en línea, escuchando música</span>
          </span>
        </div>

        <div className="relative flex gap-[18px] py-1.5">
          {SOCIALS.map(({ icon: Icon, label }) => (
            <Icon key={label} className="size-[26px] drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" strokeWidth={1.75} />
          ))}
        </div>

        <div className="relative flex items-center gap-3">
          <span className="size-12 shrink-0 rounded-sm bg-[linear-gradient(180deg,#f6a8cf,#b9a7ff_50%,#8fe3dc)]" />
          <span className="flex flex-col gap-2">
            <span className="text-sm font-bold">midnight drive</span>
            <span className="relative h-[3px] w-[min(220px,40vw)] overflow-hidden rounded-[2px] bg-white/20">
              <span className="absolute inset-y-0 left-0 w-[42%] rounded-[2px] bg-white" />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">1:34 / 3:33</span>
          </span>
        </div>

        <p className="relative flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Eye className="size-[15px]" /> 48.210 visitas
        </p>
      </div>
    </div>
  );
}
