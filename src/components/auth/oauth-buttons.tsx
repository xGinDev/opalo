"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { SiDiscord, SiGoogle } from "react-icons/si";
import { toast } from "sonner";
import { signInWithProvider } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

type OAuthButtonsProps = {
  next?: string;
  /** Username chosen on /registro, kept for after the OAuth round trip. */
  getPendingUsername?: () => string | undefined;
  disabled?: boolean;
};

/** Must stay in sync with the providers enabled in Supabase (Authentication → Providers). */
const PROVIDERS = [
  { id: "google", label: "Continuar con Google", icon: SiGoogle },
  { id: "discord", label: "Continuar con Discord", icon: SiDiscord },
] as const;

export function OAuthButtons({ next, getPendingUsername, disabled }: OAuthButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function continueWith(provider: (typeof PROVIDERS)[number]["id"]) {
    startTransition(async () => {
      const result = await signInWithProvider(provider, next, getPendingUsername?.());
      if (result?.status === "error") toast.error(result.message);
    });
  }

  return (
    <div className={PROVIDERS.length > 1 ? "grid gap-3 sm:grid-cols-2" : "grid"}>
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="secondary"
          className="px-3"
          disabled={disabled || isPending}
          onClick={() => continueWith(provider.id)}
        >
          {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <provider.icon aria-hidden />}
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
