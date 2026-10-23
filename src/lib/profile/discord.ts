// Live Discord presence through Lanyard (https://github.com/Phineas/lanyard).
// The user joins Lanyard's Discord server once; after that their presence is public at
// GET https://api.lanyard.rest/v1/users/:id (CORS enabled, no key).

export const LANYARD_INVITE = "https://discord.gg/lanyard";
export const DISCORD_ID_REGEX = /^[0-9]{17,20}$/;

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

type LanyardActivity = {
  type: number; // 0 playing, 1 streaming, 2 listening, 3 watching, 4 custom status, 5 competing
  name: string;
  state?: string;
  details?: string;
  application_id?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
  assets?: { large_image?: string };
};

type LanyardData = {
  discord_user: { id: string; username: string; global_name: string | null; avatar: string | null };
  discord_status: DiscordStatus;
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: { song: string; artist: string; album_art_url: string | null } | null;
};

export type DiscordPresence = {
  name: string;
  avatarUrl: string;
  status: DiscordStatus;
  /** "Jugando Valorant", "Escuchando Blinding Lights · The Weeknd", custom status… */
  text: string;
  /** Activity art (game icon, album cover), when there is one. */
  imageUrl: string | null;
};

export type LanyardResult =
  | { state: "ok"; presence: DiscordPresence }
  | { state: "not-monitored" } // not in Lanyard's server yet
  | { state: "error" };

export const STATUS_LABELS: Record<DiscordStatus, string> = {
  online: "En línea",
  idle: "Ausente",
  dnd: "No molestar",
  offline: "Desconectado",
};

function avatarUrl(user: LanyardData["discord_user"]) {
  if (!user.avatar) {
    // Default avatars: (id >> 22) % 6 for the new username system.
    const index = Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  const ext = user.avatar.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

function assetUrl(activity: LanyardActivity) {
  const image = activity.assets?.large_image;
  if (!image) return null;
  if (image.startsWith("mp:")) return `https://media.discordapp.net/${image.slice(3)}`;
  if (image.startsWith("spotify:")) return `https://i.scdn.co/image/${image.slice(8)}`;
  if (activity.application_id) return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
  return null;
}

function toPresence(data: LanyardData): DiscordPresence {
  const user = data.discord_user;
  const base = { name: user.global_name || user.username, avatarUrl: avatarUrl(user), status: data.discord_status };

  if (data.listening_to_spotify && data.spotify) {
    return {
      ...base,
      text: `Escuchando ${data.spotify.song} · ${data.spotify.artist}`,
      imageUrl: data.spotify.album_art_url,
    };
  }

  const activity = data.activities.find((a) => a.type !== 4);
  if (activity) {
    const verb = { 0: "Jugando", 1: "En directo:", 2: "Escuchando", 3: "Viendo", 5: "Compitiendo en" }[activity.type] ?? "";
    const extra = activity.details || activity.state;
    return {
      ...base,
      text: [`${verb} ${activity.name}`.trim(), extra].filter(Boolean).join(" · "),
      imageUrl: assetUrl(activity),
    };
  }

  const custom = data.activities.find((a) => a.type === 4);
  const customText = [custom?.emoji && !custom.emoji.id ? custom.emoji.name : null, custom?.state].filter(Boolean).join(" ");
  return { ...base, text: customText || STATUS_LABELS[data.discord_status], imageUrl: null };
}

export async function fetchDiscordPresence(discordId: string, signal?: AbortSignal): Promise<LanyardResult> {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`, { signal, cache: "no-store" });
    const json = (await res.json()) as { success: boolean; data?: LanyardData; error?: { code: string } };
    if (json.success && json.data) return { state: "ok", presence: toPresence(json.data) };
    if (json.error?.code === "user_not_monitored") return { state: "not-monitored" };
    return { state: "error" };
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    return { state: "error" };
  }
}
