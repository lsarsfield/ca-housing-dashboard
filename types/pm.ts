export interface PMTenure {
  slug: string;
  name: string;
  party: string;
  party_colour: string;
  headshot_url: string | null;
  start_date: string;   // ISO date string
  end_date: string | null;
  years_label: string;
}

export interface PMSnapshot {
  pm_slug: string;
  city_slug: string; // "national" or a CityData slug

  price_to_income_start: number | null;
  price_to_income_end: number | null;
  price_to_income_delta: number | null;

  renter_rent_burden_start: number | null;
  renter_rent_burden_end: number | null;
  renter_rent_burden_delta: number | null;

  price_change_pct: number | null;
  rent_change_pct: number | null;
}
