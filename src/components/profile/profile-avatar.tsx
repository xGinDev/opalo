import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  name: string;
  avatarUrl: string | null;
  accent: string;
  online: boolean;
  className?: string;
};

/** Figma 9:763 "avatar con estado": photo (or initial), accent glow and the online dot. */
export function ProfileAvatar({ name, avatarUrl, accent, online, className }: ProfileAvatarProps) {
  const t = useTranslations("Profile");
  const initial = [...name.trim()][0]?.toUpperCase() ?? "?";

  return (
    <div className={cn("relative shrink-0 [container-type:inline-size]", className)}>
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-70 blur-[15px]"
        style={{ backgroundColor: accent }}
      />
      <div
        className="relative flex size-full items-center justify-center overflow-hidden rounded-full border-3 border-white/16"
        style={
          avatarUrl ? undefined : { backgroundImage: "linear-gradient(135deg, #f6a8cf 0%, #b9a7ff 35.7%, #8fe3dc 71.4%)" }
        }
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user upload served from Supabase Storage
          <img src={avatarUrl} alt={t("photoOf", { name })} className="size-full object-cover" decoding="async" />
        ) : (
          <span className="font-display text-[length:40cqw] font-extrabold text-on-accent" aria-hidden>
            {initial}
          </span>
        )}
      </div>
      {online && (
        <span
          role="img"
          aria-label={t("online")}
          className="absolute end-[4%] bottom-[4%] size-[20%] rounded-full border-4 border-[#0b0812] bg-success"
        />
      )}
    </div>
  );
}
