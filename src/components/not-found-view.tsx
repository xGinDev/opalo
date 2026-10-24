import { Logo } from "@/components/brand/logo";
import { GlowBackdrop } from "@/components/profile/glow-backdrop";
import { Button } from "@/components/ui/button";

type NotFoundViewProps = {
  title: string;
  body: string;
  create: string;
  home: string;
  /** Locale prefix for the links ("" for Spanish, "/en"…). */
  prefix: string;
};

/** 404 in Ópalo style: missing pages and missing or suspended profiles. */
export function NotFoundView({ title, body, create, home, prefix }: NotFoundViewProps) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-4 text-center">
      <GlowBackdrop className="-z-10" />
      <Logo href={prefix || "/"} />
      <p className="text-opal font-display text-[96px] leading-none font-extrabold tracking-[-0.04em] sm:text-[140px]">404</p>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="text-muted-foreground">{body}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="opal" asChild>
          <a href={`${prefix}/registro`}>{create}</a>
        </Button>
        <Button variant="secondary" asChild>
          <a href={prefix || "/"}>{home}</a>
        </Button>
      </div>
    </main>
  );
}
