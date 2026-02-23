import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllCities, getCityBySlug, formatCurrency, formatPct, formatRatio, formatPopulation } from '@/lib/cities';
import { SignalChip } from '@/components/SignalChip';
import { MetricCard } from '@/components/MetricCard';
import { PTIChart, ShelterChart } from '@/components/AffordabilityChart';
import { CityInlineStats } from '@/components/CityInlineStats';
import { SupplyDemandTable } from '@/components/SupplyDemandTable';
import { GLOSSARY } from '@/lib/glossary';
import type { CityData } from '@/types/city';

function ptiColor(pti: number): 'red' | 'amber' | 'green' | 'neutral' {
  if (pti >= 8) return 'red';
  if (pti >= 6) return 'amber';
  if (pti >= 4) return 'neutral';
  return 'green';
}

function shelterColor(pct: number): 'red' | 'amber' | 'green' | 'neutral' {
  if (pct >= 50) return 'red';
  if (pct >= 35) return 'amber';
  return 'green';
}

function yieldColor(y: number): 'red' | 'amber' | 'green' | 'neutral' {
  if (y >= 6) return 'green';
  if (y >= 4) return 'amber';
  return 'red';
}

function essentialsColor(pct: number): 'red' | 'amber' | 'green' | 'neutral' {
  if (pct >= 80) return 'red';
  if (pct >= 55) return 'amber';
  return 'green';
}

function renterBurdenColor(pct: number): 'red' | 'amber' | 'green' | 'neutral' {
  if (pct >= 45) return 'red';
  if (pct >= 35) return 'amber';
  return 'green';
}

function generateAffordabilityNarrative(city: CityData): string {
  const affordLabel =
    city.price_to_income_ratio >= 8
      ? 'Severely Unaffordable'
      : city.price_to_income_ratio >= 6
      ? 'Unaffordable'
      : city.price_to_income_ratio >= 4
      ? 'Stretched'
      : 'Reasonable';

  let text = `${city.name} is classified as ${affordLabel} with a price-to-income ratio of ${formatRatio(city.price_to_income_ratio)} and an estimated shelter cost burden of ${city.shelter_cost_to_income_pct_est}% of median household income.`;

  if (city.essentials_share_pct !== undefined) {
    const essLabel = city.essentials_share_pct >= 80 ? 'an essentials shock — ' : city.essentials_share_pct >= 55 ? 'a strained budget — ' : 'a livable burden — ';
    text += ` Combined essential costs (rent, groceries, transport${city.childcare_burden_pct !== null ? ', childcare' : ''}) consume ${city.essentials_share_pct.toFixed(0)}% of median renter after-tax income, representing ${essLabel}${city.essentials_share_pct >= 80 ? 'almost no financial buffer remains.' : city.essentials_share_pct >= 55 ? 'limited room for savings or unexpected expenses.' : 'households can cover essentials without being financially pinched.'}`;
  }

  if (city.signals.includes('Bubble Risk')) {
    text += ` A Bubble Risk flag is set because prices have compounded at ${formatPct(city.price_3yr_cagr_pct, true)} annually over three years while vacancy sits at ${city.vacancy_rate_pct}%.`;
  }

  if (city.signals.includes('Cooling Fast')) {
    text += ` Prices are cooling, with a year-over-year decline of ${formatPct(city.yoy_price_change_pct)} — suggesting the market may be normalizing from elevated levels.`;
  }

  if (city.signals.includes('Accelerating')) {
    text += ` Price momentum is accelerating, with month-over-month gains of ${formatPct(city.mom_price_change_pct, true)} on top of ${formatPct(city.yoy_price_change_pct, true)} year-over-year appreciation.`;
  }

  return text;
}

