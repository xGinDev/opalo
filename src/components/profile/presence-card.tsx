type PresenceCardProps = { name: string; text: string; avatarUrl: string | null };

/** Figma 9:784 "estado": Discord-style status. */
export function PresenceCard({ name, text, avatarUrl }: PresenceCardProps) {
  return (
    <div className="flex max-w-full items-center gap-3 rounded-lg border border-white/12 bg-black/40 py-2.5 pr-5 pl-2.5 text-left backdrop-blur-[8px]">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- user upload served from Supabase Storage
        <img src={avatarUrl} alt="" className="size-11 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden className="size-11 shrink-0 rounded-full bg-opal" />
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[15px] font-bold">{name}</span>
        <span className="truncate text-xs font-medium text-muted-foreground">{text}</span>
      </span>
    </div>
  );
}
