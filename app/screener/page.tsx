import { getAllCities } from '@/lib/cities';
import { ScreenerTable } from '@/components/ScreenerTable';

export default function ScreenerPage() {
  const cities = getAllCities();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[28px] font-bold text-[#ececf0] tracking-tight leading-none">City Screener</h1>
        <p className="text-sm text-[#6b6b78] mt-1">
          Sort and filter all {cities.length} CMAs by affordability and cost burden. Click a row to open the city
          dashboard.
        </p>
      </div>
      <ScreenerTable cities={cities} />
    </div>
  );
}
