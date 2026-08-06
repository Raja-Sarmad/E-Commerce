"use client";

import { useId, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type ChartDatum = { label: string; value: number; color?: string };

const barColors = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
];

export function BarChart({
  data,
  height = 200,
  formatValue = (v: number) => String(v),
  className,
}: {
  data: ChartDatum[];
  height?: number;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative grid w-full items-end gap-1.5 sm:gap-2"
        style={{ height }}
        aria-label="Bar chart"
      >
        {data.map((d, i) => {
          const h = Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0.5);
          const color = d.color ?? barColors[i % barColors.length];
          return (
            <div
              key={`${d.label}-${i}`}
              className="group relative flex h-full flex-col justify-end"
            >
              <div
                className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 70%, transparent))`,
                  minHeight: d.value > 0 ? 4 : 2,
                }}
                title={`${d.label}: ${formatValue(d.value)}`}
              />
              <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {formatValue(d.value)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid w-full grid-cols-2 gap-1 sm:flex sm:justify-between">
        {data.map((d, i) => (
          <span
            key={`${d.label}-label-${i}`}
            className="truncate text-center text-xs text-muted-foreground sm:flex-1"
            title={d.label}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export type SeriesPoint = { label: string; value: number };
export type LineSeries = { name: string; color: string; points: SeriesPoint[] };

export function LineChart({
  series,
  height = 240,
  formatValue = (v: number) => String(v),
  className,
}: {
  series: LineSeries[];
  height?: number;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const gradientId = useId().replace(/[:]/g, "");
  const width = 640;
  const plotHeight = 180;
  const padX = 8;
  const padTop = 14;
  const padBottom = 8;

  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const max = Math.max(...allValues, 1);
  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const labelCount = Math.max(labels.length - 1, 1);

  const toX = (i: number) =>
    padX + (i / labelCount) * (width - padX * 2);
  const toY = (v: number) =>
    padTop + (1 - v / max) * (plotHeight - padTop - padBottom);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${plotHeight + 8}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        role="img"
        aria-label="Line chart"
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`${gradientId}-${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {gridLines.map((g) => (
          <line
            key={g}
            x1={padX}
            x2={width - padX}
            y1={toY(g * max)}
            y2={toY(g * max)}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}
        {series.map((s, si) => {
          const path = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.value)}`)
            .join(" ");
          const area = `${path} L ${toX(s.points.length - 1)} ${toY(0)} L ${toX(
            0
          )} ${toY(0)} Z`;
          return (
            <g key={s.name}>
              <path d={area} fill={`url(#${gradientId}-${si})`} />
              <path
                d={path}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.points.map((p, i) => (
                <circle
                  key={`${s.name}-${i}`}
                  cx={toX(i)}
                  cy={toY(p.value)}
                  r="3"
                  fill={s.color}
                  stroke="var(--color-card)"
                  strokeWidth="2"
                >
                  <title>{`${s.name} · ${p.label}: ${formatValue(p.value)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex w-full justify-between">
        {labels.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="text-center text-xs text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
      {series.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-4">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-muted-foreground">{s.name}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DonutChart({
  slices,
  size = 170,
  thickness = 18,
  centerLabel = "Total",
  formatValue = (v: number) => String(v),
  className,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const total = Math.max(
    slices.reduce((sum, s) => sum + s.value, 0),
    1
  );
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;

  return (
    <div className={cn("flex flex-col items-center gap-6 sm:flex-row", className)}>
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Donut chart"
      >
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={thickness}
          />
          {slices.map((slice) => {
            const frac = slice.value / total;
            const dash = frac * circumference;
            const offset = acc * circumference;
            acc += frac;
            return (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              >
                <title>{`${slice.label}: ${formatValue(slice.value)}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            {formatValue(slices.reduce((sum, s) => sum + s.value, 0))}
          </span>
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-2.5">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {slice.label}
            </span>
            <span className="font-semibold text-foreground">
              {formatValue(slice.value)}
            </span>
            <span className="w-12 text-right text-xs text-muted-foreground">
              {Math.round((slice.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h3 className="font-bold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

export function Sparkline({
  points,
  width = 96,
  height = 32,
  color = "var(--color-primary)",
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map(
    (p, i) =>
      `${i * step},${height - 3 - ((p - min) / range) * (height - 6)}`
  );
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
    >
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill={color}
        fillOpacity="0.15"
      />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
