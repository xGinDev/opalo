import { cn } from "@/lib/utils";
import { Tag } from "./tag";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  /** Short trend text, e.g. "+12% esta semana". */
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

const trendTone = { up: "success", down: "danger", neutral: "neutral" } as const;

/** Figma 2:170 "Tarjeta de métrica". */
export function StatCard({ label, value, change, trend = "up", className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2.5 rounded-lg border border-line bg-surface p-5", className)}>
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <p className="font-display text-[32px] leading-none font-bold tracking-[-0.02em] text-foreground tabular-nums">
        {value}
      </p>
      {change && (
        <Tag tone={trendTone[trend]} size="sm">
          {change}
        </Tag>
      )}
    </div>
  );
}
