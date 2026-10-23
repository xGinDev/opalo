import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "./tag";

type PlanCardProps = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  /** Call to action, usually a <Button>. */
  action: React.ReactNode;
  /** Optional pill next to the name, e.g. "Pago único". */
  tag?: string;
  /** Premium style: opal border, glow and gradient price. */
  highlighted?: boolean;
  className?: string;
};

/** Figma 5:174 / 5:210 — pricing plan card. */
export function PlanCard({
  name,
  price,
  period,
  description,
  features,
  action,
  tag,
  highlighted = false,
  className,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 rounded-2xl p-7 sm:p-9",
        highlighted
          ? "border-opal shadow-[0_24px_80px_-10px_rgba(185,167,255,0.28)] [--opal-border-fill:var(--opal-surface-2)] [--opal-border-width:1.5px]"
          : "border border-line bg-surface",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <h3 className="font-sans text-xl font-bold text-foreground">{name}</h3>
        {tag && <Tag>{tag}</Tag>}
      </div>

      <div className="flex items-baseline gap-2.5 whitespace-nowrap">
        <span
          className={cn(
            "font-display text-[60px] leading-none font-extrabold tracking-[-0.03em]",
            highlighted ? "text-opal" : "text-foreground",
          )}
        >
          {price}
        </span>
        <span className="text-base font-semibold text-muted-foreground">{period}</span>
      </div>

      <p className="text-[15px] leading-normal text-muted-foreground">{description}</p>

      <div className="[&>*]:w-full">{action}</div>

      <hr className="h-px border-0 bg-line" />

      <ul className="flex flex-col gap-3.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-[15px] font-medium text-foreground">
            <Check
              className={cn("size-[18px] shrink-0", highlighted ? "text-lilac" : "text-muted-foreground")}
              strokeWidth={2}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