function generateRentalMarketNarrative(city: CityData): string {
  const rrb = city.renter_rent_burden_pct ?? 0;
  const burdenLabel = rrb >= 45 ? 'severely burdened' : rrb >= 35 ? 'strained' : 'manageable';

  let text = `Average 2-bedroom rent in ${city.name} is ${formatCurrency(city.average_rent_2br)}/month`;
  if (city.avg_rent_1br) {
    text += ` (1BR: ${formatCurrency(city.avg_rent_1br)}/month)`;
  }
  text += `. Rent has changed ${formatPct(city.rent_yoy_change_pct, true)} year-over-year.`;

  text += ` At ${rrb.toFixed(0)}% of median renter after-tax income, rent burden is ${burdenLabel}.`;

  if (city.vacancy_rate_pct < 2) {
    text += ` Vacancy is extremely tight at ${city.vacancy_rate_pct}%, giving landlords strong pricing power and leaving renters with few alternatives.`;
  } else if (city.vacancy_rate_pct >= 4) {
    text += ` Above-average vacancy (${city.vacancy_rate_pct}%) gives renters more negotiating leverage and may moderate future rent increases.`;
  } else {
    text += ` Vacancy sits at ${city.vacancy_rate_pct}%, a balanced level that provides some choice for renters.`;
  }

  return text;
}

function generateMarketNarrative(city: CityData): string {
  const marketLabel =
    city.market_condition === 'seller'
      ? "a tight seller's market"
      : city.market_condition === 'buyer'
      ? "a buyer's market"
      : 'a balanced market';

  let text = `Despite ${city.price_to_income_ratio >= 8 ? 'high' : 'moderate'} prices, ${city.name} is ${marketLabel} with ${city.months_of_inventory} months of inventory and an SNLR of ${city.sales_to_new_listings_ratio}.`;

  if (city.signals.includes('Supply Crunch Risk')) {
    text += ` Strong population growth (${formatPct(city.population_growth_yoy_pct, true)} YoY) combined with flat or declining housing starts points to a structural supply crunch, which may sustain price pressure.`;
  }

  if (city.signals.includes('Oversupply Risk')) {
    text += ` Rising housing starts against elevated vacancy (${city.vacancy_rate_pct}%) suggests a risk of oversupply forming in this market.`;
  }

  if (city.signals.includes('New High')) {
    text += ` Benchmark prices recently reached a new high.`;
  } else if (city.signals.includes('New Low')) {
    text += ` Benchmark prices recently hit a new multi-month low, signaling a potential trend shift.`;
  }

  return text;
}

