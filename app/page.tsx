import { getAllCities } from '@/lib/cities';
import { HeatmapGrid } from '@/components/HeatmapGrid';
import { SummaryStats } from '@/components/SummaryStats';

export default function HomePage() {
  const cities = getAllCities();

  const avgPTI = (cities.reduce((s, c) => s + c.price_to_income_ratio, 0) / cities.length).toFixed(1);
  const avgEssentials = (cities.reduce((s, c) => s + (c.essentials_share_pct ?? 0), 0) / cities.length).toFixed(0);
  const rentSqueezeCount = cities.filter((c) => (c.renter_rent_burden_pct ?? 0) >= 40).length;
  const livableCount = cities.filter((c) => (c.essentials_share_pct ?? 100) < 55 && c.price_to_income_ratio < 5).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-[#ececf0] tracking-tight leading-none">Great Canadian Affordability Dashboard</h1>
        <p className="text-sm text-[#6b6b78] mt-1">
          {cities.length} CMAs · Essential cost burdens computed from public aggregate data
        </p>
      </div>

      <SummaryStats
        avgPTI={avgPTI}
        avgEssentials={avgEssentials}
        rentSqueezeCount={rentSqueezeCount}
        livableCount={livableCount}
      />

      <HeatmapGrid cities={cities} />
    </div>
  );
}
