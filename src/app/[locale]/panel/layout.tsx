import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PanelProvider } from "@/components/panel/panel-provider";
import { PanelShell } from "@/components/panel/panel-shell";
import type { PanelData } from "@/lib/panel/types";
import type { PublicBadge } from "@/lib/profile/types";
import { profileFontVariables } from "@/lib/profile-fonts";
import { DISCORD_ID_REGEX } from "@/lib/profile/discord";
import { createClient } from "@/lib/supabase/server";

/** The panel is private: never indexed. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Discord OAuth stores the Discord user ID as `provider_id` in the user metadata. */
function discordAccountId(claims: { app_metadata?: { providers?: string[] }; user_metadata?: Record<string, unknown> }) {
  if (!claims.app_metadata?.providers?.includes("discord")) return null;
  const id = claims.user_metadata?.provider_id;
  return typeof id === "string" && DISCORD_ID_REGEX.test(id) ? id : null;
}

/** Loads everything the panel edits once; pages read and update it through PanelProvider. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect("/login?next=/panel");

  const [profile, settings, links, stats, badges] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("profile_settings").select("*").eq("profile_id", userId).single(),
    supabase.from("social_links").select("*").eq("profile_id", userId).order("position").order("created_at"),
    supabase.from("profile_stats").select("views, clicks").eq("profile_id", userId).maybeSingle(),
    supabase.from("profile_badges").select("granted_at, badges(slug, name, icon)").eq("profile_id", userId).order("granted_at"),
  ]);

  if (!profile.data || !settings.data) {
    // The sign-up trigger always creates both rows; missing means something went wrong.
    throw new Error("Profile row missing for the signed-in user");
  }

  const initial: PanelData = {
    profile: profile.data,
    // Default covers databases where migration 0006 (bg_color) hasn't run yet.
    settings: { ...settings.data, bg_color: settings.data.bg_color ?? "#0B0812" },
    links: links.data ?? [],
    stats: { views: stats.data?.views ?? 0, clicks: stats.data?.clicks ?? 0 },
    badges: (badges.data ?? []).flatMap((b) => (b.badges ? [b.badges as PublicBadge] : [])),
    email: (claims.claims.email as string | undefined) ?? null,
    discordAccountId: discordAccountId(claims.claims),
  };

  return (
    <div className={profileFontVariables}>
      {/* Remount when the plan changes (e.g. right after paying) so the panel picks up Premium. */}
      <PanelProvider key={initial.profile.plan} initial={initial}>
        <PanelShell>{children}</PanelShell>
      </PanelProvider>
    </div>
  );
}
