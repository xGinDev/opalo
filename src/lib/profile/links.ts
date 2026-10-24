import type { ComponentType } from "react";
import { Globe, Link as LinkIcon, Mail } from "lucide-react";
import { FaLinkedin, FaXbox } from "react-icons/fa6";
import {
  SiAnilist,
  SiApplemusic,
  SiArtstation,
  SiBandcamp,
  SiBattledotnet,
  SiBehance,
  SiBinance,
  SiBitcoin,
  SiBluesky,
  SiBuymeacoffee,
  SiCashapp,
  SiDeezer,
  SiDeviantart,
  SiDiscord,
  SiDribbble,
  SiEpicgames,
  SiEthereum,
  SiFacebook,
  SiGithub,
  SiGitlab,
  SiInstagram,
  SiKakaotalk,
  SiKick,
  SiKofi,
  SiLastdotfm,
  SiLetterboxd,
  SiLine,
  SiMastodon,
  SiMedium,
  SiMercadopago,
  SiMyanimelist,
  SiNamemc,
  SiOnlyfans,
  SiOsu,
  SiPatreon,
  SiPaypal,
  SiPinterest,
  SiPixiv,
  SiPlaystation,
  SiReddit,
  SiRevolut,
  SiRiotgames,
  SiRoblox,
  SiSignal,
  SiSnapchat,
  SiSoundcloud,
  SiSpotify,
  SiSteam,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTidal,
  SiTiktok,
  SiTumblr,
  SiTwitch,
  SiVenmo,
  SiVimeo,
  SiVk,
  SiWechat,
  SiWhatsapp,
  SiX,
  SiYoutube,
  SiYoutubemusic,
} from "react-icons/si";
import { TbRating18Plus } from "react-icons/tb";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** Group ids (labels in Platforms.groups), in picker order. */
export const PLATFORM_GROUPS = ["social", "messaging", "video", "music", "gaming", "creators", "support", "adult", "other"] as const;

type PlatformMeta = {
  /** Brand name, or a message key (Platforms.labels.*) for generic entries. */
  label: string;
  icon: IconComponent;
  group: (typeof PLATFORM_GROUPS)[number];
  /** Message key (Platforms.ph.*) or a literal example ("tusitio.com"). */
  placeholder: string;
  /** Builds the URL from a handle; full URLs are always used as-is. */
  url?: (handle: string) => string;
  /** Handles are copied instead of opened (IDs with no public profile URL: Discord, PSN, Riot ID…). */
  copy?: boolean;
};

const at = (h: string) => h.replace(/^@/, "");

/**
 * Must match the `social_links_platform_check` constraint (0005_mas_redes.sql).
 * Order inside each group is the order shown in the picker.
 */
