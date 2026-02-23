export interface GlossaryEntry {
  label: string;
  plain: string;
  calc?: string;
  interpret: string;
}

export type GlossaryKey =
  | 'benchmark_price'
  | 'mom_price_change_pct'
  | 'yoy_price_change_pct'
  | 'price_3yr_cagr_pct'
  | 'price_to_income_ratio'
  | 'shelter_cost_to_income_pct_est'
  | 'gross_rental_yield_pct'
  | 'price_to_rent_ratio'
  | 'vacancy_rate_pct'
  | 'rent_yoy_change_pct'
  | 'sales_to_new_listings_ratio'
  | 'months_of_inventory'
  | 'population_growth_yoy_pct'
  | 'bubble_score'
  | 'median_household_income'
  | 'average_rent_2br'
  | 'housing_starts_yoy_change_pct'
  | 'rent_to_income_ratio_est'
  | 'median_after_tax_income'
  | 'median_renter_after_tax_income'
  | 'avg_rent_1br'
  | 'renter_rent_burden_pct'
  | 'grocery_burden_pct'
  | 'transport_burden_pct'
  | 'childcare_burden_pct'
  | 'essentials_share_pct'
  | 'dwellings_total'
  | 'households_total'
  | 'people_per_dwelling'
  | 'dwellings_per_1000_people'
  | 'structural_housing_gap_units';

