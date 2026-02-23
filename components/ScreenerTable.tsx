'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CityData } from '@/types/city';
import { SignalChip } from './SignalChip';
import { Tooltip } from './Tooltip';
import { GLOSSARY } from '@/lib/glossary';
import type { GlossaryEntry } from '@/lib/glossary';
import { formatCurrency, formatPct, formatRatio } from '@/lib/cities';

type SortKey = keyof CityData;
type SortDir = 'asc' | 'desc';

interface Filters {
  maxPTI: number;
  maxEssentials: number;
  market: '' | 'seller' | 'balanced' | 'buyer';
  minYoY: number;
  maxYoY: number;
}

const DEFAULT_FILTERS: Filters = {
  maxPTI: 20,
  maxEssentials: 150,
  market: '',
  minYoY: -20,
  maxYoY: 20,
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-[#44444f]">↕</span>;
  return <span className="ml-1 text-emerald-400">{dir === 'asc' ? '↑' : '↓'}</span>;
}

interface ColDef {
  key: SortKey;
  label: string;
  format: (c: CityData) => string;
  colorFn?: (c: CityData) => string;
  tooltip?: GlossaryEntry;
}

const COLUMNS: ColDef[] = [
  {
    key: 'essentials_share_pct',
    label: 'Essentials',
    format: (c) => `${(c.essentials_share_pct ?? 0).toFixed(0)}%`,
    colorFn: (c) =>
      (c.essentials_share_pct ?? 0) >= 80
        ? 'text-red-400'
        : (c.essentials_share_pct ?? 0) >= 55
        ? 'text-amber-400'
        : 'text-emerald-400',
    tooltip: GLOSSARY['essentials_share_pct'],
  },
  {
    key: 'renter_rent_burden_pct',
    label: 'Rent Burden',
    format: (c) => `${(c.renter_rent_burden_pct ?? 0).toFixed(0)}%`,
    colorFn: (c) =>
      (c.renter_rent_burden_pct ?? 0) >= 45
        ? 'text-red-400'
        : (c.renter_rent_burden_pct ?? 0) >= 35
        ? 'text-amber-400'
        : 'text-emerald-400',
    tooltip: GLOSSARY['renter_rent_burden_pct'],
  },
  {
    key: 'childcare_burden_pct',
    label: 'Childcare',
    format: (c) =>
      c.childcare_burden_pct == null
        ? '—'
        : `${(c.childcare_burden_pct as number).toFixed(1)}%`,
    colorFn: (c) =>
      c.childcare_burden_pct == null
        ? 'text-[#6b6b78]'
        : (c.childcare_burden_pct as number) >= 18
        ? 'text-red-400'
        : (c.childcare_burden_pct as number) < 10
        ? 'text-emerald-400'
        : 'text-[#a1a1aa]',
    tooltip: GLOSSARY['childcare_burden_pct'],
  },
  {
    key: 'benchmark_price',
    label: 'Price',
    format: (c) => formatCurrency(c.benchmark_price),
    tooltip: GLOSSARY['benchmark_price'],
  },
  {
    key: 'mom_price_change_pct',
    label: 'MoM %',
    format: (c) => formatPct(c.mom_price_change_pct, true),
    colorFn: (c) =>
      c.mom_price_change_pct > 0 ? 'text-emerald-400' : c.mom_price_change_pct < 0 ? 'text-red-400' : 'text-[#a1a1aa]',
    tooltip: GLOSSARY['mom_price_change_pct'],
  },
  {
    key: 'yoy_price_change_pct',
    label: 'YoY %',
    format: (c) => formatPct(c.yoy_price_change_pct, true),
    colorFn: (c) =>
      c.yoy_price_change_pct > 0 ? 'text-emerald-400' : c.yoy_price_change_pct < 0 ? 'text-red-400' : 'text-[#a1a1aa]',
    tooltip: GLOSSARY['yoy_price_change_pct'],
  },
  {
    key: 'price_3yr_cagr_pct',
    label: '3Y CAGR',
    format: (c) => formatPct(c.price_3yr_cagr_pct, true),
    tooltip: GLOSSARY['price_3yr_cagr_pct'],
  },
  {
    key: 'price_to_income_ratio',
    label: 'PTI',
    format: (c) => formatRatio(c.price_to_income_ratio),
    colorFn: (c) =>
      c.price_to_income_ratio >= 8
        ? 'text-red-400'
        : c.price_to_income_ratio >= 6
        ? 'text-amber-400'
        : 'text-emerald-400',
    tooltip: GLOSSARY['price_to_income_ratio'],
  },
  {
    key: 'shelter_cost_to_income_pct_est',
    label: 'Shelter/Income',
    format: (c) => formatPct(c.shelter_cost_to_income_pct_est),
    colorFn: (c) =>
      c.shelter_cost_to_income_pct_est >= 50
        ? 'text-red-400'
        : c.shelter_cost_to_income_pct_est >= 35
        ? 'text-amber-400'
        : 'text-emerald-400',
    tooltip: GLOSSARY['shelter_cost_to_income_pct_est'],
  },
  {
    key: 'vacancy_rate_pct',
    label: 'Vacancy',
    format: (c) => formatPct(c.vacancy_rate_pct),
    colorFn: (c) =>
      c.vacancy_rate_pct < 2 ? 'text-red-400' : c.vacancy_rate_pct >= 4 ? 'text-emerald-400' : 'text-[#a1a1aa]',
    tooltip: GLOSSARY['vacancy_rate_pct'],
  },
  {
    key: 'rent_yoy_change_pct',
    label: 'Rent YoY',
    format: (c) => formatPct(c.rent_yoy_change_pct, true),
    tooltip: GLOSSARY['rent_yoy_change_pct'],
  },
  {
    key: 'sales_to_new_listings_ratio',
    label: 'SNLR',
    format: (c) => `${c.sales_to_new_listings_ratio}`,
    colorFn: (c) =>
      c.sales_to_new_listings_ratio >= 70
        ? 'text-red-400'
        : c.sales_to_new_listings_ratio <= 40
        ? 'text-emerald-400'
        : 'text-[#a1a1aa]',
    tooltip: GLOSSARY['sales_to_new_listings_ratio'],
  },
  {
    key: 'months_of_inventory',
    label: 'Months Inv.',
    format: (c) => `${c.months_of_inventory}`,
    tooltip: GLOSSARY['months_of_inventory'],
  },
  {
    key: 'population_growth_yoy_pct',
    label: 'Pop. Growth',
    format: (c) => formatPct(c.population_growth_yoy_pct, true),
    colorFn: (c) => (c.population_growth_yoy_pct >= 2 ? 'text-emerald-400' : 'text-[#a1a1aa]'),
    tooltip: GLOSSARY['population_growth_yoy_pct'],
  },
  {
    key: 'gross_rental_yield_pct',
    label: 'Yield',
    format: (c) => formatPct(c.gross_rental_yield_pct),
    colorFn: (c) =>
      c.gross_rental_yield_pct >= 6
        ? 'text-emerald-400'
        : c.gross_rental_yield_pct >= 4
        ? 'text-amber-400'
        : 'text-red-400',
    tooltip: GLOSSARY['gross_rental_yield_pct'],
  },
  {
    key: 'price_to_rent_ratio',
    label: 'P/Rent',
    format: (c) => formatRatio(c.price_to_rent_ratio),
    tooltip: GLOSSARY['price_to_rent_ratio'],
  },
];

interface Props {
  cities: CityData[];
}

export function ScreenerTable({ cities }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('essentials_share_pct');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const filtered = useMemo(() => {
    return cities.filter((c) => {
      if (c.price_to_income_ratio > filters.maxPTI) return false;
      if ((c.essentials_share_pct ?? 0) > filters.maxEssentials) return false;
      if (filters.market && c.market_condition !== filters.market) return false;
      if (c.yoy_price_change_pct < filters.minYoY) return false;
      if (c.yoy_price_change_pct > filters.maxYoY) return false;
      return true;
    });
  }, [cities, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="bg-[#111114] border border-white/[0.06] rounded-lg p-5 flex flex-wrap gap-5 items-end">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-medium tracking-wide text-[#6b6b78]">
            Max PTI ≤ {filters.maxPTI}×
          </label>
          <input
            type="range"
            min={2}
            max={20}
            step={0.5}
            value={filters.maxPTI}
            onChange={(e) => setFilters((f) => ({ ...f, maxPTI: parseFloat(e.target.value) }))}
            className="accent-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-medium tracking-wide text-[#6b6b78]">
            Max Essentials ≤ {filters.maxEssentials}%
          </label>
          <input
            type="range"
            min={50}
            max={150}
            step={5}
            value={filters.maxEssentials}
            onChange={(e) => setFilters((f) => ({ ...f, maxEssentials: parseFloat(e.target.value) }))}
            className="accent-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium tracking-wide text-[#6b6b78]">Market</label>
          <select
            value={filters.market}
            onChange={(e) => setFilters((f) => ({ ...f, market: e.target.value as Filters['market'] }))}
            className="bg-[#16161a] border border-white/[0.08] rounded-md px-2 py-1 text-sm text-[#ececf0] focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="">All</option>
            <option value="seller">Seller</option>
            <option value="balanced">Balanced</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] font-medium tracking-wide text-[#6b6b78]">
            YoY Price: {filters.minYoY}% to {filters.maxYoY}%
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step={1}
              value={filters.minYoY}
              onChange={(e) => setFilters((f) => ({ ...f, minYoY: parseFloat(e.target.value) }))}
              className="bg-[#16161a] border border-white/[0.08] rounded-md px-2 py-1 text-sm text-[#ececf0] w-16 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
            />
            <span className="text-[#6b6b78] text-sm self-center">—</span>
            <input
              type="number"
              step={1}
              value={filters.maxYoY}
              onChange={(e) => setFilters((f) => ({ ...f, maxYoY: parseFloat(e.target.value) }))}
              className="bg-[#16161a] border border-white/[0.08] rounded-md px-2 py-1 text-sm text-[#ececf0] w-16 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <button
          onClick={() => setFilters(DEFAULT_FILTERS)}
          className="ml-auto text-xs text-[#6b6b78] hover:text-[#ececf0] transition-colors underline"
        >
          Reset
        </button>

        <span className="text-[11px] text-[#6b6b78] self-center">
          {sorted.length} of {cities.length} cities
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
        <table>
          <thead className="bg-[#16161a]">
            <tr>
              <th
                className="px-3 py-2.5 text-[10px] font-medium tracking-wide text-[#6b6b78] text-left cursor-pointer sticky left-0 bg-[#16161a] z-10"
                onClick={() => handleSort('name')}
              >
                City <SortIcon active={sortKey === 'name'} dir={sortDir} />
              </th>
              <th className="px-3 py-2.5 text-[10px] font-medium tracking-wide text-[#6b6b78] text-left">Prov</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key as string}
                  className="px-3 py-2.5 text-[10px] font-medium tracking-wide text-[#6b6b78] cursor-pointer"
                  onClick={() => handleSort(col.key)}
                >
                  {col.tooltip ? (
                    <Tooltip content={col.tooltip}>
                      <span>{col.label}</span>
                    </Tooltip>
                  ) : (
                    col.label
                  )}{' '}
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                </th>
              ))}
              <th className="px-3 py-2.5 text-[10px] font-medium tracking-wide text-[#6b6b78]">Signals</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((city) => (
              <tr
                key={city.slug}
                className="border-t border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer"
                onClick={() => window.location.assign(`/city/${city.slug}`)}
              >
                <td className="px-3 py-2.5 sticky left-0 bg-[#111114] z-10 font-medium text-[#ececf0]">
                  <Link
                    href={`/city/${city.slug}`}
                    className="hover:text-emerald-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {city.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-left text-[#6b6b78]">{city.province}</td>
                {COLUMNS.map((col) => (
                  <td key={col.key as string} className={`px-3 py-2.5 ${col.colorFn?.(city) ?? ''}`}>
                    {col.format(city)}
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {city.signals.slice(0, 2).map((tag) => (
                      <SignalChip key={tag} tag={tag} size="xs" />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
