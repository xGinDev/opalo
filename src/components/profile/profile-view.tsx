"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Eye, MapPin, Volume2, VolumeX } from "lucide-react";
import { type FlowBlock, arrangementMeta } from "@/lib/profile/arrangements";
import { cardStyleMeta } from "@/lib/profile/card-styles";
import { formatCount, joinedRelative, tabTitleOf } from "@/lib/profile/format";
import type { PublicLink, PublicProfile } from "@/lib/profile/types";
import { cn } from "@/lib/utils";
import { ProfileBackground } from "./background/profile-background";
import { CursorTrail } from "./cursor-trail";
import { EnterScreen } from "./enter-screen";
import { useFinePointer, usePrefersReducedMotion } from "./hooks";
import { MusicPlayer } from "./music-player";
import { DiscordPresenceCard, PresenceCard } from "./presence-card";
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
  const t = useTranslations("Profile");
  const locale = useLocale();
  const isPage = variant === "page";
  const isCard = settings.layout === "card";
  const name = profile.display_name?.trim() || profile.username;
  const accent = settings.accent_color;
  const musicUrl = settings.music_url;

  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const [entered, setEntered] = useState(!isPage);
  const [audioRef, audio] = useAudio(musicUrl, (settings.music_volume ?? 60) / 100);

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

  const discordId = settings.presence_source === "discord" && settings.discord_id ? settings.discord_id : null;
  const showPresence = settings.show_presence && (discordId !== null || Boolean(settings.presence_text?.trim()));
  const showPlayer = settings.show_player && Boolean(musicUrl);
  const style = cardStyleMeta(settings.card_style);
  const classic = style.id === "classic";
  const floating = style.id === "floating";
  const detachedPlayer = showPlayer && style.detachedPlayer;
  const arr = arrangementMeta(settings.arrangement);
  // "row" puts the photo beside the text at every size; the card layout does it on desktop only.
  const rowAlways = arr.identity === "row";
  const showAvatar = arr.avatar;
  const hasCorners = arr.stats === "corner" || (arr.location === "corner" && Boolean(profile.location));
  const cardVars = {
    "--card-bg": `rgba(0,0,0,${settings.card_opacity})`,
    "--card-alpha": settings.card_opacity,
    "--accent": accent,
  } as React.CSSProperties;

  const joinedWhen = joinedRelative(profile.created_at, locale);
  const joined = joinedWhen ? t("joined", { when: joinedWhen }) : t("joinedToday");
  const viewsLabel = (
    <span className="flex items-center gap-1.5">
      <Eye className="size-[15px]" aria-hidden />
      <span>
        {formatCount(views, locale)}
        <span className="sr-only"> {t("views")}</span>
      </span>
    </span>
  );
  const locationLabel = (
    <span className="flex min-w-0 items-center gap-1.5">
      <MapPin className="size-[15px] shrink-0" fill="currentColor" strokeWidth={0} aria-hidden />
      <span className="truncate">{profile.location}</span>
    </span>
  );
  const linksFirst = arr.order[0] === "links";
  const flow: Record<FlowBlock, React.ReactNode> = {
    presence: showPresence ? (
      <div key="presence" className={cn("contents", rowAlways && "[&>*]:self-start")}>
        {discordId ? (
          <DiscordPresenceCard discordId={discordId} preview={!isPage} />
        ) : (
          <PresenceCard name={name} text={settings.presence_text!.trim()} avatarUrl={profile.avatar_url} />
        )}
      </div>
    ) : null,
    links: (
      <SocialLinks
        key="links"
        links={links}
        accent={accent}
        iconStyle={settings.icon_style ?? "mono"}
        still={reducedMotion}
        onLinkClick={isPage ? trackClick : undefined}
        className={cn(
          "gap-3.5 [--icon-size:28px]",
          isCard ? "@3xl:justify-start @3xl:gap-3 @3xl:[--icon-size:30px]" : "@3xl:gap-4 @3xl:[--icon-size:32px]",
          rowAlways && "justify-start",
          // Right under the name, the icons get a bit more weight.
          linksFirst && "[--icon-size:32px] @3xl:[--icon-size:34px]",
        )}
      />
    ),
    player:
      showPlayer && !detachedPlayer ? (
        <MusicPlayer
          key="player"
          title={settings.music_title?.trim() || t("untitled")}
          coverUrl={settings.music_cover_url ?? null}
          audio={audio}
          accent={accent}
          className={cn("max-w-[340px]", isCard ? "@3xl:max-w-[560px]" : "@3xl:max-w-[520px]")}
        />
      ) : null,
  };

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
          aria-label={audio.muted ? t("unmute") : t("mute")}
          aria-pressed={audio.muted}
          className="fixed start-4 top-4 z-30 rounded-[14px] border border-white/14 bg-black/45 p-3.5 backdrop-blur-[6px] transition-colors hover:bg-black/60 @3xl:start-5 @3xl:top-5"
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
          <div className="flex w-full flex-col gap-3 @3xl:w-auto">
            <section
              aria-label={t("profileOf", { name })}
              className={cn(
                "relative isolate flex w-full flex-col items-center gap-4 px-5 py-6 text-center",
                // Classic: background (card_opacity) and border apply to both layouts at every size.
                classic && "rounded-[22px] bg-[var(--card-bg)] backdrop-blur-[9px]",
                classic && (settings.card_border ? "border-[3px] border-white/22 @3xl:border-4" : "border border-white/10"),
                classic && settings.card_opacity > 0 && "shadow-[0_30px_45px_rgba(0,0,0,0.6)]",
                classic && settings.card_opacity === 0 && !settings.card_border && "border-transparent px-0 py-0 backdrop-blur-none",
                // Premium designs (globals.css): their own fill, glow and border.
                !classic && style.className,
                !classic && style.id !== "glass" && "backdrop-blur-[9px]",
                !classic && !style.ownBorder && settings.card_border && "border-[3px] border-white/22 @3xl:border-4",
                floating && showAvatar && (isCard ? "mt-[54px] @3xl:mt-[62px]" : "mt-[54px] @3xl:mt-16"),
                isCard
                  ? "@3xl:mx-auto @3xl:w-[740px] @3xl:items-start @3xl:gap-[22px] @3xl:px-[30px] @3xl:pt-[30px] @3xl:pb-[26px] @3xl:text-start"
                  : "@3xl:mx-auto @3xl:w-fit @3xl:max-w-[560px] @3xl:min-w-[480px] @3xl:gap-[18px] @3xl:px-12 @3xl:py-10",
                rowAlways && "items-start text-start",
                // Room for the views / location pinned to the bottom corners.
                hasCorners && "pb-14 @3xl:pb-16",
              )}
              style={cardVars}
            >
              <div
                className={cn(
                  // Full width so the name row and bio never shrink to the avatar's width.
                  "flex w-full flex-col items-center gap-4",
                  isCard ? "@3xl:flex-row @3xl:gap-[22px]" : "@3xl:gap-[18px]",
                  rowAlways && "flex-row gap-4 @3xl:flex-row @3xl:gap-[22px]",
                  floating && (isCard || rowAlways) && "@3xl:items-start",
                  floating && rowAlways && "items-start",
                )}
              >
                {showAvatar && (
                  <ProfileAvatar
                    name={name}
                    avatarUrl={profile.avatar_url}
                    accent={accent}
                    online={settings.show_online}
                    className={cn(
                      rowAlways ? "size-[84px] @3xl:size-[112px]" : "size-[108px]",
                      !rowAlways && (isCard ? "@3xl:size-[124px]" : "@3xl:size-32"),
                      // Avatar flotante: half of the photo sits above the card's top edge.
                      floating &&
                        (rowAlways
                          ? "-mt-[66px] @3xl:-mt-[86px]"
                          : isCard
                            ? "-mt-[78px] @3xl:-mt-[92px]"
                            : "-mt-[78px] @3xl:-mt-[104px]"),
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex w-full min-w-0 flex-col items-center gap-2",
                    isCard && "@3xl:w-auto @3xl:flex-1 @3xl:items-start",
                    rowAlways && "w-auto flex-1 items-start gap-1.5",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-wrap items-center justify-center gap-2.5",
                      (isCard || rowAlways) && "@3xl:justify-start @3xl:gap-3",
                      rowAlways && "justify-start",
                    )}
                  >
                    <ProfileName
                      name={name}
                      font={settings.name_font}
                      effect={settings.name_effect}
                      sparkleColor={settings.name_fx_color ?? null}
                      accent={accent}
                      still={reducedMotion}
                      as={isPage ? "h1" : "p"}
                      className={cn(
                        rowAlways ? "text-[30px] @3xl:text-[40px]" : "text-[38px]",
                        !rowAlways && (isCard ? "@3xl:text-[44px]" : "@3xl:text-[46px]"),
                        !showAvatar && "text-[44px] @3xl:text-[56px]",
                      )}
                    />
                    {settings.show_badges && arr.badges === "inline" && <ProfileBadges badges={badges} />}
                  </div>
                  {settings.show_badges && arr.badges === "below" && <ProfileBadges badges={badges} />}
                  <TypingBio bio={profile.bio} still={reducedMotion} className="text-[15px] font-semibold @3xl:text-[17px]" />
                  {arr.location === "line" && profile.location && (
                    <p className="flex items-center gap-1.5 text-[13px] font-bold">
                      <MapPin className="size-[15px]" fill="currentColor" strokeWidth={0} aria-hidden />
                      {profile.location}
                    </p>
                  )}
                  {isCard && !rowAlways && (
                    <p className="hidden text-xs font-medium text-muted-foreground @3xl:block">{joined}</p>
                  )}
                </div>
              </div>

              {arr.order.map((block) => flow[block])}

              {(arr.stats === "inline" || (arr.location === "stats" && profile.location)) && (
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-center gap-2.5 text-[13px] font-bold",
                    rowAlways && "justify-start",
                  )}
                >
                  {arr.stats === "inline" && viewsLabel}
                  {arr.stats === "inline" && arr.location === "stats" && profile.location && (
                    <span aria-hidden className="h-3.5 w-px bg-white/25" />
                  )}
                  {arr.location === "stats" && profile.location && locationLabel}
                </div>
              )}

              {arr.stats === "corner" && (
                <div className="absolute start-5 bottom-4 text-[13px] font-bold @3xl:start-[30px] @3xl:bottom-5">{viewsLabel}</div>
              )}
              {arr.location === "corner" && profile.location && (
                <div className="absolute end-5 bottom-4 max-w-[55%] text-[13px] font-bold @3xl:end-[30px] @3xl:bottom-5">
                  {locationLabel}
                </div>
              )}
            </section>

            {detachedPlayer && (
              <div className={cn("relative isolate px-4 py-3 backdrop-blur-[9px]", style.className)} style={cardVars}>
                <MusicPlayer
                  title={settings.music_title?.trim() || t("untitled")}
                  coverUrl={settings.music_cover_url ?? null}
                  audio={audio}
                  accent={accent}
                />
              </div>
            )}
          </div>
        </Tilt>
      </div>

      <footer className="flex flex-col items-center gap-2 pb-6 text-center">
        {settings.show_branding &&
          (isPage ? (
            <Link href="/" className="rounded-sm text-[11px] font-semibold text-muted-foreground hover:text-foreground @3xl:text-xs">
              {t("madeWith")}
            </Link>
          ) : (
            <span className="text-[11px] font-semibold text-muted-foreground">{t("madeWith")}</span>
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
