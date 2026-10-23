import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full font-bold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        lilac: "bg-lilac/16 text-lilac",
        pink: "bg-pink/16 text-pink",
        aqua: "bg-aqua/16 text-aqua",
        gold: "bg-gold/16 text-gold",
        success: "bg-success/14 text-success",
        danger: "bg-danger/14 text-danger",
        neutral: "bg-surface-2 text-muted-foreground",
        opal: "bg-opal text-on-accent",
      },
      size: {
        default: "px-[11px] py-[5px] text-xs",
        sm: "px-2 py-1 text-xs",
      },
    },
    defaultVariants: { tone: "lilac", size: "default" },
  },
);

type TagProps = React.ComponentProps<"span"> & VariantProps<typeof tagVariants>;

/** Figma 2:178 "Etiqueta" — small pill label (Premium, Pago único, +12% esta semana...). */
export function Tag({ className, tone, size, ...props }: TagProps) {
  return <span data-slot="tag" className={cn(tagVariants({ tone, size }), className)} {...props} />;
}

export { tagVariants };
