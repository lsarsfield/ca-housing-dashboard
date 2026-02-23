'use client';

import { Tooltip } from './Tooltip';
import { GLOSSARY } from '@/lib/glossary';

interface Props {
  bubbleScore: number;
  cagr: string;
  cagrHigh: boolean;
  rentIncome: number;
}

export function CityInlineStats({ bubbleScore, cagr, cagrHigh, rentIncome }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/[0.06]">
      <div>
        <Tooltip content={GLOSSARY['bubble_score']} showHint>
          <div className="text-[10px] font-medium tracking-wide text-[#6b6b78]">Bubble Score</div>
        </Tooltip>
        <div className="text-xl font-bold text-[#ececf0]">
          {bubbleScore}
          <span className="text-xs text-[#6b6b78]">/100</span>
        </div>
      </div>

      <div>
        <Tooltip content={GLOSSARY['price_3yr_cagr_pct']} showHint>
          <div className="text-[10px] font-medium tracking-wide text-[#6b6b78]">3yr CAGR</div>
        </Tooltip>
        <div
          className="text-xl font-bold tabular-nums"
          style={{ color: cagrHigh ? '#ef4444' : '#ececf0' }}
        >
          {cagr}
        </div>
      </div>

      <div>
        <Tooltip content={GLOSSARY['essentials_share_pct']} showHint>
          <div className="text-[10px] font-medium tracking-wide text-[#6b6b78]">Essentials %</div>
        </Tooltip>
        <div className="text-xl font-bold text-[#ececf0]">{rentIncome}%</div>
      </div>
    </div>
  );
}
