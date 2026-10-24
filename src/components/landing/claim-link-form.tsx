"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { USERNAME_MAX, isValidUsername, normalizeUsername } from "@/lib/username";

/** Figma 3:30 "Reservar enlace": opalo.me/<username> → continues to the sign-up form. */
export function ClaimLinkForm() {
  const t = useTranslations("Landing.claim");
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = normalizeUsername(value);
    if (username && !isValidUsername(username)) {
      setError(t("invalid"));
      return;
    }
    router.push(username ? { pathname: "/registro", query: { usuario: username } } : "/registro");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-[540px]">
      <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-2 transition-colors focus-within:border-lilac/60 sm:flex-row sm:items-center sm:ps-5">
        {/* The link reads left to right in every language. */}
        <label htmlFor={inputId} dir="ltr" className="flex min-w-0 flex-1 items-center px-3 pt-2 text-[17px] sm:p-0">
          <span className="font-semibold text-muted-foreground">opalo.me/</span>
          <input
            id={inputId}
            name="usuario"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={t("placeholder")}
            maxLength={USERNAME_MAX}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-label={t("label")}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-full min-w-0 bg-transparent font-bold text-foreground outline-none placeholder:text-foreground"
          />
        </label>
        <Button type="submit" variant="opal" className="shrink-0">
          {t("submit")}
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
