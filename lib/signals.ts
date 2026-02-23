import type { CityData, SignalTag, SignalCategory } from '@/types/city';

export function computeSignals(city: Omit<CityData, 'signals'>): SignalTag[] {
  const tags: SignalTag[] = [];

  // ── Affordability / Bubble Risk ──────────────────────────────────────────
  if (city.price_to_income_ratio >= 8 || city.shelter_cost_to_income_pct_est >= 50) {
    tags.push('Severely Unaffordable');
  } else if (city.price_to_income_ratio >= 6) {
    tags.push('Unaffordable');
  } else if (city.price_to_income_ratio >= 4) {
    tags.push('Stretched');
  } else {
    tags.push('Reasonable');
  }

  if (
    city.price_to_income_ratio >= 8 &&
    city.price_3yr_cagr_pct >= 8 &&
    city.vacancy_rate_pct < 2
  ) {
    tags.push('Bubble Risk');
  }

  // ── Momentum / Price Action ──────────────────────────────────────────────
  if (city.is_price_new_high) tags.push('New High');
  if (city.is_price_new_low) tags.push('New Low');

  if (city.mom_price_change_pct > 1 && city.yoy_price_change_pct > 5) {
    tags.push('Accelerating');
  }

  if (city.mom_price_change_pct < -1 || city.yoy_price_change_pct < -5) {
    tags.push('Cooling Fast');
  }

  // ── Essential Cost Burden ─────────────────────────────────────────────────
  const rrb = city.renter_rent_burden_pct ?? 0;
  const ess = city.essentials_share_pct ?? 0;
  const cc = city.childcare_burden_pct ?? null;

  if (city.price_to_income_ratio >= 8 && rrb >= 45) {
    tags.push('Housing Crisis');
  } else if (rrb >= 40) {
    tags.push('Rent Squeeze');
  }

  if (ess >= 80) tags.push('Essentials Shock');
  if (ess < 55 && city.price_to_income_ratio < 5) tags.push('Relatively Livable');

  if (cc !== null && cc >= 18) tags.push('Family-Unfriendly');
  if (cc !== null && cc <= 5) tags.push('Family-Friendly');

  // ── Market Structure ─────────────────────────────────────────────────────
  if (city.sales_to_new_listings_ratio >= 70 || city.months_of_inventory <= 2) {
    tags.push("Tight Seller's Market");
  } else if (city.sales_to_new_listings_ratio <= 40 || city.months_of_inventory >= 6) {
    tags.push("Buyer's Market");
  } else if (city.sales_to_new_listings_ratio >= 40 && city.sales_to_new_listings_ratio <= 60) {
    tags.push('Transitioning');
  }

  if (city.population_growth_yoy_pct >= 2 && city.housing_starts_yoy_change_pct <= 0) {
    tags.push('Supply Crunch Risk');
  }

  if (city.vacancy_rate_pct >= 5 && city.housing_starts_yoy_change_pct > 0) {
    tags.push('Oversupply Risk');
  }

  return tags;
}

export function getSignalCategory(tag: SignalTag): SignalCategory {
  const danger: SignalTag[] = [
    'Severely Unaffordable',
    'Bubble Risk',
    'Cooling Fast',
    'New Low',
    "Buyer's Market",
    'Oversupply Risk',
    'Housing Crisis',
    'Essentials Shock',
    'Family-Unfriendly',
  ];
  const success: SignalTag[] = [
    'Reasonable',
    'New High',
    'Accelerating',
    "Tight Seller's Market",
    'Supply Crunch Risk',
    'Relatively Livable',
    'Family-Friendly',
  ];
  const warning: SignalTag[] = ['Unaffordable', 'Stretched', 'Transitioning', 'Rent Squeeze'];

  if (danger.includes(tag)) return 'danger';
  if (success.includes(tag)) return 'success';
  if (warning.includes(tag)) return 'warning';
  return 'info';
}

export function computeBubbleScore(city: Omit<CityData, 'signals' | 'bubble_score'>): number {
  let score = 0;

  // Price-to-income contribution (max 35)
  const ptiScore = Math.min(35, ((city.price_to_income_ratio - 3) / 10) * 35);
  score += Math.max(0, ptiScore);

  // 3yr CAGR contribution (max 25)
  const cagrScore = Math.min(25, (city.price_3yr_cagr_pct / 15) * 25);
  score += Math.max(0, cagrScore);

  // Vacancy rate contribution (max 20): lower vacancy = higher risk
  const vacancyScore = Math.min(20, ((3 - city.vacancy_rate_pct) / 3) * 20);
  score += Math.max(0, vacancyScore);

  // Shelter cost burden contribution (max 20)
  const shelterScore = Math.min(20, ((city.shelter_cost_to_income_pct_est - 25) / 40) * 20);
  score += Math.max(0, shelterScore);

  return Math.round(Math.min(100, Math.max(0, score)));
}
