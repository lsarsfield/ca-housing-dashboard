'use client';

import Link from 'next/link';
import type { CityData, HeatmapMetric } from '@/types/city';
import { SignalChip } from './SignalChip';
import { Tooltip } from './Tooltip';
import { GLOSSARY } from '@/lib/glossary';
import { formatCurrency, formatPct, formatRatio } from '@/lib/cities';

const METRIC_FORMAT: Record<HeatmapMetric, (c: CityData) => string> = {
  essentials_share_pct: (c) => `${(c.essentials_share_pct ?? 0).toFixed(0)}%`,
  renter_rent_burden_pct: (c) => `${(c.renter_rent_burden_pct ?? 0).toFixed(0)}%`,
  price_to_income_ratio: (c) => formatRatio(c.price_to_income_ratio),
  mom_price_change_pct: (c) => formatPct(c.mom_price_change_pct, true),
  yoy_price_change_pct: (c) => formatPct(c.yoy_price_change_pct, true),
};

interface Props {
  city: CityData;
  metric: HeatmapMetric;
  bgColor: string; // inline rgb string from scaleColor
}

export function CityTile({ city, metric, bgColor }: Props) {
  const valueStr = METRIC_FORMAT[metric](city);
  const topSignals = city.signals.slice(0, 2);

  return (
    <Link href={`/city/${city.slug}`} className="block group">
      <div
        className="relative rounded-b-xl border border-white/[0.06] p-3.5 cursor-pointer transition-all hover:border-white/[0.12] hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col gap-2 min-h-[110px]"
        style={{ backgroundColor: `color-mix(in srgb, ${bgColor} 14%, #111114)` }}
      >
        {/* Color accent strip */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
          style={{ backgroundColor: bgColor }}
        />

        <div className="flex items-start justify-between gap-1">
          <div>
            <div className="text-sm font-semibold text-[#ececf0] leading-tight">{city.name}</div>
            <div className="text-[10px] text-[#6b6b78] tracking-wide">{city.province}</div>
          </div>
          <div className="text-right">
            <Tooltip content={GLOSSARY[metric]}>
              <div className="text-base font-bold tabular-nums" style={{ color: bgColor }}>
                {valueStr}
              </div>
            </Tooltip>
            <div className="text-[10px] text-[#6b6b78] tabular-nums">
              {formatCurrency(city.benchmark_price)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-auto">
          {topSignals.map((tag) => (
            <SignalChip key={tag} tag={tag} size="xs" />
          ))}
        </div>
      </div>
    </Link>
  );
}
