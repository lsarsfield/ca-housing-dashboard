'use client';

import { getSignalCategory } from '@/lib/signals';
import type { SignalTag } from '@/types/city';
import { Tooltip } from './Tooltip';

// Richer descriptions used in the styled tooltip panel
const SIGNAL_DESCRIPTIONS: Partial<Record<SignalTag, { plain: string; interpret: string }>> = {
  'Severely Unaffordable': {
    plain: 'Home prices are more than 8× the median household income, or estimated shelter costs exceed 50% of income — far beyond what most households can comfortably sustain.',
    interpret: 'Signals significant financial strain for buyers. Typically seen in Vancouver and Toronto.',
  },
  Unaffordable: {
    plain: 'Home prices are 6–8× the median household income — high enough that most households would need to stretch significantly to buy.',
    interpret: 'Ownership is possible for dual-income households with savings, but leaves little financial room.',
  },
  Stretched: {
    plain: 'Home prices are 4–6× the median household income — above the traditional "affordable" threshold but not extreme.',
    interpret: 'Buyers can likely qualify but will feel the financial pressure. A wide range of Canadian cities fall here.',
  },
  Reasonable: {
    plain: 'Home prices are less than 4× the median household income — considered affordable by most international standards.',
    interpret: 'Relatively accessible for median-income households. Usually found in Prairie cities and smaller centres.',
  },
  'Bubble Risk': {
    plain: 'Three risk factors are firing simultaneously: high price-to-income ratio (≥ 8×), strong 3-year price growth (≥ 8% annually), and very tight vacancy (< 2%).',
    interpret: 'Does not predict a crash, but signals that prices may be disconnected from income fundamentals.',
  },
  'New High': {
    plain: 'The benchmark price recently reached its highest level in the tracked period.',
    interpret: 'Momentum is strong. Buyers face peak pricing; sellers hold the advantage.',
  },
  'New Low': {
    plain: 'The benchmark price recently fell to its lowest level in the tracked period.',
    interpret: 'Prices are correcting. May represent buying opportunity or signal of continued weakness.',
  },
  Accelerating: {
    plain: 'Prices are rising both month-over-month (> 1%) and year-over-year (> 5%) — momentum is building quickly.',
    interpret: 'Fast-moving markets can overshoot fundamentals. Buyers should act quickly; sellers benefit.',
  },
  'Cooling Fast': {
    plain: 'Prices are falling month-over-month (< −1%) or year-over-year (< −5%) — a meaningful downtrend is underway.',
    interpret: 'May benefit buyers waiting for better entry points. Sellers may need to price competitively.',
  },
  'Housing Crisis': {
    plain: 'Both purchase and rental markets are severely unaffordable simultaneously: PTI ≥ 8× and renter rent burden ≥ 45% of after-tax income. Neither buying nor renting is within reach for median-income households.',
    interpret: 'The most severe affordability classification. Sustained Housing Crisis conditions displace lower-income residents.',
  },
  'Rent Squeeze': {
    plain: 'Renter households spend 40% or more of after-tax income on average 2-bedroom rent — above the severe cost-burden threshold.',
    interpret: 'Little income remains for savings or unexpected expenses. Common in mid-sized cities where rents have risen faster than local incomes.',
  },
  'Essentials Shock': {
    plain: "Rent, groceries, transportation, and childcare together consume 80%+ of a median renter household's after-tax income — leaving under 20% for everything else.",
    interpret: 'Households have almost no financial buffer. Any income disruption or unexpected cost can trigger financial crisis.',
  },
  'Relatively Livable': {
    plain: 'Essential costs consume less than 55% of after-tax income and PTI is below 5× — both renting and eventual ownership are within realistic reach.',
    interpret: 'Rare among tracked cities. Typically Prairie cities where incomes are strong relative to local costs.',
  },
  'Family-Unfriendly': {
    plain: 'Monthly childcare costs consume 18% or more of median after-tax household income — a significant burden on top of housing and living costs.',
    interpret: 'High childcare burden discourages family formation or forces one parent out of the workforce.',
  },
  'Family-Friendly': {
    plain: "Childcare burden is 5% or less of after-tax income, reflecting Quebec's subsidized $10/day licensed childcare program.",
    interpret: "Quebec's $10/day model dramatically reduces the childcare cost component, making family formation more financially viable.",
  },
  "Tight Seller's Market": {
    plain: 'The sales-to-new-listings ratio is ≥ 70 or there are ≤ 2 months of homes available to buy. Demand is clearly outpacing supply.',
    interpret: 'Buyers face competition and often bid above asking price. Properties sell quickly.',
  },
  Transitioning: {
    plain: 'The SNLR is between 40\u201360 \u2014 neither strongly a buyer\u2019s nor seller\u2019s market. Conditions are in flux.',
    interpret: 'Pricing power is shifting. Watch MoM trends to see which direction the market is moving.',
  },
  "Buyer's Market": {
    plain: 'The sales-to-new-listings ratio is ≤ 40 or there are ≥ 6 months of inventory — buyers have plenty of choice and negotiating leverage.',
    interpret: 'Prices tend to soften or stagnate. Buyers can take their time and negotiate more aggressively.',
  },
  'Supply Crunch Risk': {
    plain: 'Population is growing quickly (≥ 2% per year) while housing starts are flat or falling — more people are arriving than new homes being built.',
    interpret: 'Structural supply shortfall is forming. Sustained price and rent pressure is likely.',
  },
  'Oversupply Risk': {
    plain: 'Vacancy is already high (≥ 5%) and new housing starts are still rising — more units are being added to a market that already has empty ones.',
    interpret: 'Rents may stagnate or fall. New construction could weigh on resale prices.',
  },
};

const CATEGORY_CLASSES = {
  danger: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  info: 'bg-white/[0.05] text-[#a1a1aa] ring-1 ring-white/[0.08]',
};

interface Props {
  tag: SignalTag;
  size?: 'sm' | 'xs';
}

export function SignalChip({ tag, size = 'sm' }: Props) {
  const cat = getSignalCategory(tag);
  const cls = CATEGORY_CLASSES[cat];
  const desc = SIGNAL_DESCRIPTIONS[tag];
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  const chip = (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClass} ${cls}`}
    >
      {tag}
    </span>
  );

  if (!desc) return chip;

  return (
    <Tooltip content={{ label: tag, plain: desc.plain, interpret: desc.interpret }}>
      {chip}
    </Tooltip>
  );
}
