import { getPMTenures, getPMSnapshots } from '@/lib/pm';
import { getAllCities } from '@/lib/cities';
import { PMScorecardClient } from '@/components/PMScorecardClient';

export const metadata = {
  title: 'PM Affordability Scorecard · CAHousing',
  description:
    'See how Canadian housing affordability changed under each federal Prime Minister since 1993.',
};

export default async function PMScorecardPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;

  const tenures = getPMTenures();
  const snapshots = getPMSnapshots();
  const cities = getAllCities();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[28px] font-bold text-[#ececf0] tracking-tight leading-none">
            PM Affordability Scorecard
          </h1>
          <span className="text-[9px] bg-emerald-500/[0.12] text-emerald-500 px-1.5 py-0.5 rounded-sm font-mono tracking-wide">
            REAL DATA
          </span>
        </div>
        <p className="text-sm text-[#6b6b78] leading-relaxed max-w-2xl">
          How housing affordability changed under each federal Prime Minister since 1993. Select a
          geography and metric to rank PMs from worst to best outcome.
        </p>
      </div>

      {/* Interactive scorecard */}
      <PMScorecardClient
        tenures={tenures}
        snapshots={snapshots}
        cities={cities}
        initialCity={city ?? 'national'}
      />
    </div>
  );
}
