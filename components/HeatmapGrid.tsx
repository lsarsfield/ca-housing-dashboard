'use client';

import { useState } from 'react';
import type { CityData, HeatmapMetric, HeatmapMetricConfig } from '@/types/city';
import { CityTile } from './CityTile';
import { Tooltip } from './Tooltip';
import { GLOSSARY } from '@/lib/glossary';
import { scaleColor, metricRatio } from '@/lib/colorScale';

const METRICS: HeatmapMetricConfig[] = [
  {
    key: 'essentials_share_pct',
    label: 'Essentials Share',
    format: (v) => `${v.toFixed(0)}%`,
    invertColor: false,
    description: GLOSSARY['essentials_share_pct'],
  },
  {
    key: 'renter_rent_burden_pct',
    label: 'Renter Rent Burden',
    format: (v) => `${v.toFixed(0)}%`,
    invertColor: false,
    description: GLOSSARY['renter_rent_burden_pct'],
  },
  {
    key: 'price_to_income_ratio',
    label: 'Price-to-Income Ratio',
    format: (v) => `${v.toFixed(1)}×`,
    invertColor: false,
    description: GLOSSARY['price_to_income_ratio'],
  },
  {
    key: 'mom_price_change_pct',
    label: 'MoM Price Change',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`,
    invertColor: false,
    description: GLOSSARY['mom_price_change_pct'],
  },
  {
    key: 'yoy_price_change_pct',
    label: 'YoY Price Change',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`,
    invertColor: false,
    description: GLOSSARY['yoy_price_change_pct'],
  },
];

interface Props {
  cities: CityData[];
}

export function HeatmapGrid({ cities }: Props) {
  const [activeMetric, setActiveMetric] = useState<HeatmapMetric>('essentials_share_pct');

  const config = METRICS.find((m) => m.key === activeMetric)!;
  const allValues = cities.map((c) => (c[activeMetric] as number | undefined) ?? 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Metric selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium tracking-wide text-[#6b6b78] mr-2">Color by:</span>
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              activeMetric === m.key
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium'
                : 'border-white/[0.06] bg-[#111114] text-[#6b6b78] hover:border-white/10 hover:text-[#ececf0]'
            }`}
          >
            {m.description ? (
              <Tooltip content={m.description}>
                <span>{m.label}</span>
              </Tooltip>
            ) : (
              m.label
            )}
          </button>
        ))}

        {/* Legend */}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-[#6b6b78]">
          {config.invertColor ? (
            <>
              <span>Low</span>
              <div className="w-16 h-1.5 rounded-full opacity-70" style={{
                background: 'linear-gradient(to right, rgb(220,38,38), rgb(234,179,8), rgb(22,163,74))'
              }} />
              <span>High</span>
            </>
          ) : (
            <>
              <span>Low</span>
              <div className="w-16 h-1.5 rounded-full opacity-70" style={{
                background: 'linear-gradient(to right, rgb(22,163,74), rgb(234,179,8), rgb(220,38,38))'
              }} />
              <span>High</span>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {cities.map((city) => {
          const value = (city[activeMetric] as number | undefined) ?? 0;
          const ratio = metricRatio(value, allValues);
          const bgColor = scaleColor(ratio, config.invertColor);
          return (
            <CityTile
              key={city.slug}
              city={city}
              metric={activeMetric}
              bgColor={bgColor}
            />
          );
        })}
      </div>

      <p className="text-[11px] text-[#44444f] mt-2">
        Click any city tile to view the full affordability dashboard. Signals are
        computed automatically from public aggregate data thresholds.
      </p>
    </div>
  );
}
