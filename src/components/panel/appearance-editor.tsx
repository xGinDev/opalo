"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ACCENT_SWATCHES, BACKGROUND_SWATCHES } from "@/lib/panel/types";
import { nameFontFamily } from "@/lib/profile-fonts";
import { cardStyleMeta } from "@/lib/profile/card-styles";
import type { Enums } from "@/types/database";
import { AccentPicker, ChoiceChips, type Choice, LayoutPicker, PanelCard, PremiumBadge, ToggleRow } from "./editor-ui";
import { ArrangementPicker } from "./arrangement-picker";
import { CardStylePicker } from "./card-style-picker";
import { FileUploadButton } from "./file-upload-button";
import { NameEffectPicker } from "./name-effect-picker";
import { TabAndEntryCard } from "./tab-entry-card";
import { usePanel } from "./panel-provider";
import { PARTICLE_CHOICES } from "./profile-sections";

const FONT_CHOICES: Choice<string>[] = [
  { value: "Unbounded", label: "Unbounded" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Silkscreen", label: "Silkscreen", premium: true },
  { value: "Fredoka", label: "Fredoka", premium: true },
];

const BACKGROUND_CHOICES: Choice<Enums<"bg_kind">>[] = [
  { value: "color", label: "Panel.appearance.bgColor" },
  { value: "image", label: "Panel.appearance.bgImage", premium: true },
  { value: "video", label: "Panel.appearance.bgVideo", premium: true },
];

function SliderRow({ id, label, value, display, ...props }: { id: string; label: string; value: number; display: string } & Omit<React.ComponentProps<typeof Slider>, "value">) {
  return (
    <div className="grid gap-3 rounded-md bg-surface-2 px-4 py-3.5">
      <div className="flex items-center justify-between">
        <Label id={id} className="text-sm font-bold text-foreground">
          {label}
        </Label>
        <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">{display}</span>
      </div>
      <Slider value={[value]} aria-labelledby={id} {...props} />
    </div>
  );
}

/** Full appearance editor (not in the Figma; built from the panel components of 7:209). */
export function AppearanceEditor() {
  const t = useTranslations("Panel.appearance");
  const { draft, updateSettings, isPremium, requirePremium } = usePanel();
  const s = draft.settings;

  return (
    <>
      <PanelCard title="Panel.appearance.styleTitle" description="Panel.appearance.styleDescription">
        <LayoutPicker value={s.layout} onChange={(layout) => updateSettings({ layout })} />
        <CardStylePicker />
        <ArrangementPicker />
        {/* Neón, Ópalo and Retro draw their own border. */}
        {!cardStyleMeta(s.card_style).ownBorder && (
          <ToggleRow
            label="Panel.appearance.border"
            description={s.layout === "card" ? "Panel.appearance.borderCard" : "Panel.appearance.borderCenter"}
            checked={s.card_border}
            onChange={(card_border) => updateSettings({ card_border })}
          />
        )}
        <SliderRow
          id="card-opacity"
          label={t(s.layout === "card" ? "opacityCard" : "opacityCenter")}
          value={s.card_opacity}
          display={`${Math.round(s.card_opacity * 100)}%${s.card_opacity === 0 ? ` ${t("noBackground")}` : ""}`}
          min={0}
          max={0.9}
          step={0.05}
          onValueChange={([card_opacity]) => updateSettings({ card_opacity })}
        />
        <ToggleRow label="Panel.appearance.tilt" description="Panel.appearance.tiltDescription" checked={s.tilt_3d} onChange={(tilt_3d) => updateSettings({ tilt_3d })} />
      </PanelCard>

      <PanelCard title="Panel.appearance.nameTitle" description="Panel.appearance.nameDescription">
        <div role="radiogroup" aria-label={t("font")} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FONT_CHOICES.map((font) => {
            const selected = s.name_font === font.value;
            const locked = font.premium && !isPremium;
            return (
              <button
                key={font.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => (locked ? requirePremium("Panel.premiumFeatures.fonts") : updateSettings({ name_font: font.value }))}
                className={`flex flex-col items-start gap-1.5 rounded-[14px] bg-surface-2 p-3.5 text-start transition-colors ${selected ? "border-[1.5px] border-lilac" : "border border-line hover:border-muted-foreground/40"}`}
              >
                <span className="text-2xl leading-none font-bold" style={{ fontFamily: nameFontFamily(font.value) }}>
                  Aa
                </span>
                <span className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold">
                  {font.label}
                  {locked && <PremiumBadge />}
                </span>
              </button>
            );
          })}
        </div>
        <NameEffectPicker />
        <AccentPicker value={s.accent_color} swatches={ACCENT_SWATCHES} onChange={(accent_color) => updateSettings({ accent_color })} />
      </PanelCard>

      <PanelCard title="Panel.appearance.backgroundTitle" description="Panel.appearance.backgroundDescription">
        <ChoiceChips label="Panel.appearance.bgType" value={s.bg_kind} options={BACKGROUND_CHOICES} onChange={(bg_kind) => updateSettings({ bg_kind })} premiumFeature="Panel.premiumFeatures.background" />
        {s.bg_kind === "color" && (
          <AccentPicker label="Panel.appearance.bgSolid" value={s.bg_color} swatches={BACKGROUND_SWATCHES} onChange={(bg_color) => updateSettings({ bg_color })} />
        )}
        {s.bg_kind !== "color" && (
          <div className="flex flex-col gap-4 rounded-md bg-surface-2 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <FileUploadButton
                bucket="backgrounds"
                name="fondo"
                label={s.bg_url ? t("changeFile") : t(s.bg_kind === "video" ? "uploadVideo" : "uploadImage")}
                accept={s.bg_kind === "video" ? ["video/mp4", "video/webm"] : ["image/png", "image/jpeg", "image/webp", "image/gif"]}
                onUploaded={(bg_url, file) => updateSettings({ bg_url, bg_kind: file.type.startsWith("video/") ? "video" : "image" })}
              />
              <p className="text-[13px] text-muted-foreground">
                {t(s.bg_kind === "video" ? "videoTypes" : "imageTypes")}
              </p>
            </div>
            {!s.bg_url && <p className="text-[13px] text-gold">{t("noFileYet")}</p>}
          </div>
        )}
        {s.bg_kind !== "color" && (
          <SliderRow id="bg-blur" label={t("blur")} value={s.bg_blur} display={`${s.bg_blur} px`} min={0} max={20} step={1} onValueChange={([bg_blur]) => updateSettings({ bg_blur })} />
        )}
        <ChoiceChips label="Panel.particles.label" value={s.particles} options={PARTICLE_CHOICES} onChange={(particles) => updateSettings({ particles })} premiumFeature="Panel.premiumFeatures.particles" />
        <ToggleRow label="Panel.appearance.cursor" description="Panel.appearance.cursorDescription" checked={s.cursor_trail} onChange={(cursor_trail) => updateSettings({ cursor_trail })} premium premiumFeature="Panel.premiumFeatures.cursor" />
      </PanelCard>

      <TabAndEntryCard />

      <PanelCard title="Panel.appearance.visibleTitle" description="Panel.appearance.visibleDescription">
        <div className="grid gap-2">
          <ToggleRow label="Panel.appearance.showLocation" checked={s.show_location} onChange={(show_location) => updateSettings({ show_location })} />
          <ToggleRow label="Panel.appearance.showBadges" checked={s.show_badges} onChange={(show_badges) => updateSettings({ show_badges })} />
          <ToggleRow label="Panel.appearance.showOnline" checked={s.show_online} onChange={(show_online) => updateSettings({ show_online })} />
          <ToggleRow label="Panel.appearance.showPresence" checked={s.show_presence} onChange={(show_presence) => updateSettings({ show_presence })} />
          <ToggleRow label="Panel.appearance.showPlayer" checked={s.show_player} onChange={(show_player) => updateSettings({ show_player })} />
          <ToggleRow
            label="Panel.appearance.showBranding"
            description={isPremium ? undefined : "Panel.appearance.brandingPremium"}
            checked={s.show_branding}
            onChange={(show_branding) => updateSettings({ show_branding })}
            premium
            premiumFeature="Panel.premiumFeatures.branding"
          />
        </div>
      </PanelCard>
    </>
  );
}
