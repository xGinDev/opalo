"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, MapPin, Volume2, VolumeX } from "lucide-react";
import { formatCount, joinedAgo, tabTitleOf } from "@/lib/profile/format";
import type { PublicLink, PublicProfile } from "@/lib/profile/types";
import { cn } from "@/lib/utils";
import { ProfileBackground } from "./background/profile-background";
import { CursorTrail } from "./cursor-trail";
import { EnterScreen } from "./enter-screen";
import { useFinePointer, usePrefersReducedMotion } from "./hooks";
import { MusicPlayer } from "./music-player";
import { PresenceCard } from "./presence-card";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileBadges } from "./profile-badges";
import { ProfileName } from "./profile-name";
import { ReportDialog } from "./report-dialog";
import { SocialLinks } from "./social-links";
import { TabIdentity } from "./tab-identity";
import { Tilt } from "./tilt";
import { TypingBio } from "./typing-bio";
import { useAudio } from "./use-audio";

type ProfileViewProps = {
  data: PublicProfile;
  /**
   * `page`: opalo.me/<username> (enter screen, tracking, fixed background, report).
   * `preview`: inside the panel's phone frame, fed by the form state.
   */
  variant?: "page" | "preview";
};

function trackClick(link: PublicLink) {
  const body = new Blob([JSON.stringify({ linkId: link.id })], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track/click", body)) {
    void fetch("/api/track/click", { method: "POST", body, keepalive: true });
  }
}

/**
 * The public profile (Figma 9:602 card, 10:470 centered, 10:745 mobile). Layout switches on the
 * container width (@3xl = 768px), so the same component renders the mobile look in the preview.
 */
