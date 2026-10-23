import { cn } from "@/lib/utils";

type ProfilePreviewProps = {
  /** The public profile component, rendered inside the phone frame. */
  children: React.ReactNode;
  /** Shows the "Vista previa en vivo" label above the frame. */
  showLabel?: boolean;
  className?: string;
};

/** Figma 7:486 — live preview: phone frame that hosts the same component as the public profile. */
export function ProfilePreview({ children, showLabel = true, className }: ProfilePreviewProps) {
  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      {showLabel && (
        <p className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          Vista previa en vivo
        </p>
      )}
      <div
        className="relative isolate h-[700px] w-[340px] max-w-full overflow-hidden rounded-[40px] border-6 border-white/12 bg-[#120f1a] [container-type:inline-size]"
        role="region"
        aria-label="Vista previa del perfil"
      >
        {children}
      </div>
    </div>
  );
}
