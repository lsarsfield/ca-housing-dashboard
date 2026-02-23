'use client';

import type { CityData } from '@/types/city';
import { Tooltip } from './Tooltip';
import { GLOSSARY } from '@/lib/glossary';
import { TARGET_PEOPLE_PER_DWELLING } from '@/lib/cities';
import { formatCurrency } from '@/lib/cities';
import type { GlossaryEntry } from '@/lib/glossary';

interface Props {
  city: CityData;
}

const POPULATION_TOOLTIP: GlossaryEntry = {
  label: 'Population',
  plain: 'Total Census Metropolitan Area population — the full urban core plus surrounding commuter zone.',
  calc: 'Statistics Canada Census of Population 2021; historical from 2016 Census.',
  interpret: 'CMA population is the most comprehensive measure of housing demand. Rapid growth without matching dwelling construction drives up prices and rents.',
};

function fmtCount(n: number): string {
  return n.toLocaleString('en-CA');
}

function fmtCountShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function fmtChange(now: number, ago: number): { abs: string; pct: string; positive: boolean } {
  const abs = now - ago;
  const pct = (abs / ago) * 100;
  const positive = abs >= 0;
  const sign = positive ? '+' : '';
  return {
    abs: `${sign}${fmtCountShort(Math.round(abs))}`,
    pct: `(${sign}${pct.toFixed(1)}%)`,
    positive,
  };
}

function shieldBadge(gap: number, vacancy: number): { label: string; color: string } | null {
  if (gap > 50000 && vacancy < 2) return { label: 'Severe Shortage', color: 'text-red-400 bg-red-400/10' };
  if (gap > 10000 || vacancy < 2) return { label: 'Structural Shortage', color: 'text-amber-400 bg-amber-400/10' };
  if (gap < -10000) return { label: 'Potential Surplus', color: 'text-emerald-400 bg-emerald-400/10' };
  return { label: 'Roughly Balanced', color: 'text-[#a1a1aa] bg-white/[0.06]' };
}

interface RowData {
  id: string;
  tooltip: GlossaryEntry;
  now: string;
  fiveYrsAgo?: string;
  change?: { abs: string; pct: string; positive: boolean };
  nowColor?: string;
  dimIfNoHistory?: boolean;
}

