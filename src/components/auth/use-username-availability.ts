"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizeUsername } from "@/lib/username";
import { usernameFormatError } from "@/lib/validation/auth";

export type UsernameStatus =
  | { state: "idle" }
  | { state: "invalid"; message: string }
  | { state: "checking" }
  | { state: "available" }
  | { state: "taken"; message: string }
  | { state: "error"; message: string };

const DEBOUNCE_MS = 300;

/**
 * Live availability for a username: format errors are instant, then `check_username`
 * runs 300 ms after the user stops typing. `current` skips the check (e.g. the user's own name in Ajustes).
 */
export function useUsernameAvailability(raw: string, current?: string): UsernameStatus {
  const value = normalizeUsername(raw);
  const formatError = value ? usernameFormatError(value) : null;
  const needsCheck = Boolean(value) && !formatError && value !== current;
  const [remote, setRemote] = useState<{ value: string; status: UsernameStatus } | null>(null);

  useEffect(() => {
    if (!needsCheck) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data, error } = await createClient().rpc("check_username", { p_username: value });
      if (cancelled) return;
      const status: UsernameStatus = error
        ? { state: "error", message: "No pudimos comprobarlo. Inténtalo de nuevo." }
        : data
          ? { state: "available" }
          : { state: "taken", message: "Ese nombre ya está en uso o reservado." };
      setRemote({ value, status });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, needsCheck]);

  if (!value || value === current) return { state: "idle" };
  if (formatError) return { state: "invalid", message: formatError };
  if (remote?.value === value) return remote.status;
  return { state: "checking" };
}
