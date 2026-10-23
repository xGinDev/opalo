"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const PREMIUM = "#b9a7ff"; // Figma 8:467 (lilac)
const FREE = "rgba(157,151,171,0.35)"; // Figma 8:470 (muted at 35%)
const MUTED = "#9d97ab";

const dayLabel = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => dayLabel.format(new Date(`${iso}T00:00:00Z`)).replace(".", "");

type Point = { day: string; free: number; premium: number };

/** Figma 8:461 "Nuevos registros": stacked columns per day (Gratis below, Premium on top). */
export function SignupsChart({ data }: { data: Point[] }) {
  const empty = data.every((d) => d.free + d.premium === 0);
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex gap-4 text-xs font-semibold text-muted-foreground" aria-label="Leyenda">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: PREMIUM }} aria-hidden /> Premium
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: FREE }} aria-hidden /> Gratis
        </li>
      </ul>
      <div className="relative h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="22%">
            <XAxis dataKey="day" tickFormatter={fmt} tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={40} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as Point | undefined;
                if (!active || !p) return null;
                return (
                  <div className="rounded-md border border-line bg-popover px-3 py-2 text-[13px] shadow-lg">
                    <p className="mb-1 font-bold">{fmt(p.day)}</p>
                    <p className="text-muted-foreground">
                      Premium <span className="pl-3 font-bold text-foreground tabular-nums">{p.premium}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Gratis <span className="pl-3 font-bold text-foreground tabular-nums">{p.free}</span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="free" stackId="s" fill={FREE} radius={[0, 0, 4, 4]} isAnimationActive={false} />
            <Bar dataKey="premium" stackId="s" fill={PREMIUM} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
        {empty && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Aún no hay registros en este periodo.</p>
        )}
      </div>
    </div>
  );
}
