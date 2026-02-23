# Manual Data Update Guide

This guide covers the fields that **cannot be automated** because they require CREA board membership or paid data access. These fields should be updated monthly, around the 20th of each month after all sources have published.

---

## Automated (no action needed)

The GitHub Action handles these automatically on the 20th of each month:

| Field | Source | Cadence |
|---|---|---|
| `housing_starts_latest` | StatCan Table 34-10-0134-01 | Annual (Jan) |
| `housing_starts_yoy_change_pct` | same | Annual (Jan) |
| `population` | StatCan Table 17-10-0148-01 | Annual (Jan) |
| `population_growth_yoy_pct` | same | Annual (Jan) |

---

## Manual — Monthly (~20th of each month)

### 1. Benchmark Prices

**Source:** CREA MLS HPI — [crea.ca/housing-market-stats/canadian-housing-market-stats](https://www.crea.ca/housing-market-stats/canadian-housing-market-stats/)

Each month CREA releases a national stats package. For each city, update:

```json
"benchmark_price": 1065000,
"benchmark_price_prev_month": 1058000,
"benchmark_price_prev_year": 1098000,
"mom_price_change_pct": 0.7,
"yoy_price_change_pct": -3.0,
"price_3yr_cagr_pct": 5.2,
"is_price_new_high": false,
"is_price_new_low": false
```

Derived fields update automatically at runtime from `benchmark_price`:
- `price_to_income_ratio` = `benchmark_price / median_household_income`
- `price_to_rent_ratio` = `benchmark_price / (average_rent_2br × 12)`
- `gross_rental_yield_pct` = `(average_rent_2br × 12) / benchmark_price × 100`
- `bubble_score` = computed in `lib/signals.ts`

### 2. Rent Prices

**Source:** [Rentals.ca National Rent Report](https://rentals.ca/national-rent-report) — published monthly

For each city, update:

```json
"avg_rent_1br": 2175,
"average_rent_2br": 2900,
"rent_yoy_change_pct": 3.2
```

### 3. Market Balance (SNLR, Inventory)

**Source:** Local real estate board monthly stats packages:
- Toronto: [trreb.ca/market-news](https://trreb.ca/market-news)
- Vancouver: [rebgv.org/market-watch](https://www.rebgv.org/market-watch)
- Calgary: [creb.com/market-stats](https://www.creb.com/market-stats)
- Edmonton: [realtorsofedmonton.com](https://www.realtorsofedmonton.com)
- Other CMAs: search `[city] real estate board monthly stats [month]`

For each city, update:

```json
"sales_to_new_listings_ratio": 45,
"months_of_inventory": 3.8,
"market_condition": "balanced"
```

`market_condition` values: `"seller"` (SNLR > 60), `"balanced"` (40–60), `"buyer"` (< 40).

### 4. Vacancy Rate

**Source:** [CMHC Rental Market Report](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market) — published annually in October/November

For each city, update:

```json
"vacancy_rate_pct": 1.4
```

---

## Annual Updates (~January each year)

### 5. Income Data

**Source:** Statistics Canada T1 Family File — [statcan.gc.ca](https://www.statcan.gc.ca/en/subjects-start/income_and_expenditure_accounts/income_wages)

Update when new tax year data is released (typically 18-month lag):

```json
"median_household_income": 92000,
"median_after_tax_income": 74520,
"median_renter_after_tax_income": 57960,
"shelter_cost_to_income_pct_est": 58.0,
"rent_to_income_ratio_est": 38.0
```

Then **recalculate** the burden percentages:
- `renter_rent_burden_pct` = `(average_rent_2br × 12) / median_renter_after_tax_income × 100`
- `grocery_burden_pct` = `(estimated_grocery_monthly × 12) / median_renter_after_tax_income × 100`
- `childcare_burden_pct` = `(childcare_monthly × 12) / median_renter_after_tax_income × 100`
- `essentials_share_pct` = sum of all burden percentages

---

## How to Deploy After Manual Updates

```bash
cd ~/RelViz
git add data/cities.json
git commit -m "data: update prices and market stats $(date +'%Y-%m')"
git push
```

Vercel will detect the push and automatically redeploy the site within ~30 seconds.

---

## `last_updated` Field

Update this field whenever you change any data for a city:

```json
"last_updated": "2026-02-20"
```
