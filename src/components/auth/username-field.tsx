"use client";

import { useId } from "react";
import { Check, Loader2, X } from "lucide-react";
import { USERNAME_MAX } from "@/lib/username";
import { cn } from "@/lib/utils";
import type { UsernameStatus } from "./use-username-availability";

type UsernameFieldProps = Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  status: UsernameStatus;
  /** Validation error from the form (shown when there is no live status message). */
  error?: string;
  label?: string;
};

/** Figma 6:243 "Tu enlace": opalo.me/<username> with live availability. */
export function UsernameField({ value, onChange, status, error, label = "Tu enlace", id, ...props }: UsernameFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  const message =
    status.state === "invalid" || status.state === "taken" || status.state === "error" ? status.message : error;
  const isBad = status.state === "invalid" || status.state === "taken" || (status.state === "idle" && Boolean(error));
  const isGood = status.state === "available";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[13px] font-semibold text-muted-foreground">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-3 rounded-md border bg-surface pr-3.5 pl-4 transition-colors focus-within:ring-[3px]",
          isGood && "border-success focus-within:ring-success/25",
          isBad && "border-danger focus-within:ring-danger/25",
          !isGood && !isBad && "border-line focus-within:border-ring focus-within:ring-ring/50",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center text-[15px]">
          <span className="font-semibold text-muted-foreground">opalo.me/</span>
          <input
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            maxLength={USERNAME_MAX + 4}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="tunombre"
            aria-invalid={isBad}
            aria-describedby={message ? messageId : undefined}
            className="w-full min-w-0 bg-transparent font-bold text-foreground outline-none placeholder:font-semibold placeholder:text-muted-foreground"
            {...props}
          />
        </span>
        <span aria-live="polite" className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold">
          {status.state === "checking" && (
            <>
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">Comprobando…</span>
            </>
          )}
          {status.state === "available" && (
            <>
              <Check className="size-4 text-success" aria-hidden />
              <span className="text-success">Disponible</span>
            </>
          )}
          {(status.state === "taken" || status.state === "invalid") && (
            <>
              <X className="size-4 text-danger" aria-hidden />
              <span className="text-danger">No disponible</span>
            </>
          )}
        </span>
      </div>
      {message && (
        <p id={messageId} className="text-[13px] text-danger">
          {message}
        </p>
      )}
    </div>
  );
}