export async function generateStaticParams() {
  const cities = getAllCities();
  return cities.map((c) => ({ slug: c.slug }));
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const allCities = getAllCities();
  const nationalAvgPTI = allCities.reduce((s, c) => s + c.price_to_income_ratio, 0) / allCities.length;

  const ess = city.essentials_share_pct ?? 0;
  const rrb = city.renter_rent_burden_pct ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Back link */}
      <Link href="/" className="text-xs text-[#6b6b78] hover:text-[#ececf0] transition-colors flex items-center gap-1">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-[28px] font-bold text-[#ececf0] tracking-tight leading-none">{city.name}</h1>
          <span className="text-sm bg-white/[0.06] text-[#6b6b78] px-2 py-0.5 rounded-md font-mono">
            {city.province}
          </span>
          <span className="text-sm text-[#6b6b78]">
            Pop. {formatPopulation(city.population)} · Updated {city.last_updated}
          </span>
        </div>

        {/* Signals */}
        <div className="flex flex-wrap gap-2">
          {city.signals.map((tag) => (
            <SignalChip key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {/* Section A: Snapshot Cards */}
      <div>
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78] mb-3">Snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="col-span-2">
            <MetricCard
              label="Essentials Share"
              value={`${ess.toFixed(0)}%`}
              sub={`Rent + groceries + transport${city.childcare_burden_pct !== null ? ' + childcare' : ''}`}
              color={essentialsColor(ess)}
              glossaryEntry={GLOSSARY['essentials_share_pct']}
            />
          </div>
          <MetricCard
            label="Renter Rent Burden"
            value={`${rrb.toFixed(0)}%`}
            sub={`Avg 2BR ${formatCurrency(city.average_rent_2br)}/mo`}
            color={renterBurdenColor(rrb)}
            glossaryEntry={GLOSSARY['renter_rent_burden_pct']}
          />
          <MetricCard
            label="Benchmark Price"
            value={formatCurrency(city.benchmark_price)}
            sub={`YoY ${formatPct(city.yoy_price_change_pct, true)}`}
            color={city.yoy_price_change_pct >= 0 ? 'green' : 'red'}
            glossaryEntry={GLOSSARY['benchmark_price']}
          />
          <MetricCard
            label="Price-to-Income"
            value={formatRatio(city.price_to_income_ratio)}
            sub={`Median income: ${formatCurrency(city.median_household_income)}`}
            color={ptiColor(city.price_to_income_ratio)}
            glossaryEntry={GLOSSARY['price_to_income_ratio']}
          />
          <MetricCard
            label="Vacancy Rate"
            value={`${city.vacancy_rate_pct}%`}
            sub={`SNLR: ${city.sales_to_new_listings_ratio}`}
            color={city.vacancy_rate_pct < 2 ? 'red' : city.vacancy_rate_pct >= 4 ? 'green' : 'neutral'}
            glossaryEntry={GLOSSARY['vacancy_rate_pct']}
          />
        </div>
      </div>

      {/* Section B: Affordability & Bubble View */}
      <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78]">
          Affordability &amp; Bubble Risk
        </h2>
        <p className="text-sm text-[#a1a1aa] leading-relaxed">
          {generateAffordabilityNarrative(city)}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] font-medium text-[#6b6b78] mb-2">Price-to-Income vs. Avg</div>
            <PTIChart
              cityName={city.name}
              cityPTI={city.price_to_income_ratio}
              nationalAvgPTI={Math.round(nationalAvgPTI * 10) / 10}
            />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#6b6b78] mb-2">Shelter Cost vs. 30% Rule</div>
            <ShelterChart
              cityName={city.name}
              shelterPct={city.shelter_cost_to_income_pct_est}
            />
          </div>
        </div>
        <CityInlineStats
          bubbleScore={city.bubble_score}
          cagr={formatPct(city.price_3yr_cagr_pct, true)}
          cagrHigh={city.price_3yr_cagr_pct > 8}
          rentIncome={Math.round(ess)}
        />
      </div>

      {/* Section B2: Essential Cost Breakdown */}
      <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78]">
          Essential Cost Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Rent Burden"
            value={`${rrb.toFixed(0)}%`}
            sub="Of renter after-tax income"
            color={renterBurdenColor(rrb)}
            glossaryEntry={GLOSSARY['renter_rent_burden_pct']}
          />
          <MetricCard
            label="Grocery Burden"
            value={`${(city.grocery_burden_pct ?? 0).toFixed(1)}%`}
            sub="$800/mo basket"
            color="neutral"
            glossaryEntry={GLOSSARY['grocery_burden_pct']}
          />
          <MetricCard
            label="Transport Burden"
            value={`${(city.transport_burden_pct ?? 0).toFixed(1)}%`}
            sub="$500/mo blended est."
            color="neutral"
            glossaryEntry={GLOSSARY['transport_burden_pct']}
          />
          <MetricCard
            label="Childcare Burden"
            value={
              city.childcare_burden_pct === null
                ? 'QC $10/day'
                : city.childcare_burden_pct !== undefined
                ? `${(city.childcare_burden_pct as number).toFixed(0)}%`
                : '—'
            }
            sub={city.childcare_burden_pct === null ? 'Subsidized program' : 'Of after-tax income'}
            color={
              city.childcare_burden_pct === null
                ? 'green'
                : city.childcare_burden_pct !== undefined && (city.childcare_burden_pct as number) >= 18
                ? 'red'
                : 'neutral'
            }
          />
        </div>
      </div>

      {/* Section C: Rental Market */}
      <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78]">
          Rental Market
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Avg 2BR Rent"
            value={`${formatCurrency(city.average_rent_2br)}/mo`}
            sub={city.avg_rent_1br ? `1BR: ${formatCurrency(city.avg_rent_1br)}/mo` : undefined}
            glossaryEntry={GLOSSARY['average_rent_2br']}
          />
          <MetricCard
            label="Rent YoY"
            value={formatPct(city.rent_yoy_change_pct, true)}
            sub="Rising = worse for renters"
            color={city.rent_yoy_change_pct > 3 ? 'red' : city.rent_yoy_change_pct < 0 ? 'green' : 'neutral'}
            glossaryEntry={GLOSSARY['rent_yoy_change_pct']}
          />
          <MetricCard
            label="Vacancy"
            value={`${city.vacancy_rate_pct}%`}
            color={city.vacancy_rate_pct < 2 ? 'red' : city.vacancy_rate_pct >= 4 ? 'green' : 'neutral'}
            glossaryEntry={GLOSSARY['vacancy_rate_pct']}
          />
          <MetricCard
            label="Owner Yield"
            value={formatPct(city.gross_rental_yield_pct)}
            sub="Investor metric"
            color={yieldColor(city.gross_rental_yield_pct)}
            glossaryEntry={GLOSSARY['gross_rental_yield_pct']}
          />
        </div>
        <p className="text-sm text-[#a1a1aa] leading-relaxed">{generateRentalMarketNarrative(city)}</p>
      </div>

      {/* Section D: Market Structure & Supply */}
      <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78]">
          Market Structure &amp; Supply
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="SNLR"
            value={`${city.sales_to_new_listings_ratio}`}
            sub={city.market_condition === 'seller' ? 'Seller market' : city.market_condition === 'buyer' ? 'Buyer market' : 'Balanced'}
            color={city.market_condition === 'seller' ? 'red' : city.market_condition === 'buyer' ? 'green' : 'neutral'}
            glossaryEntry={GLOSSARY['sales_to_new_listings_ratio']}
          />
          <MetricCard
            label="Months of Inv."
            value={`${city.months_of_inventory}`}
            sub={city.months_of_inventory <= 2 ? 'Very tight' : city.months_of_inventory >= 6 ? 'Ample supply' : 'Moderate'}
            color={city.months_of_inventory <= 2 ? 'red' : city.months_of_inventory >= 6 ? 'green' : 'neutral'}
            glossaryEntry={GLOSSARY['months_of_inventory']}
          />
          <MetricCard
            label="Starts YoY"
            value={formatPct(city.housing_starts_yoy_change_pct, true)}
            color={city.housing_starts_yoy_change_pct > 0 ? 'green' : 'red'}
            glossaryEntry={GLOSSARY['housing_starts_yoy_change_pct']}
          />
          <MetricCard
            label="Pop. Growth"
            value={formatPct(city.population_growth_yoy_pct, true)}
            color={city.population_growth_yoy_pct >= 2 ? 'amber' : 'neutral'}
            glossaryEntry={GLOSSARY['population_growth_yoy_pct']}
          />
        </div>
        <p className="text-sm text-[#a1a1aa] leading-relaxed">{generateMarketNarrative(city)}</p>
      </div>

      {/* Section E: Population vs Housing */}
      <div>
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b78] mb-3">
          Population vs Housing
        </h2>
        <SupplyDemandTable city={city} />
      </div>

      {/* PM Scorecard crosslink */}
      <Link
        href={`/pm-scorecard?city=${city.slug}`}
        className="flex items-center justify-between bg-[#111114] border border-white/[0.06] rounded-xl px-5 py-4 hover:border-emerald-500/30 hover:bg-white/[0.02] transition-colors group shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[#ececf0] group-hover:text-emerald-400 transition-colors">
            PM Affordability Scorecard
          </span>
          <span className="text-[11px] text-[#6b6b78]">
            See how affordability changed under each Prime Minister in {city.name}
          </span>
        </div>
        <span className="text-[#6b6b78] group-hover:text-emerald-400 transition-colors text-lg leading-none">→</span>
      </Link>

      <div className="text-[11px] text-[#44444f] border-t border-white/[0.06] pt-4">
        Data sourced from CMHC, Statistics Canada, and CREA public aggregate statistics. All metrics
        are city-level aggregates; no user-specific calculations are performed. Last updated:{' '}
        {city.last_updated}.
      </div>
    </div>
  );
}
