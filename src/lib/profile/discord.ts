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

/** What the user is doing; worded by the card (Profile.discord.*). */
export type DiscordActivity =
  | { kind: "spotify"; song: string; artist: string }
  | { kind: "playing" | "streaming" | "listeningTo" | "watching" | "competing"; name: string; extra: string | null }
  | { kind: "custom"; text: string }
  | null;

export type DiscordPresence = {
  name: string;
  avatarUrl: string;
  status: DiscordStatus;
  activity: DiscordActivity;
  /** Activity art (game icon, album cover), when there is one. */
  imageUrl: string | null;
};

export type LanyardResult =
  | { state: "ok"; presence: DiscordPresence }
  | { state: "not-monitored" } // not in Lanyard's server yet
  | { state: "error" };

/** Discord activity types → Profile.discord.* keys. */
const ACTIVITY_KINDS = { 0: "playing", 1: "streaming", 2: "listeningTo", 3: "watching", 5: "competing" } as const;

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
      activity: { kind: "spotify", song: data.spotify.song, artist: data.spotify.artist },
      imageUrl: data.spotify.album_art_url,
    };
  }

  const activity = data.activities.find((a) => a.type !== 4);
  if (activity) {
    const kind = ACTIVITY_KINDS[activity.type as keyof typeof ACTIVITY_KINDS] ?? "playing";
    return {
      ...base,
      activity: { kind, name: activity.name, extra: activity.details || activity.state || null },
      imageUrl: assetUrl(activity),
    };
  }

  const custom = data.activities.find((a) => a.type === 4);
  const customText = [custom?.emoji && !custom.emoji.id ? custom.emoji.name : null, custom?.state].filter(Boolean).join(" ");
  return { ...base, activity: customText ? { kind: "custom", text: customText } : null, imageUrl: null };
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