export function SupplyDemandTable({ city }: Props) {
  // Guard: hide section if no dwelling data
  if (!city.dwellings_total || !city.population) {
    return (
      <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-5 text-sm text-[#6b6b78] italic">
        Population vs Housing data not yet available for {city.name}.
      </div>
    );
  }

  const hasHistory = !!(city.population_5yr_ago || city.dwellings_5yr_ago);

  // --- derive 5-year-ago ratios where possible ---
  const ppd5 =
    city.population_5yr_ago && city.dwellings_5yr_ago
      ? +(city.population_5yr_ago / city.dwellings_5yr_ago).toFixed(2)
      : null;
  const d1k5 =
    city.population_5yr_ago && city.dwellings_5yr_ago
      ? +(city.dwellings_5yr_ago / city.population_5yr_ago * 1000).toFixed(1)
      : null;

  // --- gap badge ---
  const gap = city.structural_housing_gap_units ?? 0;
  const badge = shieldBadge(gap, city.vacancy_rate_pct);

  // --- build rows ---
  const rows: RowData[] = [
    // Population
    {
      id: 'population',
      tooltip: POPULATION_TOOLTIP,
      now: fmtCount(city.population),
      ...(city.population_5yr_ago
        ? {
            fiveYrsAgo: fmtCount(city.population_5yr_ago),
            change: fmtChange(city.population, city.population_5yr_ago),
          }
        : {}),
    },
    // Households (skip if unavailable)
    ...(city.households_total
      ? [
          {
            id: 'households',
            tooltip: GLOSSARY['households_total'],
            now: fmtCount(city.households_total),
            ...(city.households_5yr_ago
              ? {
                  fiveYrsAgo: fmtCount(city.households_5yr_ago),
                  change: fmtChange(city.households_total, city.households_5yr_ago),
                }
              : {}),
          } as RowData,
        ]
      : []),
    // Dwellings
    {
      id: 'dwellings',
      tooltip: GLOSSARY['dwellings_total'],
      now: fmtCount(city.dwellings_total),
      ...(city.dwellings_5yr_ago
        ? {
            fiveYrsAgo: fmtCount(city.dwellings_5yr_ago),
            change: fmtChange(city.dwellings_total, city.dwellings_5yr_ago),
          }
        : {}),
    },
    // People per dwelling
    {
      id: 'ppd',
      tooltip: GLOSSARY['people_per_dwelling'],
      now: `${city.people_per_dwelling?.toFixed(2) ?? '—'}`,
      nowColor: (city.people_per_dwelling ?? 0) > 2.5 ? 'text-amber-400' : 'text-emerald-400',
      ...(ppd5 != null
        ? {
            fiveYrsAgo: `${ppd5.toFixed(2)}`,
            change: (() => {
              const diff = (city.people_per_dwelling ?? 0) - ppd5;
              const sign = diff >= 0 ? '+' : '';
              return { abs: `${sign}${diff.toFixed(2)}`, pct: '', positive: diff <= 0 };
            })(),
          }
        : {}),
    },
    // Dwellings per 1,000 people
    {
      id: 'd1k',
      tooltip: GLOSSARY['dwellings_per_1000_people'],
      now: `${city.dwellings_per_1000_people?.toFixed(1) ?? '—'}`,
      nowColor: (city.dwellings_per_1000_people ?? 0) < 380 ? 'text-amber-400' : 'text-[#ececf0]',
      ...(d1k5 != null
        ? {
            fiveYrsAgo: `${d1k5.toFixed(1)}`,
            change: (() => {
              const diff = (city.dwellings_per_1000_people ?? 0) - d1k5;
              const sign = diff >= 0 ? '+' : '';
              return { abs: `${sign}${diff.toFixed(1)}`, pct: '', positive: diff >= 0 };
            })(),
          }
        : {}),
    },
    // Structural gap
    {
      id: 'gap',
      tooltip: GLOSSARY['structural_housing_gap_units'],
      now:
        city.structural_housing_gap_units != null
          ? `${city.structural_housing_gap_units > 0 ? '+' : ''}${fmtCount(city.structural_housing_gap_units)}`
          : '—',
      nowColor:
        (city.structural_housing_gap_units ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400',
    },
    // Vacancy
    {
      id: 'vacancy',
      tooltip: GLOSSARY['vacancy_rate_pct'],
      now: `${city.vacancy_rate_pct}%`,
      nowColor:
        city.vacancy_rate_pct < 2
          ? 'text-red-400'
          : city.vacancy_rate_pct >= 4
          ? 'text-emerald-400'
          : 'text-[#a1a1aa]',
    },
    // Benchmark price
    {
      id: 'price',
      tooltip: GLOSSARY['benchmark_price'],
      now: `${formatCurrency(city.benchmark_price)}`,
      fiveYrsAgo: undefined,
      change: (() => {
        const sign = city.yoy_price_change_pct >= 0 ? '+' : '';
        return {
          abs: `${sign}${city.yoy_price_change_pct.toFixed(1)}% YoY`,
          pct: '',
          positive: city.yoy_price_change_pct >= 0,
        };
      })(),
    },
    // Avg 2BR rent
    {
      id: 'rent',
      tooltip: GLOSSARY['average_rent_2br'],
      now: `${formatCurrency(city.average_rent_2br)}/mo`,
      fiveYrsAgo: undefined,
      change: (() => {
        const sign = city.rent_yoy_change_pct >= 0 ? '+' : '';
        return {
          abs: `${sign}${city.rent_yoy_change_pct.toFixed(1)}% YoY`,
          pct: '',
          positive: city.rent_yoy_change_pct >= 0,
        };
      })(),
    },
  ];

  const ROW_LABELS: Record<string, string> = {
    population: 'Population',
    households: 'Households',
    dwellings: 'Total Dwellings',
    ppd: `People / Dwelling (target: ${TARGET_PEOPLE_PER_DWELLING})`,
    d1k: 'Dwellings / 1,000 People',
    gap: 'Structural Gap (units)',
    vacancy: 'Vacancy Rate',
    price: 'Benchmark Price',
    rent: 'Avg 2BR Rent',
  };

  return (
    <div className="bg-[#111114] border border-white/[0.06] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78]">
          Population vs Housing Stock
        </h3>
        {badge && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
        )}
        <span className="ml-auto text-[10px] text-[#44444f]">StatCan Census 2021 / 2016</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="px-5 py-2.5 text-left text-[10px] font-medium tracking-wide text-[#6b6b78] w-[45%]">
                Metric
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-medium tracking-wide text-[#6b6b78]">
                Now
              </th>
              {hasHistory && (
                <>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium tracking-wide text-[#6b6b78]">
                    ~5 yrs ago
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium tracking-wide text-[#6b6b78] pr-5">
                    Change
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-white/[0.04] last:border-b-0 ${
                  i % 2 === 0 ? '' : 'bg-white/[0.015]'
                }`}
              >
                {/* Metric label */}
                <td className="px-5 py-2.5">
                  <Tooltip content={row.tooltip}>
                    <span className="text-sm text-[#a1a1aa] cursor-help border-b border-dashed border-white/[0.12] hover:border-white/[0.3] transition-colors">
                      {ROW_LABELS[row.id]}
                    </span>
                  </Tooltip>
                </td>

                {/* Now */}
                <td className={`px-4 py-2.5 text-right text-sm tabular-nums font-medium ${row.nowColor ?? 'text-[#ececf0]'}`}>
                  {row.now}
                </td>

                {/* 5 yrs ago */}
                {hasHistory && (
                  <td className="px-4 py-2.5 text-right text-sm tabular-nums text-[#6b6b78]">
                    {row.fiveYrsAgo ?? '—'}
                  </td>
                )}

                {/* Change */}
                {hasHistory && (
                  <td className="px-4 py-2.5 text-right text-sm tabular-nums pr-5">
                    {row.change ? (
                      <span className={row.change.positive ? 'text-emerald-400' : 'text-red-400'}>
                        {row.change.abs}
                        {row.change.pct ? <span className="text-[10px] ml-1 opacity-70">{row.change.pct}</span> : null}
                      </span>
                    ) : (
                      <span className="text-[#44444f]">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t border-white/[0.04] text-[10px] text-[#44444f]">
        Structural gap assumes {TARGET_PEOPLE_PER_DWELLING} people/dwelling target. Population &amp; dwellings from StatCan 2021 Census; historical from 2016 Census.
      </div>
    </div>
  );
}
