import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  id?: string;
  title: React.ReactNode;
  description?: string;
  align?: "start" | "center";
  className?: string;
};

/** Shared section title + subtitle (Figma 5:44, 5:98, 5:170). */
export function SectionHeading({ id, title, description, align = "start", className }: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3.5",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <h2 id={id} className="text-4xl font-bold tracking-[-0.025em] sm:text-[50px] sm:leading-tight">
        {title}
      </h2>
      {description && (
        <p className="max-w-[560px] text-base leading-normal text-muted-foreground sm:text-lg">{description}</p>
      )}
    </Reveal>
  );
}
