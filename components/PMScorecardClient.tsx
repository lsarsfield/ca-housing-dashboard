'use client';

import { useState } from 'react';
import { Tooltip } from './Tooltip';
import type { PMTenure, PMSnapshot } from '@/types/pm';
import type { CityData } from '@/types/city';

type MetricKey =
  | 'price_to_income_delta'
  | 'renter_rent_burden_delta'
  | 'price_change_pct'
  | 'rent_change_pct';

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  format: (v: number) => string;
  annotate: (snap: PMSnapshot) => string;
  tooltipContent: { label: string; plain: string; calc?: string; interpret: string };
}

const METRICS: MetricConfig[] = [
  {
    key: 'price_to_income_delta',
    label: 'Price-to-Income Change',
    unit: '×',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}×`,
    annotate: (s) =>
      s.price_to_income_start !== null && s.price_to_income_end !== null
        ? `${s.price_to_income_start.toFixed(1)}→${s.price_to_income_end.toFixed(1)}`
        : '',
    tooltipContent: {
      label: 'PTI Change',
      plain:
        'Change in price-to-income ratio over PM tenure. A higher ratio means housing is less affordable relative to incomes.',
      calc: 'PTI end − PTI start',
      interpret: 'Positive = prices outpaced income growth (worse). Negative = affordability improved.',
    },
  },
  {
    key: 'renter_rent_burden_delta',
    label: 'Renter Rent Burden Change',
    unit: 'pp',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}pp`,
    annotate: (s) =>
      s.renter_rent_burden_start !== null && s.renter_rent_burden_end !== null
        ? `${s.renter_rent_burden_start.toFixed(0)}%→${s.renter_rent_burden_end.toFixed(0)}%`
        : '',
    tooltipContent: {
      label: 'Rent Burden Change',
      plain:
        'Change in percentage of median renter after-tax income consumed by average rent. Measured in percentage points.',
      calc: 'Burden end − Burden start (pp)',
      interpret: 'Positive = renters worse off. A rise above 30% is typically considered housing stress.',
    },
  },
  {
    key: 'price_change_pct',
    label: 'Benchmark Price Change',
    unit: '%',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`,
    annotate: () => '',
    tooltipContent: {
      label: 'Price Change',
      plain:
        'Cumulative benchmark home price change (%) from start to end of PM tenure. Does not adjust for inflation.',
      interpret: 'Higher = homes became more expensive, pricing out more buyers.',
    },
  },
  {
    key: 'rent_change_pct',
    label: 'Average Rent Change',
    unit: '%',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`,
    annotate: () => '',
    tooltipContent: {
      label: 'Rent Change',
      plain:
        'Cumulative average rent change (%) from start to end of PM tenure. Does not adjust for inflation.',
      interpret: 'Higher = renting became more costly over the tenure.',
    },
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function buildBarTooltip(
  tenure: PMTenure,
  snap: PMSnapshot | undefined,
  metric: MetricConfig,
  cityLabel: string
): { label: string; plain: string; interpret: string } {
  if (!snap || snap[metric.key] === null) {
    return {
      label: tenure.name,
      plain: `No data available for ${tenure.years_label}. Data is pending or tenure is too recent to measure.`,
      interpret: '',
    };
  }
  const delta = snap[metric.key] as number;
  const direction = delta > 0 ? 'worsened' : delta < 0 ? 'improved' : 'held steady';
  return {
    label: `${tenure.name} · ${tenure.years_label}`,
    plain: `Under ${tenure.name}, the ${metric.label.toLowerCase()} ${direction} by ${metric.format(delta)} ${cityLabel}.`,
    interpret:
      delta > 0
        ? 'Affordability declined during this tenure.'
        : delta < 0
        ? 'Affordability improved during this tenure.'
        : '',
  };
}

interface Props {
  tenures: PMTenure[];
  snapshots: PMSnapshot[];
  cities: CityData[];
  initialCity: string;
}

export function PMScorecardClient({ tenures, snapshots, cities, initialCity }: Props) {
  const [selectedCity, setSelectedCity] = useState(
    initialCity === 'national' || cities.some((c) => c.slug === initialCity) ? initialCity : 'national'
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('price_to_income_delta');

  const metric = METRICS.find((m) => m.key === selectedMetric)!;

  const cityLabel =
    selectedCity === 'national'
      ? 'nationally'
      : `in ${cities.find((c) => c.slug === selectedCity)?.name ?? selectedCity}`;

  // Grab snapshots for the selected geography
  const citySnapshots = snapshots.filter((s) => s.city_slug === selectedCity);

  // Build sorted rows
  type Row = { tenure: PMTenure; snap: PMSnapshot | undefined; delta: number | null };
  const rows: Row[] = tenures.map((tenure) => {
    const snap = citySnapshots.find((s) => s.pm_slug === tenure.slug);
    const delta = (snap?.[metric.key] as number | null | undefined) ?? null;
    return { tenure, snap, delta };
  });

  rows.sort((a, b) => {
    if (a.delta === null && b.delta === null) return 0;
    if (a.delta === null) return 1;
    if (b.delta === null) return -1;
    return Math.abs(b.delta) - Math.abs(a.delta);
  });

  const validAbs = rows.filter((r) => r.delta !== null).map((r) => Math.abs(r.delta!));
  const maxDelta = validAbs.length > 0 ? Math.max(...validAbs) : 1;

  // Select style helpers
  const selectClass =
    'bg-[#111114] border border-white/[0.08] text-[#ececf0] text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500/50 cursor-pointer transition-colors hover:border-white/[0.14]';

  return (
    <div className="flex flex-col gap-5">
      {/* Selectors */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78]">
            Geography
          </label>
          <select
            className={selectClass}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="national">🇨🇦 All Canada (National)</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78]">
            Metric
          </label>
          <select
            className={selectClass}
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as MetricKey)}
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto text-[11px] text-[#6b6b78]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm bg-red-400/70" />
            Worsened
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm bg-emerald-400/70" />
            Improved
          </span>
        </div>
      </div>

      {/* Metric description banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-lg">
        <Tooltip content={metric.tooltipContent} showHint>
          <span className="text-[11px] font-semibold text-[#ececf0]">{metric.label}</span>
        </Tooltip>
        <span className="text-[11px] text-[#6b6b78]">·</span>
        <span className="text-[11px] text-[#6b6b78]">{metric.tooltipContent.plain}</span>
      </div>

      {/* League table */}
      <div className="bg-[#111114] border border-white/[0.06] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
        {/* Table header */}
        <div className="grid grid-cols-[1.5rem_2.5rem_10rem_1fr_7rem] items-center gap-4 px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#44444f]">#</span>
          <span />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#44444f]">Prime Minister</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#44444f]">
            <Tooltip content={metric.tooltipContent}>
              <span className="cursor-help">{metric.label}</span>
            </Tooltip>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#44444f] text-right">
            Delta
          </span>
        </div>

        {/* PM rows */}
        {rows.map(({ tenure, snap, delta }, i) => {
          const barWidthPct = delta !== null ? (Math.abs(delta) / maxDelta) * 100 : 0;
          const isWorse = delta !== null && delta > 0;
          const isImproving = delta !== null && delta < 0;
          const barBg = isWorse
            ? 'rgba(248,113,113,0.75)'
            : isImproving
            ? 'rgba(52,211,153,0.75)'
            : 'rgba(107,107,120,0.5)';
          const deltaTextClass = isWorse
            ? 'text-red-400'
            : isImproving
            ? 'text-emerald-400'
            : 'text-[#44444f]';
          const annotation = snap && delta !== null ? metric.annotate(snap) : '';
          const rankLabel = delta !== null ? i + 1 : '—';
          const initials = getInitials(tenure.name);
          const barTooltip = buildBarTooltip(tenure, snap, metric, cityLabel);

          return (
            <div
              key={tenure.slug}
              className="grid grid-cols-[1.5rem_2.5rem_10rem_1fr_7rem] items-center gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              {/* Rank */}
              <span className="text-[11px] text-[#44444f] tabular-nums text-right">{rankLabel}</span>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold leading-none"
                style={{ backgroundColor: tenure.party_colour + '22', color: tenure.party_colour }}
              >
                {initials}
              </div>

              {/* PM info */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium text-[#ececf0] leading-tight truncate">
                  {tenure.name}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wide border"
                    style={{
                      backgroundColor: tenure.party_colour + '18',
                      color: tenure.party_colour,
                      borderColor: tenure.party_colour + '40',
                    }}
                  >
                    {tenure.party.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-[#44444f]">{tenure.years_label}</span>
                </div>
              </div>

              {/* Bar */}
              <Tooltip content={barTooltip}>
                <div className="w-full flex flex-col gap-1 cursor-help">
                  <div className="w-full h-5 bg-white/[0.04] rounded-sm overflow-hidden">
                    {delta !== null ? (
                      <div
                        className="h-full rounded-sm"
                        style={{ width: `${barWidthPct}%`, backgroundColor: barBg }}
                      />
                    ) : (
                      <div className="h-full flex items-center pl-2">
                        <span className="text-[10px] text-[#44444f] italic">Data pending</span>
                      </div>
                    )}
                  </div>
                  {annotation && (
                    <span className="text-[10px] text-[#44444f] tabular-nums">{annotation}</span>
                  )}
                </div>
              </Tooltip>

              {/* Delta value */}
              <div className="flex items-center justify-end">
                <span className={`text-sm font-bold tabular-nums ${deltaTextClass}`}>
                  {delta !== null ? metric.format(delta) : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-[11px] text-[#44444f] leading-relaxed">
        Deltas reflect the change from a PM&apos;s first to last full year in office. National figures are
        population-weighted CMA averages. Price changes: Teranet–National Bank HPI (housepriceindex.ca).
        Rent changes: CMHC Rental Market Survey (StatCan 34-10-0133-01). Income: StatCan 11-10-0190-01.
        Saskatchewan cities lack Teranet coverage; price metrics show — for those rows.
        PTI anchored to 2024 cities.json estimates; absolute levels are approximate.
      </p>
    </div>
  );
}
