export type MarketCondition = 'seller' | 'balanced' | 'buyer';

export type SignalTag =
  // Affordability / Bubble Risk
  | 'Severely Unaffordable'
  | 'Unaffordable'
  | 'Stretched'
  | 'Reasonable'
  | 'Bubble Risk'
  // Momentum
  | 'New High'
  | 'New Low'
  | 'Accelerating'
  | 'Cooling Fast'
  // Affordability — Essential Cost
  | 'Housing Crisis'
  | 'Rent Squeeze'
  | 'Essentials Shock'
  | 'Relatively Livable'
  | 'Family-Unfriendly'
  | 'Family-Friendly'
  // Market Structure
  | "Tight Seller's Market"
  | 'Transitioning'
  | "Buyer's Market"
  | 'Supply Crunch Risk'
  | 'Oversupply Risk';

export type SignalCategory = 'danger' | 'warning' | 'success' | 'info';

export interface CityData {
  // Identification
  slug: string;
  name: string;
  province: string;
  geo_uid: string;
  lat: number;
  lon: number;
  last_updated: string;
  population: number;
  population_growth_yoy_pct: number;

  // Price & Momentum
  benchmark_price: number;
  benchmark_price_prev_month: number;
  benchmark_price_prev_year: number;
  mom_price_change_pct: number;
  yoy_price_change_pct: number;
  price_3yr_cagr_pct: number;
  is_price_new_high?: boolean;
  is_price_new_low?: boolean;

  // Affordability / Sustainability
  median_household_income: number;
  price_to_income_ratio: number;
  shelter_cost_to_income_pct_est: number;
  rent_to_income_ratio_est: number;
  bubble_score: number; // 0–100 composite index

  // Essential Cost Burden (affordability pivot)
  median_after_tax_income: number;
  median_renter_after_tax_income?: number;
  avg_rent_1br?: number;
  renter_rent_burden_pct?: number;
  grocery_burden_pct?: number;
  transport_burden_pct?: number;
  childcare_burden_pct?: number | null;
  essentials_share_pct?: number;

  // Rental & Yield
  average_rent_2br: number;
  vacancy_rate_pct: number;
  rent_yoy_change_pct: number;
  price_to_rent_ratio: number;
  gross_rental_yield_pct: number;

  // Market Balance & Supply/Demand
  sales_to_new_listings_ratio: number;
  months_of_inventory: number;
  market_condition: MarketCondition;
  housing_starts_latest: number;
  housing_starts_yoy_change_pct: number;

  // Structural Supply/Demand (Census-based, raw)
  dwellings_total?: number;          // Total private dwellings (StatCan Census 2021)
  households_total?: number;         // Private households (StatCan Census 2021)
  population_5yr_ago?: number;       // Population ~5 years prior (Census 2016)
  dwellings_5yr_ago?: number;        // Dwellings ~5 years prior (Census 2016)
  households_5yr_ago?: number;       // Households ~5 years prior (Census 2016)

  // Structural Supply/Demand (derived at runtime by hydrateCities)
  people_per_dwelling?: number;          // population / dwellings_total
  dwellings_per_1000_people?: number;    // dwellings_total / population * 1000
  structural_housing_gap_units?: number; // units needed to reach TARGET_PEOPLE_PER_DWELLING

  // Computed signals
  signals: SignalTag[];
}

export type HeatmapMetric =
  | 'essentials_share_pct'
  | 'renter_rent_burden_pct'
  | 'price_to_income_ratio'
  | 'mom_price_change_pct'
  | 'yoy_price_change_pct';

export interface HeatmapMetricConfig {
  key: HeatmapMetric;
  label: string;
  format: (v: number) => string;
  // lower = green, higher = red for affordability; inverted for yield
  invertColor: boolean;
  description?: import('@/lib/glossary').GlossaryEntry;
}
