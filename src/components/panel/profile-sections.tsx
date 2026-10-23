"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACCENT_SWATCHES } from "@/lib/panel/types";
import type { Enums } from "@/types/database";
import { AvatarUploader } from "./avatar-uploader";
import { AccentPicker, ChoiceChips, type Choice, Counter, LayoutPicker, PanelCard, ToggleRow } from "./editor-ui";
import { LinksManager } from "./links-manager";
import { usePanel } from "./panel-provider";

export const PARTICLE_CHOICES: Choice<Enums<"particle_kind">>[] = [
  { value: "stars", label: "Estrellas" },
  { value: "rain", label: "Lluvia" },
  { value: "petals", label: "Pétalos", premium: true },
  { value: "snow", label: "Nieve" },
  { value: "none", label: "Ninguna" },
];

/** Figma 7:333 "Información" + avatar and status. */
export function InfoCard() {
  const { draft, updateProfile, updateSettings } = usePanel();
  const { profile, settings } = draft;

  return (
    <PanelCard title="Información" description="Lo primero que ve la gente al entrar.">
      <AvatarUploader />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="display_name">Nombre</Label>
          <Input
            id="display_name"
            value={profile.display_name ?? ""}
            onChange={(e) => updateProfile({ display_name: e.target.value })}
            maxLength={32}
            placeholder="Cómo quieres que te vean"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            value={profile.location ?? ""}
            onChange={(e) => updateProfile({ location: e.target.value })}
            maxLength={40}
            placeholder="en algún lugar"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio (separa frases con | para que roten)</Label>
        <Textarea
          id="bio"
          value={profile.bio ?? ""}
          onChange={(e) => updateProfile({ bio: e.target.value })}
          maxLength={300}
          rows={1}
          className="min-h-12"
          placeholder="dev de día, gamer de noche | si lees esto, toma agua"
        />
        <Counter value={profile.bio} max={300} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="presence_text">Estado</Label>
        <Input
          id="presence_text"
          value={settings.presence_text ?? ""}
          onChange={(e) => updateSettings({ presence_text: e.target.value })}
          maxLength={60}
          placeholder="jugando Valorant, competitivo"
        />
      </div>
      <ToggleRow
        label="Mostrar estado"
        description="Aparece debajo de tu nombre, como en Discord."
        checked={settings.show_presence}
        onChange={(show_presence) => updateSettings({ show_presence })}
      />
    </PanelCard>
  );
}

export function LinksCard() {
  return (
    <PanelCard title="Redes" description="Arrastra para cambiar el orden.">
      <LinksManager />
    </PanelCard>
  );
}

/** Figma 7:453 "Apariencia rápida". */
export function QuickAppearanceCard() {
  const { draft, updateSettings } = usePanel();
  const { settings } = draft;
  return (
    <PanelCard title="Apariencia rápida" description="Más opciones en la sección Apariencia.">
      <LayoutPicker value={settings.layout} onChange={(layout) => updateSettings({ layout })} />
      <AccentPicker value={settings.accent_color} swatches={ACCENT_SWATCHES} onChange={(accent_color) => updateSettings({ accent_color })} />
      <ChoiceChips
        label="Partículas"
        value={settings.particles}
        options={PARTICLE_CHOICES}
        onChange={(particles) => updateSettings({ particles })}
        premiumFeature="las partículas de pétalos"
      />
    </PanelCard>
  );
}
