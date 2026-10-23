"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordReset, updatePassword } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type NewPasswordInput, type RecoverInput, newPasswordSchema, recoverSchema } from "@/lib/validation/auth";

function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** /recuperar — asks for the email and sends the reset link. */
export function RecoverForm() {
  const [isPending, startTransition] = useTransition();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<RecoverInput>({ resolver: zodResolver(recoverSchema), defaultValues: { email: "" } });

  function onSubmit(values: RecoverInput) {
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      if (result.status === "sent") setSentTo(values.email.trim());
      if (result.status === "error") form.setError("root", { message: result.message });
    });
  }

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-xl border border-line bg-surface p-6">
        <MailCheck className="size-9 text-success" aria-hidden />
        <h2 className="font-sans text-xl font-bold">Revisa tu correo</h2>
        <p className="text-[15px] leading-normal text-muted-foreground">
          Si existe una cuenta con <strong className="text-foreground">{sentTo}</strong>, te enviamos un enlace para crear
          una contraseña nueva. Puede tardar unos minutos.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@correo.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormAlert message={form.formState.errors.root?.message} />
        <Button type="submit" variant="opal" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Enviar enlace
        </Button>
      </form>
    </Form>
  );
}

/** /recuperar/nueva — sets the new password once the recovery link signed the user in. */
export function NewPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  function onSubmit(values: NewPasswordInput) {
    startTransition(async () => {
      const result = await updatePassword(values);
      if (result.status === "ok") {
        toast.success("Listo, cambiamos tu contraseña.");
        router.replace("/panel");
      }
      if (result.status === "error") form.setError("root", { message: result.message });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña nueva</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repite la contraseña</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormAlert message={form.formState.errors.root?.message} />
        <Button type="submit" variant="opal" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Guardar contraseña
        </Button>
      </form>
    </Form>
  );
}
