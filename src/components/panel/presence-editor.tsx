"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISCORD_ID_REGEX, LANYARD_INVITE } from "@/lib/profile/discord";
import { ChoiceChips, type Choice } from "./editor-ui";
import { usePanel } from "./panel-provider";

const SOURCE_CHOICES: Choice<"custom" | "discord">[] = [
  { value: "custom", label: "Panel.presence.custom" },
  { value: "discord", label: "Panel.presence.discord" },
];

/** Status card source: a custom line of text, or live Discord presence through Lanyard. */
export function PresenceEditor() {
  const t = useTranslations("Panel.presence");
  const { draft, data, updateSettings } = usePanel();
  const s = draft.settings;
  const source = s.presence_source ?? "custom";

  return (
    <div className="flex flex-col gap-3">
      <ChoiceChips label="Panel.presence.label" value={source} options={SOURCE_CHOICES} onChange={(presence_source) => updateSettings({ presence_source })} />
      {source === "custom" ? (
        <div className="grid gap-2">
          <Label htmlFor="presence_text" className="sr-only">
            {t("textLabel")}
          </Label>
          <Input
            id="presence_text"
            value={s.presence_text ?? ""}
            onChange={(e) => updateSettings({ presence_text: e.target.value })}
            maxLength={60}
            placeholder={t("textPlaceholder")}
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
  const t = useTranslations("Panel.presence");
  // Local text so a half-typed ID doesn't reach the draft (it would fail validation on save).
  const [text, setText] = useState(value ?? "");
  const invalid = text !== "" && !DISCORD_ID_REGEX.test(text);

  return (
    <div className="flex flex-col gap-3 rounded-md bg-surface-2 p-4">
      <div className="grid gap-2">
        <Label htmlFor="discord_id">{t("discordId")}</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id="discord_id"
            inputMode="numeric"
            dir="ltr"
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
              <SiDiscord aria-hidden /> {t("useMine")}
            </Button>
          )}
        </div>
        {invalid && <p className="text-[13px] text-danger">{t("invalidId")}</p>}
      </div>
      <ol id="discord_id-help" className="flex list-decimal flex-col gap-1.5 ps-5 text-[13px] text-muted-foreground">
        <li>
          {t.rich("step1", {
            lanyard: (chunks) => (
              <a
                href={LANYARD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-lilac hover:underline"
              >
                {chunks} <ExternalLink className="size-3" aria-hidden />
              </a>
            ),
          })}
        </li>
        <li>{accountId ? t("step2Mine") : t("step2Copy")}</li>
        <li>{t("step3")}</li>
      </ol>
    </div>
  );
}
