"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { signUp } from "@/app/[locale]/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { useMessageText } from "@/i18n/use-message-text";
import { type RegisterInput, type RegisterValues, registerSchema } from "@/lib/validation/auth";
import { AuthDivider } from "./auth-column";
import { OAuthButtons } from "./oauth-buttons";
import { useUsernameAvailability } from "./use-username-availability";
import { UsernameField } from "./username-field";

type RegisterFormProps = {
  next: string;
  initialUsername?: string;
};

/** Figma 6:230 — sign-up with live username check. */
export function RegisterForm({ next, initialUsername = "" }: RegisterFormProps) {
  const t = useTranslations("Auth.register");
  const text = useMessageText();
  const [isPending, startTransition] = useTransition();
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const form = useForm<RegisterInput, unknown, RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: initialUsername, email: "", password: "", terms: false },
  });
  const username = useWatch({ control: form.control, name: "username" });
  const availability = useUsernameAvailability(username);

  function onSubmit() {
    if (availability.state === "taken") {
      form.setError("username", { message: availability.message });
      return;
    }
    const input = form.getValues();
    startTransition(async () => {
      const result = await signUp(input, next);
      if (result?.status === "confirm-email") setConfirmEmail(result.email);
      if (result?.status === "error") {
        const field = result.field as keyof RegisterInput | undefined;
        form.setError(field && field in input ? field : "root", { message: result.message });
      }
    });
  }

  if (confirmEmail) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-xl border border-line bg-surface p-6">
        <MailCheck className="size-9 text-success" aria-hidden />
        <h2 className="font-sans text-xl font-bold">{t("checkEmailTitle")}</h2>
        <p className="text-[15px] leading-normal text-muted-foreground">
          {t.rich("checkEmailBody", {
            email: confirmEmail,
            strong: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
      </div>
    );
  }

  return (
    <>
      <OAuthButtons
        next={next}
        disabled={isPending}
        getPendingUsername={() => (availability.state === "available" ? username : undefined)}
      />
      <AuthDivider />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <UsernameField
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChange={field.onChange}
                status={availability}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("emailPlaceholder")} autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t("passwordPlaceholder")} autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2.5">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  </FormControl>
                  <FormLabel className="text-sm leading-snug font-medium">
                    <span>
                      {t.rich("terms", {
                        terms: (chunks) => (
                          <Link href="/terminos" target="_blank" className="font-bold text-lilac hover:underline">
                            {chunks}
                          </Link>
                        ),
                        privacy: (chunks) => (
                          <Link href="/privacidad" target="_blank" className="font-bold text-lilac hover:underline">
                            {chunks}
                          </Link>
                        ),
                      })}
                    </span>
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {text(form.formState.errors.root.message)}
            </p>
          )}

          <Button type="submit" variant="opal" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" aria-hidden />}
            {t("submit")}
          </Button>
        </form>
      </Form>
    </>
  );
}
