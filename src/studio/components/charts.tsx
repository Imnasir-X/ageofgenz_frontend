/**
 * Charts in the shadcn/ui charts style (Recharts underneath), themed by the site's CSS tokens
 * so light and dark mode follow automatically.
 */
import { useId } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtDate } from '../lib/format';

export interface SeriesDef {
  key: string;
  label: string;
  values: (number | null)[];
  /** CSS colour; defaults to the primary token. */
  color?: string;
}

const PRIMARY = 'rgb(var(--primary))';
const MUTED = 'rgb(var(--muted-foreground))';
const GRID = 'rgb(var(--border))';

function TooltipBox({ active, payload, label, format, labelFormat }: {
  active?: boolean;
  payload?: { name?: string; value?: number | null; color?: string; dataKey?: string }[];
  label?: string | number;
  format: (v: number) => string;
  labelFormat: (l: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[9rem] rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">{labelFormat(String(label))}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-[2px]" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-mono tabular-nums">{p.value === null || p.value === undefined ? '–' : format(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ labels, series, format = (v) => v.toLocaleString('en-US'), height = 220 }: {
  labels: string[];
  series: SeriesDef[];
  format?: (v: number) => string;
  height?: number;
}) {
  const gid = useId().replace(/:/g, '');
  const data = labels.map((label, i) => {
    const row: Record<string, string | number | null> = { label };
    series.forEach((s) => (row[s.key] = s.values[i] ?? null));
    return row;
  });
  const summary = series.map((s) => `${s.label}: total ${format(s.values.reduce<number>((a, b) => a + (b ?? 0), 0))}`).join('; ');
  return (
    <figure className="w-full" style={{ height }} aria-label={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -12 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${gid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color ?? PRIMARY} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color ?? PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: MUTED, fontSize: 11 }} tickFormatter={(l: string) => fmtDate(l)} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: MUTED, fontSize: 11 }} width={48} tickFormatter={(v: number) => format(v)} />
          <Tooltip cursor={{ stroke: GRID }} content={<TooltipBox format={format} labelFormat={(l) => fmtDate(l)} />} />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color ?? PRIMARY}
              strokeWidth={2}
              fill={`url(#${gid}-${s.key})`}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </figure>
  );
}

export function HourBars({ hours, highlight, format = (v) => v.toLocaleString('en-US'), height = 180, label }: {
  hours: { hour: number; value: number }[];
  highlight?: number;
  format?: (v: number) => string;
  height?: number;
  label: string;
}) {
  const data = hours.map((h) => ({ label: `${h.hour.toString().padStart(2, '0')}:00`, hour: h.hour, value: h.value }));
  return (
    <figure className="w-full" style={{ height }} aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: MUTED, fontSize: 10 }} interval={2} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: MUTED, fontSize: 11 }} width={44} tickFormatter={(v: number) => format(v)} />
          <Tooltip cursor={{ fill: 'rgb(var(--muted))' }} content={<TooltipBox format={format} labelFormat={(l) => `${l} Asia/Dhaka`} />} />
          <Bar dataKey="value" name="Views" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.hour} fill={d.hour === highlight ? PRIMARY : 'rgb(var(--primary) / 0.35)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}
