"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACCENT_SWATCHES } from "@/lib/panel/types";
import type { Enums } from "@/types/database";
import { AvatarUploader } from "./avatar-uploader";
import { AccentPicker, ChoiceChips, type Choice, Counter, LayoutPicker, PanelCard, ToggleRow } from "./editor-ui";
import { LinksManager } from "./links-manager";
import { usePanel } from "./panel-provider";
import { PresenceEditor } from "./presence-editor";

export const PARTICLE_CHOICES: Choice<Enums<"particle_kind">>[] = [
  { value: "stars", label: "Panel.particles.stars" },
  { value: "rain", label: "Panel.particles.rain" },
  { value: "petals", label: "Panel.particles.petals", premium: true },
  { value: "snow", label: "Panel.particles.snow" },
  { value: "none", label: "Panel.particles.none" },
];

/** Figma 7:333 "Información" + avatar and status. */
export function InfoCard() {
  const t = useTranslations("Panel.info");
  const { draft, updateProfile, updateSettings } = usePanel();
  const { profile, settings } = draft;

  return (
    <PanelCard title="Panel.info.title" description="Panel.info.description">
      <AvatarUploader />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="display_name">{t("name")}</Label>
          <Input
            id="display_name"
            value={profile.display_name ?? ""}
            onChange={(e) => updateProfile({ display_name: e.target.value })}
            maxLength={32}
            placeholder={t("namePlaceholder")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">{t("location")}</Label>
          <Input
            id="location"
            value={profile.location ?? ""}
            onChange={(e) => updateProfile({ location: e.target.value })}
            maxLength={40}
            placeholder={t("locationPlaceholder")}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">{t("bio")}</Label>
        <Textarea
          id="bio"
          value={profile.bio ?? ""}
          onChange={(e) => updateProfile({ bio: e.target.value })}
          maxLength={300}
          rows={1}
          className="min-h-12"
          placeholder={t("bioPlaceholder")}
        />
        <Counter value={profile.bio} max={300} />
      </div>
      <PresenceEditor />
      <ToggleRow
        label="Panel.info.showPresence"
        description="Panel.info.showPresenceDescription"
        checked={settings.show_presence}
        onChange={(show_presence) => updateSettings({ show_presence })}
      />
    </PanelCard>
  );
}

const ICON_STYLE_CHOICES: Choice<"mono" | "color">[] = [
  { value: "mono", label: "Panel.links.iconsMono" },
  { value: "color", label: "Panel.links.iconsColor" },
];

export function LinksCard() {
  const { draft, updateSettings } = usePanel();
  return (
    <PanelCard title="Panel.links.title" description="Panel.links.description">
      <ChoiceChips
        label="Panel.links.icons"
        value={draft.settings.icon_style ?? "mono"}
        options={ICON_STYLE_CHOICES}
        onChange={(icon_style) => updateSettings({ icon_style })}
      />
      <LinksManager />
    </PanelCard>
  );
}

/** Figma 7:453 "Apariencia rápida". */
export function QuickAppearanceCard() {
  const { draft, updateSettings } = usePanel();
  const { settings } = draft;
  return (
    <PanelCard title="Panel.quick.title" description="Panel.quick.description">
      <LayoutPicker value={settings.layout} onChange={(layout) => updateSettings({ layout })} />
      <AccentPicker value={settings.accent_color} swatches={ACCENT_SWATCHES} onChange={(accent_color) => updateSettings({ accent_color })} />
      <ChoiceChips
        label="Panel.particles.label"
        value={settings.particles}
        options={PARTICLE_CHOICES}
        onChange={(particles) => updateSettings({ particles })}
        premiumFeature="Panel.premiumFeatures.particles"
      />
    </PanelCard>
  );
}
