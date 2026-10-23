"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { particleColor } from "@/lib/profile/colors";
import type { ProfileSettings } from "@/lib/profile/types";
import { usePrefersReducedMotion, useWebGL } from "../hooks";

const ProfileScene = dynamic(() => import("./scene"), { ssr: false, loading: () => null });

type BackgroundSettings = Pick<ProfileSettings, "bg_kind" | "bg_url" | "bg_blur" | "bg_color" | "accent_color" | "particles">;

/**
 * Profile background: a solid color the user picks (`color`), or a blurred image/video
 * with a dot texture and vignette for legibility. Particles (three.js) go on top of either.
 */
export function ProfileBackground({ settings, paused = false }: { settings: BackgroundSettings; paused?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGL();
  const color = useMemo(() => particleColor(settings.particles, settings.accent_color), [settings.particles, settings.accent_color]);
  const blur = `blur(${settings.bg_blur}px)`;
  const hasMedia = settings.bg_kind !== "color" && Boolean(settings.bg_url);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      // `?? ` covers profiles loaded before migration 0006 adds bg_color.
      style={{ backgroundColor: hasMedia ? "#0b0812" : (settings.bg_color ?? "#0b0812") }}
    >
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
      {hasMedia && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:4px_4px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
        </>
      )}

      {webgl && settings.particles !== "none" && (
        <ProfileScene color={color} particles={settings.particles} still={reducedMotion || paused} />
      )}
    </div>
  );
}
