"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISCORD_ID_REGEX, LANYARD_INVITE } from "@/lib/profile/discord";
import { ChoiceChips, type Choice } from "./editor-ui";
import { usePanel } from "./panel-provider";

const SOURCE_CHOICES: Choice<"custom" | "discord">[] = [
  { value: "custom", label: "Personalizado" },
  { value: "discord", label: "Discord en vivo" },
];

/** Status card source: a custom line of text, or live Discord presence through Lanyard. */
export function PresenceEditor() {
  const { draft, data, updateSettings } = usePanel();
  const s = draft.settings;
  const source = s.presence_source ?? "custom";

  return (
    <div className="flex flex-col gap-3">
      <ChoiceChips label="Estado" value={source} options={SOURCE_CHOICES} onChange={(presence_source) => updateSettings({ presence_source })} />
      {source === "custom" ? (
        <div className="grid gap-2">
          <Label htmlFor="presence_text" className="sr-only">
            Texto del estado
          </Label>
          <Input
            id="presence_text"
            value={s.presence_text ?? ""}
            onChange={(e) => updateSettings({ presence_text: e.target.value })}
            maxLength={60}
            placeholder="jugando Valorant, competitivo"
          />
        </div>
      ) : (
        <DiscordIdField
          value={s.discord_id}
          accountId={data.discordAccountId}
          onChange={(discord_id) => updateSettings({ discord_id })}
        />
      )}
    </div>
  );
}

function DiscordIdField({ value, accountId, onChange }: { value: string | null; accountId: string | null; onChange: (id: string | null) => void }) {
  // Local text so a half-typed ID doesn't reach the draft (it would fail validation on save).
  const [text, setText] = useState(value ?? "");
  const invalid = text !== "" && !DISCORD_ID_REGEX.test(text);

  return (
    <div className="flex flex-col gap-3 rounded-md bg-surface-2 p-4">
      <div className="grid gap-2">
        <Label htmlFor="discord_id">ID de usuario de Discord</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id="discord_id"
            inputMode="numeric"
            value={text}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, 20);
              setText(next);
              if (next === "" || DISCORD_ID_REGEX.test(next)) onChange(next || null);
            }}
            placeholder="123456789012345678"
            aria-invalid={invalid}
            aria-describedby="discord_id-help"
            className="min-w-0 flex-1 bg-background"
          />
          {accountId && accountId !== value && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setText(accountId);
                onChange(accountId);
              }}
            >
              <SiDiscord aria-hidden /> Usar mi Discord
            </Button>
          )}
        </div>
        {invalid && <p className="text-[13px] text-danger">El ID son 17 a 20 números.</p>}
      </div>
      <ol id="discord_id-help" className="flex list-decimal flex-col gap-1.5 pl-5 text-[13px] text-muted-foreground">
        <li>
          Entra al servidor de Discord de{" "}
          <a href={LANYARD_INVITE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-lilac hover:underline">
            Lanyard <ExternalLink className="size-3" aria-hidden />
          </a>
          . Es lo que nos deja leer tu estado; no tienes que escribir nada ahí.
        </li>
        {accountId ? (
          <li>Toca “Usar mi Discord”, o pega el ID de otra cuenta.</li>
        ) : (
          <li>
            Copia tu ID: en Discord, Ajustes → Avanzado → activa Modo desarrollador. Luego clic derecho en tu perfil → Copiar ID de usuario.
          </li>
        )}
        <li>Mira la vista previa: debe salir tu foto, tu estado y lo que estás jugando o escuchando.</li>
      </ol>
    </div>
  );
}
