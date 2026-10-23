"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { GlowOrb } from "@/components/opal/glow-orb";
import { accentPalette, cssLightColors } from "@/lib/profile/colors";
import type { ProfileSettings } from "@/lib/profile/types";
import { usePrefersReducedMotion, useWebGL } from "../hooks";

const ProfileScene = dynamic(() => import("./scene"), { ssr: false, loading: () => null });

type BackgroundSettings = Pick<ProfileSettings, "bg_kind" | "bg_url" | "bg_blur" | "accent_color" | "particles">;

/** Static lights matching Figma 9:603; first paint and the no-WebGL fallback. */
function CssLights({ accent }: { accent: string }) {
  const c = cssLightColors(accent);
  return (
    <>
      <GlowOrb color={c.darkWarm} blur={65} opacity={1} className="top-[-15%] left-[-10%] h-[90%] w-[70%]" />
      <GlowOrb color={c.darkAccent} blur={65} opacity={1} className="top-[10%] left-[45%] h-[96%] w-[75%]" />
      <GlowOrb color={c.darkCool} blur={65} opacity={1} className="top-[55%] left-0 h-[77%] w-[60%]" />
      <GlowOrb color={c.warm} blur={65} opacity={0.28} className="top-[62%] left-[62%] h-[45%] w-[35%]" />
      <GlowOrb color={c.accent} blur={65} opacity={0.35} className="top-[25%] left-[20%] h-[38%] w-[30%]" />
      <GlowOrb color="#f2d49b" blur={65} opacity={0.18} className="top-[-5%] left-[80%] h-[32%] w-[25%]" />
    </>
  );
}

/**
 * Profile background: animated lights (three.js) for `color`, or a blurred image/video,
 * plus particles, a dot texture and a radial vignette.
 */
export function ProfileBackground({ settings, paused = false }: { settings: BackgroundSettings; paused?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGL();
  const palette = useMemo(() => accentPalette(settings.accent_color), [settings.accent_color]);
  const blur = `blur(${settings.bg_blur}px)`;
  const hasMedia = settings.bg_kind !== "color" && Boolean(settings.bg_url);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0b0812]">
      {!hasMedia && <CssLights accent={settings.accent_color} />}

      {hasMedia && settings.bg_kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element -- user upload of unknown size, shown blurred
        <img
          src={settings.bg_url!}
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover"
          style={{ filter: blur }}
          decoding="async"
        />
      )}
      {hasMedia && settings.bg_kind === "video" && (
        <video
          src={settings.bg_url!}
          className="absolute inset-0 size-full scale-110 object-cover"
          style={{ filter: blur }}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {webgl && (
        <ProfileScene
          showBlobs={!hasMedia}
          palette={palette}
          particles={settings.particles}
          still={reducedMotion || paused}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
