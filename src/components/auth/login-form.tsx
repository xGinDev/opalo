"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type LoginInput, loginSchema } from "@/lib/validation/auth";
import { AuthDivider } from "./auth-column";
import { OAuthButtons } from "./oauth-buttons";

type LoginFormProps = {
  next?: string;
  /** Error coming back from /auth/callback or /auth/confirm. */
  initialError?: string;
};

/** Figma 6:135 — email or username + password, plus Google and Discord. */
export function LoginForm({ next, initialError }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", remember: true },
  });
  const formError = form.formState.errors.root?.message ?? initialError;

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await signIn(values, next);
      if (result?.status === "error") form.setError("root", { message: result.message });
    });
  }

  return (
    <>
      <OAuthButtons next={next} disabled={isPending} />
      <AuthDivider />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo o usuario</FormLabel>
                <FormControl>
                  <Input placeholder="tu@correo.com o tu usuario" autoComplete="username" autoCapitalize="none" spellCheck={false} {...field} />
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
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2.5">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  </FormControl>
                  <FormLabel className="text-sm font-medium">Recordarme</FormLabel>
                </FormItem>
              )}
            />
            <Link href="/recuperar" className="text-sm font-bold text-lilac underline-offset-4 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {formError && (
            <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" variant="opal" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" aria-hidden />}
            Iniciar sesión
          </Button>
        </form>
      </Form>
    </>
  );
}
