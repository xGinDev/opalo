import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Wraps the logo in a link (e.g. "/"). */
  href?: string;
  /** Show only the gem. */
  iconOnly?: boolean;
};

/** Figma 2:130 — opal gem + "ópalo" wordmark. */
export function Logo({ className, href, iconOnly = false }: LogoProps) {
  const t = useTranslations("Common");
  const content = (
    <>
      <Image src="/brand/gem.svg" alt="" width={30} height={30} unoptimized priority />
      {iconOnly ? (
        <span className="sr-only">ópalo</span>
      ) : (
        <span className="font-display text-2xl leading-none font-extrabold tracking-[-0.02em] text-foreground">
          ópalo
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex shrink-0 items-center gap-2.5", className);

  if (href) {
    return (
      <Link href={href} className={cn(classes, "rounded-sm")} aria-label={t("homeLabel")}>
        {content}
      </Link>
    );
  }
  return <span className={classes}>{content}</span>;
}
