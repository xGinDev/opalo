import { ImageResponse } from "next/og";
import { bioPhrases } from "@/lib/profile/format";
import { getPublicProfile, usernameFromParam } from "@/lib/profile/get-public-profile";

export const alt = "Perfil en Ópalo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamic OG image: avatar and name over the profile background color. */
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const username = usernameFromParam((await params).username);
  const data = username ? await getPublicProfile(username) : null;

  const name = data?.profile.display_name?.trim() || data?.profile.username || "ópalo";
  const handle = data ? `opalo.me/${data.profile.username}` : "opalo.me";
  const bio = data ? bioPhrases(data.profile.bio)[0] : "Todo lo que eres, en un solo enlace.";
  const accent = data?.settings.accent_color ?? "#B9A7FF";
  // Same solid color as the profile; image/video backgrounds fall back to the Ópalo base.
  const background = data?.settings.bg_kind === "color" ? (data.settings.bg_color ?? "#0b0812") : "#0b0812"; // ?? until migration 0006 runs
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
          background,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >

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
