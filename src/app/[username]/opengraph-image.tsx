import { ImageResponse } from "next/og";
import { accentHexPalette } from "@/lib/profile/colors";
import { bioPhrases } from "@/lib/profile/format";
import { getPublicProfile, usernameFromParam } from "@/lib/profile/get-public-profile";

export const alt = "Perfil en Ópalo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamic OG image: avatar, name and the opal gradient. */
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const username = usernameFromParam((await params).username);
  const data = username ? await getPublicProfile(username) : null;

  const name = data?.profile.display_name?.trim() || data?.profile.username || "ópalo";
  const handle = data ? `opalo.me/${data.profile.username}` : "opalo.me";
  const bio = data ? bioPhrases(data.profile.bio)[0] : "Todo lo que eres, en un solo enlace.";
  const [warm, accent, cool] = accentHexPalette(data?.settings.accent_color ?? "#B9A7FF");
  const avatar = data?.profile.avatar_url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0812",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", left: -260, top: -300, width: 900, height: 900, display: "flex", backgroundImage: `radial-gradient(circle, ${warm}66 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", right: -260, top: 20, width: 920, height: 920, display: "flex", backgroundImage: `radial-gradient(circle, ${accent}55 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", left: 120, bottom: -440, width: 840, height: 840, display: "flex", backgroundImage: `radial-gradient(circle, ${cool}4d 0%, transparent 65%)` }} />

        <div style={{ display: "flex", alignItems: "center", gap: 56, padding: "0 90px" }}>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "6px solid rgba(255,255,255,0.18)",
              boxShadow: `0 0 80px ${accent}`,
              backgroundImage: "linear-gradient(135deg, #f6a8cf 0%, #b9a7ff 36%, #8fe3dc 72%)",
              overflow: "hidden",
              fontSize: 96,
              fontWeight: 800,
              color: "#140f22",
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img
              <img src={avatar} alt="" width={220} height={220} style={{ objectFit: "cover" }} />
            ) : (
              [...name][0]?.toUpperCase()
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
            <div style={{ fontSize: 84, fontWeight: 800, color: "#f5f2fa", letterSpacing: -2, lineHeight: 1 }}>{name}</div>
            {bio && <div style={{ fontSize: 34, color: "#d9d4e4", lineHeight: 1.3 }}>{bio}</div>}
            <div
              style={{
                display: "flex",
                marginTop: 12,
                fontSize: 30,
                fontWeight: 700,
                backgroundImage: "linear-gradient(90deg, #f6a8cf, #b9a7ff 50%, #8fe3dc)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {handle}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
