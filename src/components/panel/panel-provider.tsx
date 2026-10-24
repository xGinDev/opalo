"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { saveProfile } from "@/app/[locale]/panel/actions";
import { useRouter } from "@/i18n/navigation";
import { useMessageText } from "@/i18n/use-message-text";
import type { SettingsPatch } from "@/lib/validation/panel";
import {
  EDITABLE_PROFILE_FIELDS,
  type EditableProfile,
  type EditableSettings,
  type LinkRow,
  type PanelData,
  type ProfileRow,
  type SettingsRow,
  toPublicProfile,
} from "@/lib/panel/types";
import type { PublicProfile } from "@/lib/profile/types";
import { PremiumDialog } from "./premium-dialog";
import { UnsavedDialog } from "./unsaved-dialog";

type Draft = { profile: EditableProfile; settings: EditableSettings };

export type PreviewMode = "mobile" | "desktop";

/** Settings that only show on wide screens (card vs. centered, tilt); touching them switches the preview to desktop. */
const DESKTOP_ONLY_SETTINGS: (keyof EditableSettings)[] = ["layout", "tilt_3d"];

function draftOf(profile: ProfileRow, settings: SettingsRow): Draft {
  const p = Object.fromEntries(EDITABLE_PROFILE_FIELDS.map((k) => [k, profile[k]])) as EditableProfile;
  const { profile_id: _id, updated_at: _at, ...s } = settings;
  return { profile: p, settings: s };
}

function diff<T extends object>(next: T, prev: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(next).filter(([k, v]) => v !== (prev as Record<string, unknown>)[k]),
  ) as Partial<T>;
}

type PanelContextValue = {
  data: PanelData;
  draft: Draft;
  links: LinkRow[];
  isPremium: boolean;
  dirty: boolean;
  saving: boolean;
  preview: PublicProfile;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  updateProfile: (patch: Partial<EditableProfile>) => void;
  updateSettings: (patch: Partial<EditableSettings>) => void;
  save: () => void;
  discard: () => void;
  setLinks: (updater: (links: LinkRow[]) => LinkRow[]) => void;
  setSavedProfile: (patch: Partial<ProfileRow>) => void;
  /** Opens the Premium upsell for a locked option. */
  requirePremium: (feature: string) => void;
  /** Navigates, asking first if there are unsaved changes. */
  navigate: (href: string) => void;
};

const PanelContext = createContext<PanelContextValue | null>(null);

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanel must be used inside <PanelProvider>");
  return ctx;
}

export function PanelProvider({ initial, children }: { initial: PanelData; children: React.ReactNode }) {
  const router = useRouter();
  const t = useTranslations("Panel");
  const text = useMessageText();
  const [data, setData] = useState(initial);
  const [draft, setDraft] = useState(() => draftOf(initial.profile, initial.settings));
  const [saving, startSaving] = useTransition();
  const [premiumFeature, setPremiumFeature] = useState<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile");

  // /admin isn't translated: open it without the language prefix.
  const go = (href: string) => (href.startsWith("/admin") ? window.location.assign(href) : router.push(href));

  const saved = useMemo(() => draftOf(data.profile, data.settings), [data.profile, data.settings]);
  const profilePatch = diff(draft.profile, saved.profile);
  const settingsPatch = diff(draft.settings, saved.settings);
  const dirty = Object.keys(profilePatch).length + Object.keys(settingsPatch).length > 0;

  // Leaving the site (reload, close tab) with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const save = useCallback(() => {
    if (!dirty) return;
    const previous = data;
    // Optimistic: treat the draft as saved right away, roll back if the server says no.
    setData((d) => ({
      ...d,
      profile: { ...d.profile, ...draft.profile },
      settings: { ...d.settings, ...draft.settings },
    }));
    startSaving(async () => {
      // The server re-validates every field (enums, lengths, colors) with zod.
      const result = await saveProfile({ profile: profilePatch, settings: settingsPatch as SettingsPatch });
      if (result.ok) {
        toast.success(t("toasts.saved"));
      } else {
        setData(previous);
        toast.error(text(result.error));
      }
    });
  }, [dirty, data, draft, profilePatch, settingsPatch, t, text]);

  const value: PanelContextValue = {
    data,
    draft,
    links: data.links,
    isPremium: data.profile.plan === "premium",
    dirty,
    saving,
    preview: toPublicProfile({
      ...data,
      profile: { ...data.profile, ...draft.profile },
      settings: { ...data.settings, ...draft.settings },
    }),
    updateProfile: (patch) => setDraft((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
    previewMode,
    setPreviewMode,
    updateSettings: (patch) => {
      if (DESKTOP_ONLY_SETTINGS.some((key) => key in patch)) setPreviewMode("desktop");
      setDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
    },
    save,
    discard: () => setDraft(saved),
    setLinks: (updater) => setData((d) => ({ ...d, links: updater(d.links) })),
    // Avatar and username are saved on their own (not part of the draft).
    setSavedProfile: (patch) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
    requirePremium: setPremiumFeature,
    navigate: (href) => (dirty ? setPendingHref(href) : go(href)),
  };

  return (
    <PanelContext.Provider value={value}>
      {children}
      <PremiumDialog feature={premiumFeature} onClose={() => setPremiumFeature(null)} />
      <UnsavedDialog
        open={pendingHref !== null}
        saving={saving}
        onCancel={() => setPendingHref(null)}
        onDiscard={() => {
          setDraft(saved);
          const href = pendingHref!;
          setPendingHref(null);
          go(href);
        }}
        onSave={() => {
          save();
          const href = pendingHref!;
          setPendingHref(null);
          go(href);
        }}
      />
    </PanelContext.Provider>
  );
}