export function ProfileView({ data, variant = "page" }: ProfileViewProps) {
  const { profile, settings, links, badges, views } = data;
  const isPage = variant === "page";
  const isCard = settings.layout === "card";
  const name = profile.display_name?.trim() || profile.username;
  const accent = settings.accent_color;
  const musicUrl = settings.music_url;

  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const [entered, setEntered] = useState(!isPage);
  const [audioRef, audio] = useAudio(musicUrl);

  // Count the visit once per page load (the server hashes the visitor and dedupes for 30 min).
  const tracked = useRef(false);
  useEffect(() => {
    if (!isPage || tracked.current) return;
    tracked.current = true;
    void fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: profile.username, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {});
  }, [isPage, profile.username]);

  function enter() {
    setEntered(true);
    if (musicUrl) void audio.play();
  }

  const showPresence = settings.show_presence && Boolean(settings.presence_text?.trim());
  const showPlayer = settings.show_player && Boolean(musicUrl);

  return (
    <div
      className={cn(
        "@container relative isolate flex w-full flex-col text-foreground",
        isPage ? "min-h-dvh" : "h-full overflow-x-hidden overflow-y-auto",
      )}
    >
      <div className={cn(isPage ? "fixed" : "absolute", "inset-0 -z-10")}>
        <ProfileBackground settings={settings} />
      </div>

      {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="metadata" />}

      {isPage && musicUrl && (
        <button
          type="button"
          onClick={audio.toggleMute}
          aria-label={audio.muted ? "Activar sonido" : "Silenciar"}
          aria-pressed={audio.muted}
          className="fixed top-4 left-4 z-30 rounded-[14px] border border-white/14 bg-black/45 p-3.5 backdrop-blur-[6px] transition-colors hover:bg-black/60 @3xl:top-5 @3xl:left-5"
        >
          {audio.muted ? <VolumeX className="size-6" aria-hidden /> : <Volume2 className="size-6" aria-hidden />}
        </button>
      )}

      {isPage && settings.cursor_trail && finePointer && !reducedMotion && <CursorTrail color={accent} />}

      {/* Mobile: full-width panel (16px sides), height from its content, centered vertically. Desktop: centered card. */}
      <div
        className={cn(
          "flex flex-1 flex-col justify-center px-4 pb-4 @3xl:flex-row @3xl:items-center @3xl:px-8 @3xl:py-24",
          isPage && musicUrl ? "pt-[76px]" : "pt-4",
        )}
      >
        <Tilt
          enabled={settings.tilt_3d && finePointer && !reducedMotion}
          wrapperClassName="w-full @3xl:w-auto"
          className="w-full @3xl:w-auto"
        >
          <section
            aria-label={`Perfil de ${name}`}
            className={cn(
              "flex w-full flex-col items-center gap-4 text-center",
              // Background (card_opacity) and border apply to both layouts at every size.
              "rounded-[22px] bg-[var(--card-bg)] px-5 py-6 backdrop-blur-[9px]",
              settings.card_border ? "border-[3px] border-white/22 @3xl:border-4" : "border border-white/10",
              settings.card_opacity > 0 && "shadow-[0_30px_45px_rgba(0,0,0,0.6)]",
              settings.card_opacity === 0 && !settings.card_border && "border-transparent px-0 py-0 backdrop-blur-none",
              isCard
                ? "@3xl:mx-auto @3xl:w-[740px] @3xl:items-start @3xl:gap-[22px] @3xl:px-[30px] @3xl:pt-[30px] @3xl:pb-[26px] @3xl:text-left"
                : "@3xl:mx-auto @3xl:w-fit @3xl:max-w-[560px] @3xl:min-w-[480px] @3xl:gap-[18px] @3xl:px-12 @3xl:py-10",
            )}
            style={{ "--card-bg": `rgba(0,0,0,${settings.card_opacity})` } as React.CSSProperties}
          >
            <div
              className={cn(
                // Full width so the name row and bio never shrink to the avatar's width.
                "flex w-full flex-col items-center gap-4",
                isCard ? "@3xl:flex-row @3xl:gap-[22px]" : "@3xl:gap-[18px]",
              )}
            >
              <ProfileAvatar
                name={name}
                avatarUrl={profile.avatar_url}
                accent={accent}
                online={settings.show_online}
                className={cn("size-[108px]", isCard ? "@3xl:size-[124px]" : "@3xl:size-32")}
              />
              <div className={cn("flex w-full min-w-0 flex-col items-center gap-2", isCard && "@3xl:w-auto @3xl:flex-1 @3xl:items-start")}>
                <div className={cn("flex flex-wrap items-center justify-center gap-2.5", isCard && "@3xl:justify-start @3xl:gap-3")}>
                  <ProfileName
                    name={name}
                    font={settings.name_font}
                    effect={settings.name_effect}
                    accent={accent}
                    still={reducedMotion}
                    as={isPage ? "h1" : "p"}
                    className={cn("text-[38px]", isCard ? "@3xl:text-[44px]" : "@3xl:text-[46px]")}
                  />
                  {settings.show_badges && <ProfileBadges badges={badges} />}
                </div>
                <TypingBio bio={profile.bio} still={reducedMotion} className="text-[15px] font-semibold @3xl:text-[17px]" />
                {isCard && (
                  <p className="hidden text-xs font-medium text-muted-foreground @3xl:block">{joinedAgo(profile.created_at)}</p>
                )}
              </div>
            </div>

            {showPresence && <PresenceCard name={name} text={settings.presence_text!.trim()} avatarUrl={profile.avatar_url} />}

            <SocialLinks
              links={links}
              accent={accent}
              still={reducedMotion}
              onLinkClick={isPage ? trackClick : undefined}
              className={cn(
                "gap-3.5 [--icon-size:28px]",
                isCard ? "@3xl:justify-start @3xl:gap-3 @3xl:[--icon-size:30px]" : "@3xl:gap-4 @3xl:[--icon-size:32px]",
              )}
            />

            {showPlayer && (
              <MusicPlayer
                title={settings.music_title?.trim() || "Sin título"}
                audio={audio}
                accent={accent}
                className={cn("max-w-[340px]", isCard ? "@3xl:max-w-[560px]" : "@3xl:max-w-[520px]")}
              />
            )}

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-[13px] font-bold">
              <span className="flex items-center gap-1.5">
                <Eye className="size-[15px]" aria-hidden />
                <span>
                  {formatCount(views)}
                  <span className="sr-only"> visitas</span>
                </span>
              </span>
              {profile.location && (
                <>
                  <span aria-hidden className="h-3.5 w-px bg-white/25" />
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-[15px]" fill="currentColor" strokeWidth={0} aria-hidden />
                    {profile.location}
                  </span>
                </>
              )}
            </div>
          </section>
        </Tilt>
      </div>

      <footer className="flex flex-col items-center gap-2 pb-6 text-center">
        {settings.show_branding &&
          (isPage ? (
            <Link href="/" className="rounded-sm text-[11px] font-semibold text-muted-foreground hover:text-foreground @3xl:text-xs">
              Hecho con ópalo
            </Link>
          ) : (
            <span className="text-[11px] font-semibold text-muted-foreground">Hecho con ópalo</span>
          ))}
        {isPage && <ReportDialog profileId={profile.id} username={profile.username} />}
      </footer>

      {isPage && (
        <>
          <TabIdentity
            title={tabTitleOf(settings, profile.username)}
            animated={settings.tab_title_animated ?? true}
            faviconUrl={settings.favicon_url ?? null}
          />
          <EnterScreen open={!entered} username={profile.username} text={settings.enter_text} onEnter={enter} />
        </>
      )}
    </div>
  );
}