export const PLATFORMS = {
  // social
  instagram: { label: "Instagram", icon: SiInstagram, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://instagram.com/${at(h)}` },
  tiktok: { label: "TikTok", icon: SiTiktok, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://tiktok.com/@${at(h)}` },
  x: { label: "X", icon: SiX, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://x.com/${at(h)}` },
  facebook: { label: "Facebook", icon: SiFacebook, group: "social", placeholder: "Platforms.ph.usernameOrLink", url: (h) => `https://facebook.com/${at(h)}` },
  threads: { label: "Threads", icon: SiThreads, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://threads.net/@${at(h)}` },
  bluesky: { label: "Bluesky", icon: SiBluesky, group: "social", placeholder: "tu.handle.bsky.social", url: (h) => `https://bsky.app/profile/${at(h)}` },
  snapchat: { label: "Snapchat", icon: SiSnapchat, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://snapchat.com/add/${at(h)}` },
  pinterest: { label: "Pinterest", icon: SiPinterest, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://pinterest.com/${at(h)}` },
  reddit: { label: "Reddit", icon: SiReddit, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://reddit.com/user/${at(h).replace(/^u\//, "")}` },
  tumblr: { label: "Tumblr", icon: SiTumblr, group: "social", placeholder: "Platforms.ph.blog", url: (h) => `https://${at(h)}.tumblr.com` },
  linkedin: { label: "LinkedIn", icon: FaLinkedin, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://linkedin.com/in/${at(h)}` },
  mastodon: {
    label: "Mastodon",
    icon: SiMastodon,
    group: "social",
    placeholder: "Platforms.ph.mastodon",
    url: (h) => {
      const m = /^@?([^@\s]+)@([^@\s]+)$/.exec(h);
      return m ? `https://${m[2]}/@${m[1]}` : `https://${h}`;
    },
  },
  vk: { label: "VK", icon: SiVk, group: "social", placeholder: "Platforms.ph.username", url: (h) => `https://vk.com/${at(h)}` },

  // Mensajería
  discord: { label: "Discord", icon: SiDiscord, group: "messaging", placeholder: "Platforms.ph.discord", copy: true },
  telegram: { label: "Telegram", icon: SiTelegram, group: "messaging", placeholder: "Platforms.ph.username", url: (h) => `https://t.me/${at(h)}` },
  whatsapp: { label: "WhatsApp", icon: SiWhatsapp, group: "messaging", placeholder: "Platforms.ph.phone", url: (h) => `https://wa.me/${h.replace(/\D/g, "")}` },
  signal: { label: "Signal", icon: SiSignal, group: "messaging", placeholder: "Platforms.ph.signal", copy: true },
  line: { label: "LINE", icon: SiLine, group: "messaging", placeholder: "Platforms.ph.line", url: (h) => `https://line.me/ti/p/~${at(h)}` },
  kakaotalk: { label: "KakaoTalk", icon: SiKakaotalk, group: "messaging", placeholder: "Platforms.ph.id", copy: true },
  wechat: { label: "WeChat", icon: SiWechat, group: "messaging", placeholder: "Platforms.ph.wechat", copy: true },

  // Video y streaming
  youtube: { label: "YouTube", icon: SiYoutube, group: "video", placeholder: "Platforms.ph.youtube", url: (h) => `https://youtube.com/@${at(h)}` },
  twitch: { label: "Twitch", icon: SiTwitch, group: "video", placeholder: "Platforms.ph.channel", url: (h) => `https://twitch.tv/${at(h)}` },
  kick: { label: "Kick", icon: SiKick, group: "video", placeholder: "Platforms.ph.channel", url: (h) => `https://kick.com/${at(h)}` },
  vimeo: { label: "Vimeo", icon: SiVimeo, group: "video", placeholder: "Platforms.ph.username", url: (h) => `https://vimeo.com/${at(h)}` },

  // Música
  spotify: { label: "Spotify", icon: SiSpotify, group: "music", placeholder: "open.spotify.com/…", url: (h) => `https://open.spotify.com/user/${at(h)}` },
  soundcloud: { label: "SoundCloud", icon: SiSoundcloud, group: "music", placeholder: "Platforms.ph.username", url: (h) => `https://soundcloud.com/${at(h)}` },
  applemusic: { label: "Apple Music", icon: SiApplemusic, group: "music", placeholder: "music.apple.com/…" },
  youtubemusic: { label: "YouTube Music", icon: SiYoutubemusic, group: "music", placeholder: "music.youtube.com/…" },
  deezer: { label: "Deezer", icon: SiDeezer, group: "music", placeholder: "deezer.com/…" },
  tidal: { label: "TIDAL", icon: SiTidal, group: "music", placeholder: "tidal.com/…" },
  bandcamp: { label: "Bandcamp", icon: SiBandcamp, group: "music", placeholder: "Platforms.ph.username", url: (h) => `https://${at(h)}.bandcamp.com` },
  lastfm: { label: "Last.fm", icon: SiLastdotfm, group: "music", placeholder: "Platforms.ph.username", url: (h) => `https://last.fm/user/${at(h)}` },

  // Gaming
  steam: { label: "Steam", icon: SiSteam, group: "gaming", placeholder: "Platforms.ph.idOrLink", url: (h) => `https://steamcommunity.com/id/${at(h)}` },
  roblox: { label: "Roblox", icon: SiRoblox, group: "gaming", placeholder: "Platforms.ph.profileLink", url: (h) => (/^\d+$/.test(h) ? `https://www.roblox.com/users/${h}/profile` : `https://www.roblox.com/search/users?keyword=${encodeURIComponent(at(h))}`) },
  playstation: { label: "PlayStation", icon: SiPlaystation, group: "gaming", placeholder: "Platforms.ph.psn", copy: true },
  xbox: { label: "Xbox", icon: FaXbox, group: "gaming", placeholder: "Platforms.ph.gamertag", copy: true },
  epicgames: { label: "Epic Games", icon: SiEpicgames, group: "gaming", placeholder: "Platforms.ph.epic", copy: true },
  battlenet: { label: "Battle.net", icon: SiBattledotnet, group: "gaming", placeholder: "Platforms.ph.battlenet", copy: true },
  riotgames: { label: "Riot Games", icon: SiRiotgames, group: "gaming", placeholder: "Platforms.ph.riot", copy: true },
  osu: { label: "osu!", icon: SiOsu, group: "gaming", placeholder: "Platforms.ph.username", url: (h) => `https://osu.ppy.sh/users/${at(h)}` },
  namemc: { label: "Minecraft (NameMC)", icon: SiNamemc, group: "gaming", placeholder: "Platforms.ph.username", url: (h) => `https://namemc.com/profile/${at(h)}` },

  // Creadores
  github: { label: "GitHub", icon: SiGithub, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://github.com/${at(h)}` },
  gitlab: { label: "GitLab", icon: SiGitlab, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://gitlab.com/${at(h)}` },
  behance: { label: "Behance", icon: SiBehance, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://behance.net/${at(h)}` },
  dribbble: { label: "Dribbble", icon: SiDribbble, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://dribbble.com/${at(h)}` },
  artstation: { label: "ArtStation", icon: SiArtstation, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://artstation.com/${at(h)}` },
  deviantart: { label: "DeviantArt", icon: SiDeviantart, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://deviantart.com/${at(h)}` },
  pixiv: { label: "pixiv", icon: SiPixiv, group: "creators", placeholder: "pixiv.net/users/…" },
  medium: { label: "Medium", icon: SiMedium, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://medium.com/@${at(h)}` },
  substack: { label: "Substack", icon: SiSubstack, group: "creators", placeholder: "Platforms.ph.publication", url: (h) => `https://${at(h)}.substack.com` },
  letterboxd: { label: "Letterboxd", icon: SiLetterboxd, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://letterboxd.com/${at(h)}` },
  myanimelist: { label: "MyAnimeList", icon: SiMyanimelist, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://myanimelist.net/profile/${at(h)}` },
  anilist: { label: "AniList", icon: SiAnilist, group: "creators", placeholder: "Platforms.ph.username", url: (h) => `https://anilist.co/user/${at(h)}` },

  // Apoyo y pagos
  paypal: { label: "PayPal", icon: SiPaypal, group: "support", placeholder: "Platforms.ph.paypal", url: (h) => `https://paypal.me/${at(h)}` },
  patreon: { label: "Patreon", icon: SiPatreon, group: "support", placeholder: "Platforms.ph.username", url: (h) => `https://patreon.com/${at(h)}` },
  kofi: { label: "Ko-fi", icon: SiKofi, group: "support", placeholder: "Platforms.ph.username", url: (h) => `https://ko-fi.com/${at(h)}` },
  buymeacoffee: { label: "Buy Me a Coffee", icon: SiBuymeacoffee, group: "support", placeholder: "Platforms.ph.username", url: (h) => `https://buymeacoffee.com/${at(h)}` },
  cashapp: { label: "Cash App", icon: SiCashapp, group: "support", placeholder: "$tucashtag", url: (h) => `https://cash.app/$${h.replace(/^[@$]/, "")}` },
  venmo: { label: "Venmo", icon: SiVenmo, group: "support", placeholder: "Platforms.ph.username", url: (h) => `https://venmo.com/u/${at(h)}` },
  revolut: { label: "Revolut", icon: SiRevolut, group: "support", placeholder: "Platforms.ph.username", url: (h) => `https://revolut.me/${at(h)}` },
  mercadopago: { label: "Mercado Pago", icon: SiMercadopago, group: "support", placeholder: "Platforms.ph.paymentLink" },
  binance: { label: "Binance Pay", icon: SiBinance, group: "support", placeholder: "Platforms.ph.payId", copy: true },
  bitcoin: { label: "Bitcoin", icon: SiBitcoin, group: "support", placeholder: "Platforms.ph.btc", copy: true },
  ethereum: { label: "Ethereum", icon: SiEthereum, group: "support", placeholder: "Platforms.ph.eth", copy: true },

  // Contenido para adultos (+18)
  onlyfans: { label: "OnlyFans", icon: SiOnlyfans, group: "adult", placeholder: "Platforms.ph.username", url: (h) => `https://onlyfans.com/${at(h)}` },
  fansly: { label: "Fansly", icon: TbRating18Plus, group: "adult", placeholder: "Platforms.ph.username", url: (h) => `https://fansly.com/${at(h)}` },
  fanvue: { label: "Fanvue", icon: TbRating18Plus, group: "adult", placeholder: "Platforms.ph.username", url: (h) => `https://fanvue.com/${at(h)}` },
  manyvids: { label: "ManyVids", icon: TbRating18Plus, group: "adult", placeholder: "Platforms.ph.profileLink" },
  chaturbate: { label: "Chaturbate", icon: TbRating18Plus, group: "adult", placeholder: "Platforms.ph.username", url: (h) => `https://chaturbate.com/${at(h)}` },
  justforfans: { label: "JustFor.Fans", icon: TbRating18Plus, group: "adult", placeholder: "Platforms.ph.username", url: (h) => `https://justfor.fans/${at(h)}` },

  // Contacto y otros
  email: { label: "Platforms.labels.email", icon: Mail, group: "other", placeholder: "Platforms.ph.email" },
  web: { label: "Platforms.labels.web", icon: Globe, group: "other", placeholder: "tusitio.com" },
  otro: { label: "Platforms.labels.other", icon: LinkIcon, group: "other", placeholder: "https://…" },
} satisfies Record<string, PlatformMeta>;

export type Platform = keyof typeof PLATFORMS;

/**
 * Brand colors for the "a color" icon style (simple-icons hex, nudged lighter where the official
 * color disappears on a dark background). Brands that are black (X, TikTok, GitHub…) stay white.
 */
const BRAND_COLORS: Partial<Record<Platform, string>> = {
  instagram: "#FF0069", facebook: "#0866FF", bluesky: "#0285FF", snapchat: "#FFFC00", pinterest: "#E60023",
  reddit: "#FF4500", tumblr: "#7C9CBF", linkedin: "#0A66C2", mastodon: "#6364FF", vk: "#0077FF",
  discord: "#5865F2", telegram: "#26A5E4", whatsapp: "#25D366", signal: "#3A76F0", line: "#00C300",
  kakaotalk: "#FFCD00", wechat: "#07C160",
  youtube: "#FF0000", twitch: "#9146FF", kick: "#53FC18", vimeo: "#1AB7EA",
  spotify: "#1ED760", soundcloud: "#FF5500", applemusic: "#FA243C", youtubemusic: "#FF0000", deezer: "#A238FF",
  bandcamp: "#629AA9", lastfm: "#D51007",
  steam: "#66C0F4", playstation: "#0070D1", xbox: "#107C10", battlenet: "#148EFF", riotgames: "#EB0029",
  osu: "#FF66AA", namemc: "#9DD86B",
  gitlab: "#FC6D26", behance: "#1769FF", dribbble: "#EA4C89", artstation: "#13AFF0", deviantart: "#05CC47",
  pixiv: "#0096FA", substack: "#FF6719", letterboxd: "#FF8000", myanimelist: "#4F74C8", anilist: "#02A9FF",
  paypal: "#009CDE", patreon: "#FF424D", kofi: "#FF5E5B", buymeacoffee: "#FFDD00", cashapp: "#00D632",
  venmo: "#008CFF", mercadopago: "#00B1EA", binance: "#F0B90B", bitcoin: "#F7931A", ethereum: "#8A92B2",
  onlyfans: "#00AFF0", fansly: "#1FA7F8", fanvue: "#4FD26E", manyvids: "#E8467C", chaturbate: "#F47321", justforfans: "#E8467C",
  email: "#EA4335",
};

export function brandColor(platform: string) {
  return BRAND_COLORS[platform as Platform] ?? "#FFFFFF";
}

export function platformMeta(platform: string): PlatformMeta {
  return (PLATFORMS as Record<string, PlatformMeta>)[platform] ?? PLATFORMS.otro;
}

export type LinkAction =
  | { kind: "open"; href: string }
  | { kind: "mailto"; href: string }
  | { kind: "copy"; text: string }
  | { kind: "none" };

/** Only http(s) URLs are ever opened, so user input can't inject `javascript:` links. */
function safeHttpUrl(value: string) {
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const looksLikeUrl = (value: string) => /^https?:\/\//i.test(value) || /^[\w-]+(\.[\w-]+)+\/\S*/.test(value);

/** What clicking a social icon does: open a URL, mailto, or copy an ID (Discord, PSN, Riot ID, wallets…). */
export function linkAction(platform: string, rawValue: string): LinkAction {
  const value = rawValue.trim();
  if (!value) return { kind: "none" };

  if (platform === "email") {
    const email = value.replace(/^mailto:/i, "");
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { kind: "mailto", href: `mailto:${email}` } : { kind: "none" };
  }

  const meta = platformMeta(platform);

  // IDs without a public URL are copied, unless the user pasted a link (e.g. a Discord invite).
  if (meta.copy) {
    if (looksLikeUrl(value) || /^(www\.)?discord\.(gg|com)\//i.test(value)) {
      const href = safeHttpUrl(value);
      return href ? { kind: "open", href } : { kind: "none" };
    }
    return { kind: "copy", text: platform === "discord" ? value.replace(/^@/, "") : value };
  }

  // With a URL template, anything that isn't clearly a link is a handle (dots allowed: Bluesky).
  if (!looksLikeUrl(value) && meta.url) {
    // Templates get the raw handle; the URL constructor in safeHttpUrl encodes it and re-checks the protocol.
    const href = safeHttpUrl(meta.url(value));
    return href ? { kind: "open", href } : { kind: "none" };
  }
  const href = safeHttpUrl(value);
  return href ? { kind: "open", href } : { kind: "none" };
}
