"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, LogOut, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { signOut } from "@/app/[locale]/(auth)/actions";
import { changeEmail, changePassword, changeUsername, deleteAccount } from "@/app/[locale]/panel/actions";
import { useUsernameAvailability } from "@/components/auth/use-username-availability";
import { UsernameField } from "@/components/auth/username-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { useMessageText } from "@/i18n/use-message-text";
import { normalizeUsername } from "@/lib/username";
import { PASSWORD_MIN } from "@/lib/validation/auth";
import { PanelCard } from "./editor-ui";
import { usePanel } from "./panel-provider";

const COOLDOWN_DAYS = 14;

function UsernameSection() {
  const t = useTranslations("Panel.settings.username");
  const text = useMessageText();
  const format = useFormatter();
  const { data, setSavedProfile } = usePanel();
  const current = data.profile.username;
  const [value, setValue] = useState(current);
  const [isPending, startTransition] = useTransition();
  const status = useUsernameAvailability(value, current);

  const changedAt = data.profile.username_changed_at ? new Date(data.profile.username_changed_at) : null;
  const nextChange = changedAt ? new Date(changedAt.getTime() + COOLDOWN_DAYS * 86_400_000) : null;
  // eslint-disable-next-line react-hooks/purity -- the cooldown check needs "now"; re-evaluated on each render is fine
  const onCooldown = nextChange !== null && nextChange.getTime() > Date.now();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await changeUsername(value);
      if (result.ok && result.data) {
        setSavedProfile({ username: result.data.username, username_changed_at: new Date().toISOString() });
        setValue(result.data.username);
        toast.success(t("changed", { username: result.data.username }));
      } else if (!result.ok) {
        toast.error(text(result.error));
      }
    });
  }

  return (
    <PanelCard title={t("title")} description={t("description", { days: COOLDOWN_DAYS })}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <UsernameField value={value} onChange={setValue} status={status} disabled={onCooldown || isPending} label={t("label")} />
        <p className="rounded-md bg-surface-2 px-4 py-3 text-[13px] text-muted-foreground">
          {onCooldown
            ? t("cooldown", { date: format.dateTime(nextChange!, { day: "numeric", month: "long" }) })
            : t("reservedNote", { days: COOLDOWN_DAYS })}
        </p>
        <Button
          type="submit"
          variant="opal"
          className="self-start"
          disabled={onCooldown || isPending || status.state !== "available" || normalizeUsername(value) === current}
        >
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t("submit")}
        </Button>
      </form>
    </PanelCard>
  );
}

function EmailSection() {
  const t = useTranslations("Panel.settings.email");
  const text = useMessageText();
  const { data } = usePanel();
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await changeEmail(email);
      if (result.ok) {
        toast.success(t("sent"));
        setEmail("");
      } else toast.error(text(result.error));
    });
  }

  return (
    <PanelCard title={t("title")} description={data.email ? t("current", { email: data.email }) : undefined}>
      <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="new-email">{t("label")}</Label>
          <Input id="new-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("placeholder")} />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending || !email}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t("submit")}
        </Button>
      </form>
    </PanelCard>
  );
}

function PasswordSection() {
  const t = useTranslations("Panel.settings.password");
  const text = useMessageText();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const mismatch = confirm.length > 0 && next !== confirm;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) return;
    startTransition(async () => {
      const result = await changePassword(current, next);
      if (result.ok) {
        toast.success(t("updated"));
        setCurrent("");
        setNext("");
        setConfirm("");
      } else toast.error(text(result.error));
    });
  }

  return (
    <PanelCard title={t("title")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current-password">{t("current")}</Label>
          <Input id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="new-password">{t("new")}</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={t("newPlaceholder", { min: PASSWORD_MIN })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">{t("confirm")}</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} />
            {mismatch && <p className="text-[13px] text-danger">{t("mismatch")}</p>}
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground">
          {t.rich("noPassword", {
            link: (chunks) => (
              <Link href="/recuperar" className="font-bold text-lilac hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <Button type="submit" variant="secondary" className="self-start" disabled={isPending || !current || next.length < PASSWORD_MIN || mismatch}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t("submit")}
        </Button>
      </form>
    </PanelCard>
  );
}

function DangerSection() {
  const t = useTranslations("Panel.settings.account");
  const text = useMessageText();
  const { data } = usePanel();
  const [confirmation, setConfirmation] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const matches = normalizeUsername(confirmation) === data.profile.username;

  return (
    <PanelCard title={t("title")} description={t("description")}>
      <div className="flex flex-wrap gap-3">
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            <LogOut aria-hidden /> {t("signOut")}
          </Button>
        </form>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 aria-hidden /> {t("delete")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("deleteTitle")}</DialogTitle>
              <DialogDescription>{t("deleteBody")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Label htmlFor="delete-confirm">{t("typeOrPaste")}</Label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(data.profile.username);
                      setCopied(true);
                      toast.success(t("copied"));
                      setTimeout(() => setCopied(false), 2000);
                    } catch {
                      toast.error(t("copyFailed"));
                    }
                  }}
                  aria-label={t("copy", { username: data.profile.username })}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-surface-2 px-2 py-0.5 text-[13px] font-bold text-foreground transition-colors hover:bg-surface-2/70"
                >
                  {data.profile.username}
                  {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5 text-muted-foreground" aria-hidden />}
                </button>
                <span className="text-[13px] font-semibold text-muted-foreground">{t("toConfirm")}</span>
              </div>
              <Input id="delete-confirm" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" autoCapitalize="none" />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={!matches || isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteAccount(confirmation);
                    if (result && !result.ok) toast.error(text(result.error));
                  })
                }
              >
                {isPending && <Loader2 className="animate-spin" aria-hidden />}
                {t("confirmDelete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PanelCard>
  );
}

/** /panel/ajustes (not in the Figma; uses the panel components). */
export function SettingsForms() {
  return (
    <>
      <UsernameSection />
      <EmailSection />
      <PasswordSection />
      <DangerSection />
    </>
  );
}
