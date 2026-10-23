"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ACCENT_SWATCHES, BACKGROUND_SWATCHES } from "@/lib/panel/types";
import { nameFontFamily } from "@/lib/profile-fonts";
import type { Enums } from "@/types/database";
import { AccentPicker, ChoiceChips, type Choice, LayoutPicker, PanelCard, PremiumBadge, ToggleRow } from "./editor-ui";
import { FileUploadButton } from "./file-upload-button";
import { TabAndEntryCard } from "./tab-entry-card";
import { usePanel } from "./panel-provider";
import { PARTICLE_CHOICES } from "./profile-sections";

const FONT_CHOICES: Choice<string>[] = [
  { value: "Unbounded", label: "Unbounded" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Silkscreen", label: "Silkscreen", premium: true },
  { value: "Fredoka", label: "Fredoka", premium: true },
];

const EFFECT_CHOICES: Choice<Enums<"name_fx">>[] = [
  { value: "glow", label: "Brillo" },
  { value: "none", label: "Ninguno" },
  { value: "sparkle", label: "Destellos", premium: true },
  { value: "rainbow", label: "Arcoíris", premium: true },
];

const BACKGROUND_CHOICES: Choice<Enums<"bg_kind">>[] = [
  { value: "color", label: "Color" },
  { value: "image", label: "Imagen o GIF", premium: true },
  { value: "video", label: "Video", premium: true },
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
  const { draft, updateSettings, isPremium, requirePremium } = usePanel();
  const s = draft.settings;

  return (
    <>
      <PanelCard title="Estilo" description="Cómo se acomoda tu perfil en la pantalla.">
        <LayoutPicker value={s.layout} onChange={(layout) => updateSettings({ layout })} />
        <ToggleRow
          label="Borde grueso"
          description={
            s.layout === "card"
              ? "Un marco claro alrededor de la tarjeta."
              : "Un marco claro alrededor del contenido centrado."
          }
          checked={s.card_border}
          onChange={(card_border) => updateSettings({ card_border })}
        />
        <SliderRow
          id="card-opacity"
          label={s.layout === "card" ? "Opacidad de la tarjeta" : "Opacidad del fondo del contenido"}
          value={s.card_opacity}
          display={`${Math.round(s.card_opacity * 100)}%${s.card_opacity === 0 ? " (sin fondo)" : ""}`}
          min={0}
          max={0.9}
          step={0.05}
          onValueChange={([card_opacity]) => updateSettings({ card_opacity })}
        />
        <ToggleRow label="Inclinación 3D" description="La tarjeta sigue al mouse (solo en computador)." checked={s.tilt_3d} onChange={(tilt_3d) => updateSettings({ tilt_3d })} />
      </PanelCard>

      <PanelCard title="Nombre" description="Tipografía, efecto y color de acento.">
        <div role="radiogroup" aria-label="Tipografía" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FONT_CHOICES.map((font) => {
            const selected = s.name_font === font.value;
            const locked = font.premium && !isPremium;
            return (
              <button
                key={font.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => (locked ? requirePremium("las tipografías extra") : updateSettings({ name_font: font.value }))}
                className={`flex flex-col items-start gap-1.5 rounded-[14px] bg-surface-2 p-3.5 text-left transition-colors ${selected ? "border-[1.5px] border-lilac" : "border border-line hover:border-muted-foreground/40"}`}
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
        <ChoiceChips label="Efecto" value={s.name_effect} options={EFFECT_CHOICES} onChange={(name_effect) => updateSettings({ name_effect })} premiumFeature="los efectos destellos y arcoíris" />
        <AccentPicker value={s.accent_color} swatches={ACCENT_SWATCHES} onChange={(accent_color) => updateSettings({ accent_color })} />
      </PanelCard>

      <PanelCard title="Fondo" description="Un color sólido, o tu propia imagen o video.">
        <ChoiceChips label="Tipo" value={s.bg_kind} options={BACKGROUND_CHOICES} onChange={(bg_kind) => updateSettings({ bg_kind })} premiumFeature="el fondo con imagen o video" />
        {s.bg_kind === "color" && (
          <AccentPicker label="Color de fondo" value={s.bg_color} swatches={BACKGROUND_SWATCHES} onChange={(bg_color) => updateSettings({ bg_color })} />
        )}
        {s.bg_kind !== "color" && (
          <div className="flex flex-col gap-4 rounded-md bg-surface-2 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <FileUploadButton
                bucket="backgrounds"
                name="fondo"
                label={s.bg_url ? "Cambiar archivo" : `Subir ${s.bg_kind === "video" ? "video" : "imagen"}`}
                accept={s.bg_kind === "video" ? ["video/mp4", "video/webm"] : ["image/png", "image/jpeg", "image/webp", "image/gif"]}
                onUploaded={(bg_url, file) => updateSettings({ bg_url, bg_kind: file.type.startsWith("video/") ? "video" : "image" })}
              />
              <p className="text-[13px] text-muted-foreground">
                {s.bg_kind === "video" ? "MP4 o WebM, hasta 50 MB." : "PNG, JPG, WebP o GIF, hasta 50 MB."}
              </p>
            </div>
            {!s.bg_url && <p className="text-[13px] text-gold">Sube un archivo para ver tu fondo. Mientras tanto se usa tu color de fondo.</p>}
          </div>
        )}
        {s.bg_kind !== "color" && (
          <SliderRow id="bg-blur" label="Desenfoque" value={s.bg_blur} display={`${s.bg_blur} px`} min={0} max={20} step={1} onValueChange={([bg_blur]) => updateSettings({ bg_blur })} />
        )}
        <ChoiceChips label="Partículas" value={s.particles} options={PARTICLE_CHOICES} onChange={(particles) => updateSettings({ particles })} premiumFeature="las partículas de pétalos" />
        <ToggleRow label="Rastro del cursor" description="Puntos que siguen al mouse." checked={s.cursor_trail} onChange={(cursor_trail) => updateSettings({ cursor_trail })} premium premiumFeature="el rastro del cursor" />
      </PanelCard>

      <TabAndEntryCard />

      <PanelCard title="Opciones visibles" description="Elige qué se muestra en tu página.">
        <div className="grid gap-2">
          <ToggleRow label="Ubicación" checked={s.show_location} onChange={(show_location) => updateSettings({ show_location })} />
          <ToggleRow label="Insignias" checked={s.show_badges} onChange={(show_badges) => updateSettings({ show_badges })} />
          <ToggleRow label="Punto de en línea" checked={s.show_online} onChange={(show_online) => updateSettings({ show_online })} />
          <ToggleRow label="Estado" checked={s.show_presence} onChange={(show_presence) => updateSettings({ show_presence })} />
          <ToggleRow label="Reproductor de música" checked={s.show_player} onChange={(show_player) => updateSettings({ show_player })} />
          <ToggleRow
            label="Marca “Hecho con ópalo”"
            description={isPremium ? undefined : "Quitarla es de Premium."}
            checked={s.show_branding}
            onChange={(show_branding) => updateSettings({ show_branding })}
            premium
            premiumFeature="la opción de quitar la marca de Ópalo"
          />
        </div>
      </PanelCard>
    </>
  );
}
