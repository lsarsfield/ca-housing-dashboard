'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PTIChartProps {
  cityName: string;
  cityPTI: number;
  nationalAvgPTI: number;
}

export function PTIChart({ cityName, cityPTI, nationalAvgPTI }: PTIChartProps) {
  const data = [
    { name: cityName, value: cityPTI },
    { name: 'National Avg', value: nationalAvgPTI },
    { name: 'Affordable\nThreshold', value: 4 },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#6b6b78', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#6b6b78', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}×`}
          domain={[0, Math.max(cityPTI, nationalAvgPTI) + 2]}
        />
        <Tooltip
          contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
          labelStyle={{ color: '#ececf0' }}
          formatter={(v) => [`${(v as number).toFixed(1)}×`, 'Price-to-Income']}
        />
        <ReferenceLine y={4} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 2" label={{ value: 'Affordable', fill: '#6b6b78', fontSize: 10 }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                i === 0
                  ? entry.value >= 8
                    ? '#ef4444'
                    : entry.value >= 6
                    ? '#f59e0b'
                    : '#22c55e'
                  : 'rgba(255,255,255,0.08)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ShelterChartProps {
  cityName: string;
  shelterPct: number;
}

export function ShelterChart({ cityName, shelterPct }: ShelterChartProps) {
  const data = [
    { name: cityName, value: shelterPct },
    { name: '30% Rule', value: 30 },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#6b6b78', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#6b6b78', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, Math.max(shelterPct, 30) + 10]}
        />
        <Tooltip
          contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
          formatter={(v) => [`${(v as number).toFixed(0)}%`, 'Shelter Cost / Income']}
        />
        <ReferenceLine y={30} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 2" />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                i === 0
                  ? entry.value >= 50
                    ? '#ef4444'
                    : entry.value >= 35
                    ? '#f59e0b'
                    : '#22c55e'
                  : 'rgba(255,255,255,0.08)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
