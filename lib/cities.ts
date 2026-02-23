import type { CityData } from '@/types/city';
import rawCities from '@/data/cities.json';
import { computeSignals } from './signals';

// Target people-per-dwelling used for structural housing gap calculation.
// Canada's national CMA average is ~2.51; 2.4 represents a modest improvement target.
export const TARGET_PEOPLE_PER_DWELLING = 2.4;

// Attach computed signals and derived supply/demand metrics to each city at load time
function hydrateCities(raw: typeof rawCities): CityData[] {
  return (raw as Omit<CityData, 'signals'>[]).map((city) => {
    const hydrated: CityData = {
      ...city,
      signals: computeSignals(city),
    };

    // Derive supply/demand metrics when census dwelling data is present
    if (hydrated.dwellings_total && hydrated.population) {
      hydrated.people_per_dwelling = +(hydrated.population / hydrated.dwellings_total).toFixed(2);
      hydrated.dwellings_per_1000_people = +(hydrated.dwellings_total / hydrated.population * 1000).toFixed(1);
      const targetDwellings = hydrated.population / TARGET_PEOPLE_PER_DWELLING;
      hydrated.structural_housing_gap_units = Math.round(targetDwellings - hydrated.dwellings_total);
    }

    return hydrated;
  });
}

const _cities: CityData[] = hydrateCities(rawCities as never);

export function getAllCities(): CityData[] {
  return _cities;
}

export function getCityBySlug(slug: string): CityData | undefined {
  return _cities.find((c) => c.slug === slug);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString('en-CA')}`;
}

export function formatPct(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatRatio(value: number): string {
  return `${value.toFixed(1)}×`;
}

export function formatPopulation(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}
