"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendContactMessage } from "@/app/[locale]/(site)/contacto/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { useMessageText } from "@/i18n/use-message-text";
import {
  CONTACT_MESSAGE_MAX,
  CONTACT_REASONS,
  type ContactInput,
  type ContactValues,
  contactSchema,
} from "@/lib/validation/contact";

const DEFAULTS: ContactInput = { name: "", email: "", reason: "" as ContactInput["reason"], username: "", message: "", website: "" };

/** Figma 23:595 "Formulario". */
export function ContactForm() {
  const t = useTranslations("Contact");
  const text = useMessageText();
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const form = useForm<ContactInput, unknown, ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: DEFAULTS,
  });
  const messageLength = useWatch({ control: form.control, name: "message" })?.length ?? 0;

  function onSubmit() {
    // Send the raw input: the server parses it again with the same schema.
    const input = form.getValues();
    startTransition(async () => {
      const result = await sendContactMessage(input);
      if (result.status === "success") {
        setSent(true);
        toast.success(t("form.sentToast"));
        return;
      }
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as keyof ContactInput, { message });
      }
      toast.error(text(result.message));
    });
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <CheckCircle2 className="size-10 text-success" aria-hidden />
        <h2 className="text-[26px] font-bold tracking-[-0.01em]">{t("form.sentTitle")}</h2>
        <p className="text-[15px] leading-normal text-muted-foreground">{t("form.sentBody")}</p>
        <Button
          variant="secondary"
          onClick={() => {
            form.reset(DEFAULTS);
            setSent(false);
          }}
        >
          {t("form.sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[26px] font-bold tracking-[-0.01em]">{t("form.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("form.subtitle")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3.5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.namePlaceholder")} autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("form.emailPlaceholder")} autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.reason")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-12 data-[size=default]:h-12 w-full rounded-md border-line bg-surface-2 px-4 text-[15px] font-medium data-[placeholder]:text-muted-foreground">
                    <SelectValue placeholder={t("form.reasonPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTACT_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {t(`reasons.${reason}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.username")}</FormLabel>
              <FormControl>
                <Input placeholder="opalo.me/tunombre" autoCapitalize="none" spellCheck={false} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.message")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("form.messagePlaceholder")}
                  maxLength={CONTACT_MESSAGE_MAX}
                  className="h-[140px] resize-none [field-sizing:fixed]"
                  {...field}
                />
              </FormControl>
              <div className="flex items-start justify-between gap-3">
                <FormMessage />
                <p className="ms-auto text-xs font-medium text-muted-foreground tabular-nums" aria-live="polite">
                  {messageLength} / {CONTACT_MESSAGE_MAX}
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Honeypot: invisible to people and screen readers. */}
        <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
          <label>
            {t("form.honeypot")}
            <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
          </label>
        </div>

        <Button type="submit" variant="opal" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {isPending ? t("form.sending") : t("form.submit")}
        </Button>

        <p className="text-xs leading-normal text-muted-foreground">
          {t.rich("form.consent", {
            privacy: (chunks) => (
              <Link href="/privacidad" className="font-semibold text-lilac underline-offset-4 hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </form>
    </Form>
  );
}
