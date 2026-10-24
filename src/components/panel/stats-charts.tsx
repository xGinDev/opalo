"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale, useTranslations } from "next-intl";
import { useMessageText } from "@/i18n/use-message-text";
import { platformMeta } from "@/lib/profile/links";

// Validated with the dataviz palette checks on the panel surface (#16141d, dark):
// lightness band, chroma floor, CVD ΔE 15.7, normal-vision ΔE 23.0, contrast ≥ 3:1.
const VIEWS_COLOR = "#8f7cf5";
const CLICKS_COLOR = "#1fa595";
const SURFACE = "#16141d";
const GRID = "#2c2836";
const MUTED = "#9d97ab";

export type DayPoint = { day: string; views: number; clicks: number };
export type NetworkPoint = { platform: string; clicks: number };

/** Day labels and numbers in the viewer's language. */
function useChartFormat() {
  const locale = useLocale();
  const dayLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const plain = new Intl.NumberFormat(locale);
  return {
    day: (iso: string) => dayLabel.format(new Date(`${iso}T00:00:00Z`)),
    compact: (v: number) => compact.format(v),
    count: (v: number) => plain.format(v),
  };
}

function Legend() {
  const t = useTranslations("Panel.stats");
  return (
    <ul className="flex gap-4 text-[13px] font-semibold text-muted-foreground" aria-label={t("legend")}>
      <li className="flex items-center gap-2">
        <span className="h-0.5 w-4 rounded-full" style={{ background: VIEWS_COLOR }} aria-hidden /> {t("seriesViews")}
      </li>
      <li className="flex items-center gap-2">
        <span className="h-0.5 w-4 rounded-full" style={{ background: CLICKS_COLOR }} aria-hidden /> {t("seriesClicks")}
      </li>
    </ul>
  );
}

type TooltipPayload = { payload?: Array<{ payload: DayPoint }> };

function DayTooltip({ active, payload }: { active?: boolean } & TooltipPayload) {
  const t = useTranslations("Panel.stats");
  const f = useChartFormat();
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-md border border-line bg-popover px-3 py-2 text-[13px] shadow-lg">
      <p className="mb-1 font-bold">{f.day(point.day)}</p>
      <p className="flex items-center gap-2 text-muted-foreground">
        <span className="size-2 rounded-full" style={{ background: VIEWS_COLOR }} aria-hidden />
        {t("seriesViews")} <span className="ms-auto ps-4 font-bold text-foreground tabular-nums">{f.count(point.views)}</span>
      </p>
      <p className="flex items-center gap-2 text-muted-foreground">
        <span className="size-2 rounded-full" style={{ background: CLICKS_COLOR }} aria-hidden />
        {t("seriesClicks")} <span className="ms-auto ps-4 font-bold text-foreground tabular-nums">{f.count(point.clicks)}</span>
      </p>
    </div>
  );
}

/** Visits and clicks per day: one axis (both are counts), 2px lines, light area wash on visits. */
export function DailyChart({ data }: { data: DayPoint[] }) {
  const t = useTranslations("Panel.stats");
  const f = useChartFormat();
  const empty = data.every((d) => d.views === 0 && d.clicks === 0);
  return (
    <div className="flex flex-col gap-4">
      <Legend />
      <div className="relative h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
            <XAxis
              dataKey="day"
              tickFormatter={f.day}
              tick={{ fill: MUTED, fontSize: 12 }}
              axisLine={{ stroke: GRID }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tickCount={4}
              domain={[0, (max: number) => Math.max(4, Math.ceil(max / 10 ** Math.floor(Math.log10(Math.max(max, 1)))) * 10 ** Math.floor(Math.log10(Math.max(max, 1))))]}
              tickFormatter={(v: number) => f.compact(v)}
              tick={{ fill: MUTED, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<DayTooltip />} cursor={{ stroke: MUTED, strokeWidth: 1 }} />
            <Area type="monotone" dataKey="views" stroke="none" fill={VIEWS_COLOR} fillOpacity={0.1} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="views"
              name={t("seriesViews")}
              stroke={VIEWS_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              dot={false}
              activeDot={{ r: 4, fill: VIEWS_COLOR, stroke: SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              name={t("seriesClicks")}
              stroke={CLICKS_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              dot={false}
              activeDot={{ r: 4, fill: CLICKS_COLOR, stroke: SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        {empty && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        )}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-[13px] font-semibold text-muted-foreground hover:text-foreground">
          {t("asTable")}
        </summary>
        <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-line">
          <table className="w-full text-start text-[13px]">
            <thead className="sticky top-0 bg-surface-2 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">{t("day")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("seriesViews")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("seriesClicks")}</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-t border-line">
                  <td className="px-3 py-1.5">{f.day(d.day)}</td>
                  <td className="px-3 py-1.5 text-end tabular-nums">{f.count(d.views)}</td>
                  <td className="px-3 py-1.5 text-end tabular-nums">{f.count(d.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/** Clicks per network: one series, horizontal bars ≤ 24px with the value at the tip. */
export function NetworkChart({ data }: { data: NetworkPoint[] }) {
  const t = useTranslations("Panel.stats");
  const text = useMessageText();
  const f = useChartFormat();
  const rows = data.map((d) => ({ ...d, label: text(platformMeta(d.platform).label) }));
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("networkEmpty")}</p>;
  }
  return (
    <div className="w-full" style={{ height: Math.max(rows.length * 40, 80) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={96} tick={{ fill: MUTED, fontSize: 13 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            content={({ active, payload }) =>
              active && payload?.[0] ? (
                <div className="rounded-md border border-line bg-popover px-3 py-2 text-[13px] shadow-lg">
                  <span className="font-bold">{(payload[0].payload as { label: string }).label}</span>:{" "}
                  <span className="tabular-nums">{t("clicksCount", { count: f.count(Number(payload[0].value)) })}</span>
                </div>
              ) : null
            }
          />
          <Bar dataKey="clicks" fill={VIEWS_COLOR} radius={[0, 4, 4, 0]} maxBarSize={24} isAnimationActive={false}>
            <LabelList dataKey="clicks" position="right" fill="#f5f2fa" fontSize={12} formatter={(v) => f.count(Number(v))} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
