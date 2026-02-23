'use client';

interface Props {
  label: string;
  value: number;
  benchmark?: number;
  benchmarkLabel?: string;
  max: number;
  format: (v: number) => string;
  color?: string; // hex or rgb
}

export function MetricBar({ label, value, benchmark, benchmarkLabel, max, format, color = '#22c55e' }: Props) {
  const pct = Math.min(100, (value / max) * 100);
  const benchmarkPct = benchmark != null ? Math.min(100, (benchmark / max) * 100) : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span className="tabular-nums font-medium text-zinc-100">{format(value)}</span>
      </div>
      <div className="relative h-3 bg-zinc-800 rounded overflow-visible">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        {benchmarkPct != null && (
          <div
            className="absolute top-0 h-full w-px bg-zinc-400 opacity-60"
            style={{ left: `${benchmarkPct}%` }}
            title={`${benchmarkLabel ?? 'Benchmark'}: ${format(benchmark!)}`}
          />
        )}
      </div>
      {benchmarkPct != null && (
        <div className="text-[10px] text-zinc-600">
          {benchmarkLabel ?? 'Benchmark'}: {format(benchmark!)}
        </div>
      )}
    </div>
  );
}
