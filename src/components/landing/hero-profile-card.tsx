import { Award, Eye, Gem, MapPin, Sparkle } from "lucide-react";
import { SiDiscord, SiSpotify, SiSteam, SiTiktok } from "react-icons/si";
import { GlowOrb } from "@/components/opal/glow-orb";

const OPAL_DIAGONAL = "linear-gradient(135deg, #f6a8cf 0%, #b9a7ff 35.7%, #8fe3dc 71.4%)";
const SOCIALS = [
  { icon: SiDiscord, label: "Discord" },
  { icon: SiTiktok, label: "TikTok" },
  { icon: SiSteam, label: "Steam" },
  { icon: SiSpotify, label: "Spotify" },
];
const SPARKLES = [
  { left: "-14%", top: "4%", size: 11 },
  { left: "104%", top: "-6%", size: 9 },
  { left: "92%", top: "78%", size: 7 },
];

/**
 * Decorative sample profile in the hero, built like a real Ópalo page: blurred background,
 * "Avatar flotante" card with the "Apilada" arrangement (badges under the name, location on
 * its own line, views in the corner).
 */
export function HeroProfileCard() {
  return (
    <div className="relative mx-auto h-[540px] w-full max-w-[460px] sm:h-[600px]" aria-hidden>
      <GlowOrb
        color="linear-gradient(135deg, #f6a8cf, #b9a7ff 50%, #8fe3dc)"
        blur={60}
        opacity={0.3}
        className="top-[60px] left-1/2 size-[min(520px,110%)] -translate-x-1/2"
      />

      {/* The "page": a dark, blurred backdrop like an uploaded image. */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-[#0d0a12] px-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] sm:px-9">
        <GlowOrb color="#7a1f3d" blur={50} opacity={0.75} className="top-[-60px] left-[-90px] size-[320px]" />
        <GlowOrb color="#3b2a7a" blur={55} opacity={0.7} className="top-[180px] right-[-120px] size-[340px]" />
        <GlowOrb color="#8c2a3a" blur={50} opacity={0.5} className="bottom-[-110px] left-[40px] size-[300px]" />
        <GlowOrb color="#f6a8cf" blur={40} opacity={0.12} className="top-[90px] left-[150px] size-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:4px_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]" />

        {/* Snow-like particles. */}
        {[
          [12, 18],
          [84, 12],
          [70, 40],
          [8, 64],
          [90, 74],
          [30, 90],
          [58, 84],
        ].map(([x, y]) => (
          <span key={`${x}-${y}`} className="absolute size-1 rounded-full bg-white/60" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}

        {/* The card: floating avatar over a dark glass panel. */}
        <div className="relative mt-[54px] flex w-full flex-col items-center gap-3 rounded-[22px] border-[3px] border-white/20 bg-black/55 px-6 pt-[70px] pb-14 backdrop-blur-[9px]">
          <div
            className="absolute -top-[54px] left-1/2 flex size-[108px] -translate-x-1/2 items-center justify-center rounded-full border-3 border-white/18 shadow-[0_0_36px_rgba(185,167,255,0.5)]"
            style={{ backgroundImage: OPAL_DIAGONAL }}
          >
            <span className="font-display text-[38px] font-extrabold text-on-accent">JD</span>
            <span className="absolute right-[4%] bottom-[4%] size-[20%] rounded-full border-4 border-[#0b0812] bg-success" />
          </div>

          <span className="relative font-display text-[40px] leading-none font-extrabold tracking-[-0.02em] [text-shadow:0_0_10px_rgba(255,255,255,0.6),0_0_26px_rgba(185,167,255,0.5)]">
            John Doe
            {SPARKLES.map((s) => (
              <Sparkle
                key={s.left}
                className="absolute text-white drop-shadow-[0_0_6px_#b9a7ff]"
                style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </span>

          <span className="flex gap-[7px] rounded-full border border-white/12 bg-white/9 px-2.5 py-1.5">
            <Gem className="size-[15px] text-lilac" />
            <Award className="size-[15px] text-gold" />
            <Sparkle className="size-[15px] text-aqua" />
          </span>

          <p className="text-base font-semibold">
            todo lo mío, en un solo lugar<span className="ml-0.5 inline-block h-[1.05em] w-[2px] animate-blink bg-white align-[-0.15em]" />
          </p>

          <p className="flex items-center gap-1.5 text-[13px] font-bold">
            <MapPin className="size-[15px]" fill="currentColor" strokeWidth={0} /> en algún lugar
          </p>

          <div className="flex gap-4 pt-2">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <Icon key={label} className="size-[30px] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.75)]" />
            ))}
          </div>

          <p className="absolute bottom-4 left-5 flex items-center gap-1.5 text-[13px] font-bold">
            <Eye className="size-[15px]" /> 48.210
          </p>
        </div>
      </div>
    </div>
  );
}
