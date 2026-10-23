import { redirect } from "next/navigation";
import { PanelProvider } from "@/components/panel/panel-provider";
import { PanelShell } from "@/components/panel/panel-shell";
import type { PanelData } from "@/lib/panel/types";
import type { PublicBadge } from "@/lib/profile/types";
import { profileFontVariables } from "@/lib/profile-fonts";
import { createClient } from "@/lib/supabase/server";

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
    throw new Error("No encontramos tu perfil.");
  }

  const initial: PanelData = {
    profile: profile.data,
    // Default covers databases where migration 0006 (bg_color) hasn't run yet.
    settings: { ...settings.data, bg_color: settings.data.bg_color ?? "#0B0812" },
    links: links.data ?? [],
    stats: { views: stats.data?.views ?? 0, clicks: stats.data?.clicks ?? 0 },
    badges: (badges.data ?? []).flatMap((b) => (b.badges ? [b.badges as PublicBadge] : [])),
    email: (claims.claims.email as string | undefined) ?? null,
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