export const GLOSSARY: Record<GlossaryKey, GlossaryEntry> = {
  benchmark_price: {
    label: 'Benchmark Price',
    plain:
      'The typical sale price of a home in this city, blended across all property types using a standardized formula — not skewed by a single large or small sale.',
    calc: 'CREA MLS\u00ae Home Price Index composite benchmark, which adjusts for property mix each month.',
    interpret:
      'Higher = more expensive to buy. Compare against PTI to understand relative affordability.',
  },

  mom_price_change_pct: {
    label: 'Month-over-Month Price Change',
    plain:
      'How much the typical home price moved compared to the previous month, shown as a percentage. It captures the freshest momentum signal.',
    calc: `(This month\u2019s price \u2212 Last month\u2019s price) \u00f7 Last month\u2019s price \u00d7 100`,
    interpret:
      'Above +1% = prices heating up; below \u22121% = prices softening. Single months can be noisy \u2014 watch alongside YoY.',
  },

  yoy_price_change_pct: {
    label: 'Year-over-Year Price Change',
    plain:
      'How much home prices have changed compared to the same month last year \u2014 a smoother, more reliable trend than the monthly figure.',
    calc: `(This month\u2019s price \u2212 Same month last year) \u00f7 Same month last year \u00d7 100`,
    interpret:
      'Above +5% = strong appreciation; below \u22125% = meaningful correction underway. Negative YoY alongside high PTI can signal a cooling overheated market.',
  },

  price_3yr_cagr_pct: {
    label: '3-Year Price CAGR',
    plain:
      'The average annual growth rate of home prices over the past three years \u2014 smooths out short-term noise to show the sustained trend.',
    calc: '(Current price \u00f7 Price 3 years ago)^(1/3) \u2212 1, expressed as a percentage.',
    interpret:
      'Above 8% per year is a key warning sign used in the Bubble Score. Below 3% suggests a flat or slowly declining market.',
  },

  price_to_income_ratio: {
    label: 'Price-to-Income Ratio (PTI)',
    plain: `How many years of a household\u2019s total gross income it would take to buy a typical home outright \u2014 the most widely used single-number affordability measure.`,
    calc: 'Benchmark price \u00f7 Median household income for the city',
    interpret:
      'Under 4\u00d7 = affordable; 4\u20136\u00d7 = stretched; 6\u20138\u00d7 = unaffordable; 8\u00d7+ = severely unaffordable. Vancouver and Toronto both exceed 11\u00d7.',
  },

  shelter_cost_to_income_pct_est: {
    label: 'Shelter Cost / Income',
    plain: `The estimated share of a household\u2019s gross monthly income that would go toward housing costs \u2014 mortgage payment, property taxes, and basic utilities \u2014 if they bought a typical home today.`,
    calc:
      'Assumes 20% down payment, a standard 5-year fixed mortgage rate, and typical property taxes. (Monthly payment \u00f7 Monthly median income) \u00d7 100.',
    interpret:
      'Under 30% = manageable by most standards; 30\u201350% = financially strained; above 50% = critically unaffordable \u2014 homeownership crowds out most other spending.',
  },

  gross_rental_yield_pct: {
    label: 'Gross Rental Yield',
    plain:
      'The yearly rental income from a property as a percentage of its purchase price \u2014 before accounting for expenses like mortgage interest, taxes, insurance, or maintenance.',
    calc: '(Average monthly rent \u00d7 12) \u00f7 Benchmark price \u00d7 100',
    interpret:
      'Above 6% = strong income return relative to price; 4\u20136% = moderate; below 4% = income likely won\u2019t cover financing costs without significant appreciation.',
  },

  price_to_rent_ratio: {
    label: 'Price-to-Rent Ratio',
    plain:
      'How many years of rent it would cost to equal the purchase price \u2014 a quick way to compare whether buying or renting makes more financial sense in a city.',
    calc: 'Benchmark price \u00f7 (Average monthly rent \u00d7 12)',
    interpret:
      'Above 25\u00d7 generally favours renting; 15\u201325\u00d7 is neutral; below 15\u00d7 often favours buying. Toronto and Vancouver exceed 30\u00d7.',
  },

  vacancy_rate_pct: {
    label: 'Vacancy Rate',
    plain:
      'The percentage of rental apartments that are currently sitting empty. A very low vacancy rate means renters have almost no options and landlords hold all the power.',
    calc: 'CMHC Rental Market Survey: empty rental units \u00f7 total rental units \u00d7 100, measured annually.',
    interpret:
      'Below 2% = extremely tight \u2014 expect rising rents and difficult searches; 2\u20134% = balanced; above 4% = softer market, landlords may offer incentives.',
  },

  rent_yoy_change_pct: {
    label: 'Rent Year-over-Year Change',
    plain:
      'How much average asking rent for a two-bedroom apartment has changed over the past year. Rising rents mean renters pay more; falling rents give tenants negotiating power.',
    calc: `(This year\u2019s average 2BR rent \u2212 Last year\u2019s average 2BR rent) \u00f7 Last year\u2019s average 2BR rent \u00d7 100`,
    interpret:
      'Positive = rents are rising (investors benefit, tenants pay more); negative = rents are easing (improves rental affordability, reduces landlord yields).',
  },

  sales_to_new_listings_ratio: {
    label: 'Sales-to-New-Listings Ratio (SNLR)',
    plain:
      'The ratio of homes that sold versus new homes that came up for sale in a given period. It shows whether buyers are competing fiercely or have plenty of choice.',
    calc:
      'Homes sold in the period \u00f7 New listings added in the same period. Often expressed as a percentage or whole number.',
    interpret: `Above 60 = seller\u2019s market \u2014 competition is fierce, prices tend to rise; 40\u201360 = balanced; below 40 = buyer\u2019s market \u2014 buyers can negotiate.`,
  },

  months_of_inventory: {
    label: 'Months of Inventory',
    plain:
      'How many months it would take to sell every home currently listed for sale, at the current pace of buying. A simple measure of whether supply is tight or plentiful.',
    calc: 'Active listings on the market \u00f7 Average monthly sales pace',
    interpret:
      `Under 2 months = very tight \u2014 prices tend to rise quickly; 2\u20134 months = balanced; above 6 months = buyers\u2019 market with ample choice.`,
  },

  population_growth_yoy_pct: {
    label: 'Population Growth (Year-over-Year)',
    plain: `How fast the city\u2019s population is growing compared to last year. Fast-growing cities attract more people who all need somewhere to live, which pushes up prices and rents.`,
    calc:
      '(Current year population \u2212 Prior year population) \u00f7 Prior year population \u00d7 100. Source: Statistics Canada.',
    interpret:
      'Above 2% is high by Canadian standards and typically sustains strong demand for both ownership and rental housing, especially when housing supply can\u2019t keep up.',
  },

  bubble_score: {
    label: 'Bubble Score',
    plain: `A composite 0\u2013100 score measuring how financially stretched a city\u2019s housing market looks across four risk dimensions. Higher = more warning signs.`,
    calc:
      'Weighted sum: Price-to-income ratio (max 35 pts) + 3-year price CAGR (max 25 pts) + low vacancy risk (max 20 pts) + shelter cost burden (max 20 pts).',
    interpret:
      'Under 30 = low risk; 30\u201360 = moderate \u2014 watch closely; 60\u201380 = elevated bubble characteristics; above 80 = multiple high-risk signals firing simultaneously.',
  },

  median_household_income: {
    label: 'Median Household Income',
    plain: `The income level where exactly half of all households in the city earn more and half earn less. It\u2019s the income benchmark used in all affordability calculations here.`,
    calc:
      'Statistics Canada Census and Annual Survey of Households data for the CMA. Represents total income before tax from all sources.',
    interpret:
      'Higher income relative to prices = better affordability. Directly used as the denominator in PTI and Shelter/Income calculations.',
  },

  average_rent_2br: {
    label: 'Average 2-Bedroom Rent',
    plain: `The average monthly rent for a two-bedroom apartment in the city\u2019s purpose-built rental market. Used as the reference point for all yield and rent-affordability calculations.`,
    calc:
      'CMHC Rental Market Survey average for purpose-built rental 2-bedroom units in the Census Metropolitan Area.',
    interpret:
      'Rising rents improve landlord yields but reduce renter affordability. Falling rents ease tenant burden but compress investment returns.',
  },

  housing_starts_yoy_change_pct: {
    label: 'Housing Starts Year-over-Year Change',
    plain:
      'How much new home construction activity has changed compared to last year. Starts represent homes where construction has just begun \u2014 a leading indicator of future supply.',
    calc: `CMHC Housing Starts: (This year\u2019s starts \u2212 Last year\u2019s starts) \u00f7 Last year\u2019s starts \u00d7 100.`,
    interpret:
      'Rising starts = more supply coming, which could ease prices. Falling starts amid high demand = ongoing supply crunch risk.',
  },

  rent_to_income_ratio_est: {
    label: 'Rent-to-Income Ratio',
    plain: `The estimated share of a renter household\u2019s gross income that goes toward paying rent each month. A high ratio means renters are financially squeezed.`,
    calc:
      'Average 2BR monthly rent \u00f7 (Median renter household income \u00f7 12) \u00d7 100. Uses CMHC and StatCan estimates.',
    interpret:
      'Under 30% = manageable; 30\u201340% = strained; above 40% = renters are severely cost-burdened by most policy definitions.',
  },

  median_after_tax_income: {
    label: 'Median After-Tax Income',
    plain: 'The estimated median household income after federal and provincial income tax \u2014 the actual money households have available to spend each month.',
    calc: 'Approximated as 81% of median gross household income.',
    interpret: 'This is the income base used for all burden calculations. A household at the median keeps roughly $5,000\u2013$7,000/month after tax depending on the city.',
  },

  median_renter_after_tax_income: {
    label: 'Median Renter After-Tax Income',
    plain: 'The estimated median after-tax income for renter households \u2014 lower than the city-wide median because renters skew toward younger and lower-income households.',
    calc: 'Approximated as 63% of median gross household income.',
    interpret: 'Used as the denominator in rent burden calculations. A wide gap between this and the city-wide after-tax median signals economic stratification.',
  },

  avg_rent_1br: {
    label: 'Average 1-Bedroom Rent',
    plain: 'The average monthly rent for a one-bedroom apartment.',
    calc: 'Approximated as 75% of average 2BR rent, consistent with CMHC relative pricing.',
    interpret: 'Lower than 2BR but proportionally harder on single-income earners.',
  },

  renter_rent_burden_pct: {
    label: 'Renter Rent Burden',
    plain: "The share of a renter household's after-tax monthly income consumed by average 2-bedroom rent. The primary measure of rental affordability strain.",
    calc: 'Average 2BR monthly rent \u00f7 (Median renter after-tax income \u00f7 12) \u00d7 100.',
    interpret: 'Under 30% = manageable; 30\u201340% = strained; 40\u201345% = severely burdened; above 45% alongside PTI \u2265 8\u00d7 triggers the Housing Crisis signal.',
  },

  grocery_burden_pct: {
    label: 'Grocery Burden',
    plain: 'The share of median after-tax monthly income spent on a standard $800/month grocery basket for a two-person household.',
    calc: '$800 \u00f7 (Median after-tax income \u00f7 12) \u00d7 100.',
    interpret: 'Lower-income cities show higher percentages even though groceries cost roughly the same everywhere \u2014 a fixed cost squeezes tighter budgets more.',
  },

  transport_burden_pct: {
    label: 'Transport Burden',
    plain: 'The share of median after-tax monthly income spent on transportation (blended estimate of car and transit costs).',
    calc: '$500/month \u00f7 (Median after-tax income \u00f7 12) \u00d7 100.',
    interpret: 'Like groceries, transport is near-fixed. Cities with strong public transit may have lower real costs than estimated here.',
  },

  childcare_burden_pct: {
    label: 'Childcare Burden',
    plain:
      'Monthly licensed childcare costs as a percentage of median renter after-tax income. Montréal reflects Québec\'s $10/day subsidized program (~$220/month across ~22 working days).',
    calc: '(Monthly childcare cost × 12) ÷ Median renter after-tax income × 100',
    interpret:
      'Under 10% is manageable; 18%+ may force one parent out of the workforce. Most cities without subsidized care land between 18–25%.',
  },

  dwellings_total: {
    label: 'Total Private Dwellings',
    plain: 'The total count of all private dwellings in the Census Metropolitan Area, including occupied and temporarily unoccupied units.',
    calc: 'Statistics Canada Census of Population 2021.',
    interpret: 'Includes all structural types: detached houses, semi-detached, row houses, and apartments.',
  },

  households_total: {
    label: 'Private Households',
    plain: 'The number of private households — groups of people sharing a private dwelling — in the Census Metropolitan Area.',
    calc: 'Statistics Canada Census of Population 2021.',
    interpret: 'Unlike dwellings (which counts units), households counts occupied groups. The gap between dwellings and households approximates vacant units.',
  },

  people_per_dwelling: {
    label: 'People per Dwelling',
    plain: 'Total CMA population divided by total private dwellings — higher means more people sharing each unit on average.',
    calc: 'Population \u00f7 Total private dwellings.',
    interpret: "Canada's national average is ~2.51. Values above 2.5 often signal a housing shortage; values below 2.2 suggest some slack in supply.",
  },

  dwellings_per_1000_people: {
    label: 'Dwellings per 1,000 People',
    plain: 'How many private dwellings exist for every 1,000 residents. Higher = more housing relative to population.',
    calc: '(Total dwellings \u00f7 Population) \u00d7 1,000.',
    interpret: 'Canadian CMAs typically land between 390\u2013430. Below 380 signals a tight housing stock relative to population.',
  },

  structural_housing_gap_units: {
    label: 'Estimated Structural Housing Gap',
    plain: 'A rough estimate of how many additional dwellings would be needed to reach a benchmark of 2.4 people per dwelling. Positive = shortage; negative = surplus.',
    calc: '(Population \u00f7 2.4 target) \u2212 Total dwellings. The 2.4 target is a modest improvement below Canada\u2019s national CMA average of ~2.51.',
    interpret: 'Intentionally a simple first-order estimate, not a precise forecast. Does not account for unit type mix, affordability, or dwelling condition.',
  },

  essentials_share_pct: {
    label: 'Essentials Share of Income',
    plain: "The total share of a renter household's after-tax income consumed by four essential monthly costs: rent, groceries, transportation, and childcare where applicable.",
    calc: 'Renter rent burden % + Grocery burden % + Transport burden % + Childcare burden % (0 for QC cities with subsidized $10/day care).',
    interpret: 'Under 55% = livable; 55\u201380% = strained; 80%+ = essentials shock. Most Canadian cities exceed 80%, leaving little for savings, healthcare, or debt.',
  },
};
