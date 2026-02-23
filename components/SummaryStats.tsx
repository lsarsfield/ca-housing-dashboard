'use client';

import { Tooltip } from './Tooltip';
import { GLOSSARY } from '@/lib/glossary';

interface Props {
  avgPTI: string;
  avgEssentials: string;
  rentSqueezeCount: number;
  livableCount: number;
}

export function SummaryStats({ avgPTI, avgEssentials, rentSqueezeCount, livableCount }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-[#111114] border border-white/[0.06] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <Tooltip content={GLOSSARY['price_to_income_ratio']}>
          <div className="text-[10px] font-medium tracking-wide text-[#6b6b78]">Avg PTI</div>
        </Tooltip>
        <div className="text-[26px] font-bold text-[#ececf0] tabular-nums leading-none mt-1">{avgPTI}×</div>
        <div className="text-[11px] text-[#44444f] mt-0.5">National avg price-to-income</div>
      </div>

      <div className="bg-[#111114] border border-white/[0.06] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <Tooltip content={GLOSSARY['essentials_share_pct']}>
          <div className="text-[10px] font-medium tracking-wide text-[#6b6b78]">Avg Essentials</div>
        </Tooltip>
        <div className="text-[26px] font-bold text-red-400 tabular-nums leading-none mt-1">{avgEssentials}%</div>
        <div className="text-[11px] text-[#44444f] mt-0.5">Avg essential cost burden</div>
      </div>

      <div className="bg-[#111114] border border-white/[0.06] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <Tooltip content={GLOSSARY['renter_rent_burden_pct']}>
          <div className="text-[10px] font-medium tracking-wide text-[#6b6b78]">Rent Squeezed</div>
        </Tooltip>
        <div className="text-[26px] font-bold text-amber-400 tabular-nums leading-none mt-1">{rentSqueezeCount}</div>
        <div className="text-[11px] text-[#44444f] mt-0.5">Cities w/ rent burden ≥ 40%</div>
      </div>

      <div className="bg-[#111114] border border-white/[0.06] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <Tooltip content={GLOSSARY['essentials_share_pct']}>
          <div className="text-[10px] font-medium tracking-wide text-[#6b6b78]">Relatively Livable</div>
        </Tooltip>
        <div className="text-[26px] font-bold text-emerald-400 tabular-nums leading-none mt-1">{livableCount}</div>
        <div className="text-[11px] text-[#44444f] mt-0.5">Cities where essentials &lt; 55%</div>
      </div>
    </div>
  );
}
