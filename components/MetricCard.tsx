'use client';

import { Tooltip } from './Tooltip';
import type { GlossaryEntry } from '@/lib/glossary';

interface Props {
  label: string;
  value: string;
  sub?: string;
  color?: 'green' | 'red' | 'amber' | 'neutral';
  /** Legacy: plain string — falls back to browser title attribute */
  tooltip?: string;
  /** Preferred: structured entry rendered as styled tooltip panel */
  glossaryEntry?: GlossaryEntry;
}

const COLOR_MAP = {
  green: 'text-emerald-400',
  red: 'text-red-400',
  amber: 'text-amber-400',
  neutral: 'text-[#ececf0]',
};

export function MetricCard({
  label,
  value,
  sub,
  color = 'neutral',
  tooltip,
  glossaryEntry,
}: Props) {
  const labelEl = glossaryEntry ? (
    <Tooltip content={glossaryEntry}>
      <span className="text-[10px] font-medium tracking-wide text-[#6b6b78]">{label}</span>
    </Tooltip>
  ) : (
    <span className="text-[10px] font-medium tracking-wide text-[#6b6b78]" title={tooltip}>
      {label}
    </span>
  );

  return (
    <div className="bg-[#111114] border border-white/[0.06] rounded-lg p-4 flex flex-col gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      {labelEl}
      <span className={`text-[26px] font-bold tabular-nums leading-none ${COLOR_MAP[color]}`}>{value}</span>
      {sub && <span className="text-[11px] text-[#44444f] mt-0.5">{sub}</span>}
    </div>
  );
}
