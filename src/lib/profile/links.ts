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

export const PLATFORM_GROUPS = [
  "Redes",
  "Mensajería",
  "Video y streaming",
  "Música",
  "Gaming",
  "Creadores",
  "Apoyo y pagos",
  "Contenido para adultos (+18)",
  "Contacto y otros",
] as const;

type PlatformMeta = {
  label: string;
  icon: IconComponent;
  group: (typeof PLATFORM_GROUPS)[number];
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
  // Redes
  instagram: { label: "Instagram", icon: SiInstagram, group: "Redes", placeholder: "tu usuario", url: (h) => `https://instagram.com/${at(h)}` },
  tiktok: { label: "TikTok", icon: SiTiktok, group: "Redes", placeholder: "tu usuario", url: (h) => `https://tiktok.com/@${at(h)}` },
  x: { label: "X", icon: SiX, group: "Redes", placeholder: "tu usuario", url: (h) => `https://x.com/${at(h)}` },
  facebook: { label: "Facebook", icon: SiFacebook, group: "Redes", placeholder: "tu usuario o enlace", url: (h) => `https://facebook.com/${at(h)}` },
  threads: { label: "Threads", icon: SiThreads, group: "Redes", placeholder: "tu usuario", url: (h) => `https://threads.net/@${at(h)}` },
  bluesky: { label: "Bluesky", icon: SiBluesky, group: "Redes", placeholder: "tu.handle.bsky.social", url: (h) => `https://bsky.app/profile/${at(h)}` },
  snapchat: { label: "Snapchat", icon: SiSnapchat, group: "Redes", placeholder: "tu usuario", url: (h) => `https://snapchat.com/add/${at(h)}` },
  pinterest: { label: "Pinterest", icon: SiPinterest, group: "Redes", placeholder: "tu usuario", url: (h) => `https://pinterest.com/${at(h)}` },
  reddit: { label: "Reddit", icon: SiReddit, group: "Redes", placeholder: "tu usuario", url: (h) => `https://reddit.com/user/${at(h).replace(/^u\//, "")}` },
  tumblr: { label: "Tumblr", icon: SiTumblr, group: "Redes", placeholder: "tu blog", url: (h) => `https://${at(h)}.tumblr.com` },
  linkedin: { label: "LinkedIn", icon: FaLinkedin, group: "Redes", placeholder: "tu usuario", url: (h) => `https://linkedin.com/in/${at(h)}` },
  mastodon: {
    label: "Mastodon",
    icon: SiMastodon,
    group: "Redes",
    placeholder: "@usuario@instancia.social",
    url: (h) => {
      const m = /^@?([^@\s]+)@([^@\s]+)$/.exec(h);
      return m ? `https://${m[2]}/@${m[1]}` : `https://${h}`;
    },
  },
  vk: { label: "VK", icon: SiVk, group: "Redes", placeholder: "tu usuario", url: (h) => `https://vk.com/${at(h)}` },

  // Mensajería
  discord: { label: "Discord", icon: SiDiscord, group: "Mensajería", placeholder: "tu usuario o discord.gg/invitacion", copy: true },
  telegram: { label: "Telegram", icon: SiTelegram, group: "Mensajería", placeholder: "tu usuario", url: (h) => `https://t.me/${at(h)}` },
  whatsapp: { label: "WhatsApp", icon: SiWhatsapp, group: "Mensajería", placeholder: "número con indicativo, ej. 573001234567", url: (h) => `https://wa.me/${h.replace(/\D/g, "")}` },
  signal: { label: "Signal", icon: SiSignal, group: "Mensajería", placeholder: "tu usuario de Signal", copy: true },
  line: { label: "LINE", icon: SiLine, group: "Mensajería", placeholder: "tu ID de LINE", url: (h) => `https://line.me/ti/p/~${at(h)}` },
  kakaotalk: { label: "KakaoTalk", icon: SiKakaotalk, group: "Mensajería", placeholder: "tu ID", copy: true },
  wechat: { label: "WeChat", icon: SiWechat, group: "Mensajería", placeholder: "tu ID de WeChat", copy: true },

  // Video y streaming
  youtube: { label: "YouTube", icon: SiYoutube, group: "Video y streaming", placeholder: "@tucanal", url: (h) => `https://youtube.com/@${at(h)}` },
  twitch: { label: "Twitch", icon: SiTwitch, group: "Video y streaming", placeholder: "tu canal", url: (h) => `https://twitch.tv/${at(h)}` },
  kick: { label: "Kick", icon: SiKick, group: "Video y streaming", placeholder: "tu canal", url: (h) => `https://kick.com/${at(h)}` },
  vimeo: { label: "Vimeo", icon: SiVimeo, group: "Video y streaming", placeholder: "tu usuario", url: (h) => `https://vimeo.com/${at(h)}` },

  // Música
  spotify: { label: "Spotify", icon: SiSpotify, group: "Música", placeholder: "open.spotify.com/…", url: (h) => `https://open.spotify.com/user/${at(h)}` },
  soundcloud: { label: "SoundCloud", icon: SiSoundcloud, group: "Música", placeholder: "tu usuario", url: (h) => `https://soundcloud.com/${at(h)}` },
  applemusic: { label: "Apple Music", icon: SiApplemusic, group: "Música", placeholder: "music.apple.com/…" },
  youtubemusic: { label: "YouTube Music", icon: SiYoutubemusic, group: "Música", placeholder: "music.youtube.com/…" },
  deezer: { label: "Deezer", icon: SiDeezer, group: "Música", placeholder: "deezer.com/…" },
  tidal: { label: "TIDAL", icon: SiTidal, group: "Música", placeholder: "tidal.com/…" },
  bandcamp: { label: "Bandcamp", icon: SiBandcamp, group: "Música", placeholder: "tu usuario", url: (h) => `https://${at(h)}.bandcamp.com` },
  lastfm: { label: "Last.fm", icon: SiLastdotfm, group: "Música", placeholder: "tu usuario", url: (h) => `https://last.fm/user/${at(h)}` },

  // Gaming
  steam: { label: "Steam", icon: SiSteam, group: "Gaming", placeholder: "tu id o enlace", url: (h) => `https://steamcommunity.com/id/${at(h)}` },
  roblox: { label: "Roblox", icon: SiRoblox, group: "Gaming", placeholder: "enlace a tu perfil", url: (h) => (/^\d+$/.test(h) ? `https://www.roblox.com/users/${h}/profile` : `https://www.roblox.com/search/users?keyword=${encodeURIComponent(at(h))}`) },
  playstation: { label: "PlayStation", icon: SiPlaystation, group: "Gaming", placeholder: "tu ID de PSN", copy: true },
  xbox: { label: "Xbox", icon: FaXbox, group: "Gaming", placeholder: "tu gamertag", copy: true },
  epicgames: { label: "Epic Games", icon: SiEpicgames, group: "Gaming", placeholder: "tu nombre de Epic", copy: true },
  battlenet: { label: "Battle.net", icon: SiBattledotnet, group: "Gaming", placeholder: "Nombre#1234", copy: true },
  riotgames: { label: "Riot Games", icon: SiRiotgames, group: "Gaming", placeholder: "Nombre#TAG", copy: true },
  osu: { label: "osu!", icon: SiOsu, group: "Gaming", placeholder: "tu usuario", url: (h) => `https://osu.ppy.sh/users/${at(h)}` },
  namemc: { label: "Minecraft (NameMC)", icon: SiNamemc, group: "Gaming", placeholder: "tu usuario", url: (h) => `https://namemc.com/profile/${at(h)}` },

  // Creadores
  github: { label: "GitHub", icon: SiGithub, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://github.com/${at(h)}` },
  gitlab: { label: "GitLab", icon: SiGitlab, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://gitlab.com/${at(h)}` },
  behance: { label: "Behance", icon: SiBehance, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://behance.net/${at(h)}` },
  dribbble: { label: "Dribbble", icon: SiDribbble, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://dribbble.com/${at(h)}` },
  artstation: { label: "ArtStation", icon: SiArtstation, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://artstation.com/${at(h)}` },
  deviantart: { label: "DeviantArt", icon: SiDeviantart, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://deviantart.com/${at(h)}` },
  pixiv: { label: "pixiv", icon: SiPixiv, group: "Creadores", placeholder: "pixiv.net/users/…" },
  medium: { label: "Medium", icon: SiMedium, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://medium.com/@${at(h)}` },
  substack: { label: "Substack", icon: SiSubstack, group: "Creadores", placeholder: "tu publicación", url: (h) => `https://${at(h)}.substack.com` },
  letterboxd: { label: "Letterboxd", icon: SiLetterboxd, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://letterboxd.com/${at(h)}` },
  myanimelist: { label: "MyAnimeList", icon: SiMyanimelist, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://myanimelist.net/profile/${at(h)}` },
  anilist: { label: "AniList", icon: SiAnilist, group: "Creadores", placeholder: "tu usuario", url: (h) => `https://anilist.co/user/${at(h)}` },

  // Apoyo y pagos
  paypal: { label: "PayPal", icon: SiPaypal, group: "Apoyo y pagos", placeholder: "tu usuario de paypal.me", url: (h) => `https://paypal.me/${at(h)}` },
  patreon: { label: "Patreon", icon: SiPatreon, group: "Apoyo y pagos", placeholder: "tu usuario", url: (h) => `https://patreon.com/${at(h)}` },
  kofi: { label: "Ko-fi", icon: SiKofi, group: "Apoyo y pagos", placeholder: "tu usuario", url: (h) => `https://ko-fi.com/${at(h)}` },
  buymeacoffee: { label: "Buy Me a Coffee", icon: SiBuymeacoffee, group: "Apoyo y pagos", placeholder: "tu usuario", url: (h) => `https://buymeacoffee.com/${at(h)}` },
  cashapp: { label: "Cash App", icon: SiCashapp, group: "Apoyo y pagos", placeholder: "$tucashtag", url: (h) => `https://cash.app/$${h.replace(/^[@$]/, "")}` },
  venmo: { label: "Venmo", icon: SiVenmo, group: "Apoyo y pagos", placeholder: "tu usuario", url: (h) => `https://venmo.com/u/${at(h)}` },
  revolut: { label: "Revolut", icon: SiRevolut, group: "Apoyo y pagos", placeholder: "tu usuario", url: (h) => `https://revolut.me/${at(h)}` },
  mercadopago: { label: "Mercado Pago", icon: SiMercadopago, group: "Apoyo y pagos", placeholder: "enlace de pago" },
  binance: { label: "Binance Pay", icon: SiBinance, group: "Apoyo y pagos", placeholder: "tu Pay ID", copy: true },
  bitcoin: { label: "Bitcoin", icon: SiBitcoin, group: "Apoyo y pagos", placeholder: "tu dirección BTC", copy: true },
  ethereum: { label: "Ethereum", icon: SiEthereum, group: "Apoyo y pagos", placeholder: "tu dirección ETH o ENS", copy: true },

  // Contenido para adultos (+18)
  onlyfans: { label: "OnlyFans", icon: SiOnlyfans, group: "Contenido para adultos (+18)", placeholder: "tu usuario", url: (h) => `https://onlyfans.com/${at(h)}` },
  fansly: { label: "Fansly", icon: TbRating18Plus, group: "Contenido para adultos (+18)", placeholder: "tu usuario", url: (h) => `https://fansly.com/${at(h)}` },
  fanvue: { label: "Fanvue", icon: TbRating18Plus, group: "Contenido para adultos (+18)", placeholder: "tu usuario", url: (h) => `https://fanvue.com/${at(h)}` },
  manyvids: { label: "ManyVids", icon: TbRating18Plus, group: "Contenido para adultos (+18)", placeholder: "enlace a tu perfil" },
  chaturbate: { label: "Chaturbate", icon: TbRating18Plus, group: "Contenido para adultos (+18)", placeholder: "tu usuario", url: (h) => `https://chaturbate.com/${at(h)}` },
  justforfans: { label: "JustFor.Fans", icon: TbRating18Plus, group: "Contenido para adultos (+18)", placeholder: "tu usuario", url: (h) => `https://justfor.fans/${at(h)}` },

  // Contacto y otros
  email: { label: "Correo", icon: Mail, group: "Contacto y otros", placeholder: "tu@correo.com" },
  web: { label: "Sitio web", icon: Globe, group: "Contacto y otros", placeholder: "tusitio.com" },
  otro: { label: "Enlace", icon: LinkIcon, group: "Contacto y otros", placeholder: "https://…" },
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
