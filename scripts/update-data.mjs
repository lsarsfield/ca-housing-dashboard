#!/usr/bin/env node
/**
 * scripts/update-data.mjs
 *
 * Monthly automated data updater for data/cities.json.
 * Uses the Statistics Canada Web Data Service (WDS) JSON API —
 * no ZIP handling or external dependencies required.
 *
 * Automated fields:
 *   housing_starts_latest, housing_starts_yoy_change_pct  — StatCan Table 34-10-0134-01 (annual CMA)
 *   population, population_growth_yoy_pct                 — StatCan Table 17-10-0148-01 (annual CMA)
 *
 * Fields NOT automated (require CREA board membership or manual research):
 *   benchmark_price, mom/yoy_price_change_pct, sales_to_new_listings_ratio,
 *   months_of_inventory, avg_rent_1br/2br, rent_yoy_change_pct, vacancy_rate_pct
 *   → See scripts/MANUAL_UPDATE.md
 *
 * Run:  node scripts/update-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CITIES_PATH = join(__dirname, '../data/cities.json');
const TODAY = new Date().toISOString().slice(0, 10);
const WDS = 'https://www150.statcan.gc.ca/t1/wds/rest';

// ─── StatCan CMA display name → slug ──────────────────────────────────────────
// Must match memberNameEn values returned by the WDS getCubeMetadata endpoint.
// If StatCan renames a CMA, update the key here.
const CMA_NAME_TO_SLUG = {
  'Toronto, Ontario':                              'toronto',
  'Vancouver, British Columbia':                   'vancouver',
  'Calgary, Alberta':                              'calgary',
  'Edmonton, Alberta':                             'edmonton',
  'Montréal, Quebec':                              'montreal',
  'Ottawa - Gatineau, Ontario part':               'ottawa',
  'Victoria, British Columbia':                    'victoria',
  'Hamilton, Ontario':                             'hamilton',
  'Kitchener - Cambridge - Waterloo, Ontario':     'kitchener-waterloo',
  'Winnipeg, Manitoba':                            'winnipeg',
  'London, Ontario':                               'london',
  'Halifax, Nova Scotia':                          'halifax',
  'Saskatoon, Saskatchewan':                       'saskatoon',
  'Regina, Saskatchewan':                          'regina',
  'Kelowna, British Columbia':                     'kelowna',
  'Abbotsford - Mission, British Columbia':        'abbotsford',
  'Barrie, Ontario':                               'barrie',
  'Guelph, Ontario':                               'guelph',
  'Windsor, Ontario':                              'windsor',
  'Greater Sudbury / Grand Sudbury, Ontario':      'greater-sudbury',
};

// ─── WDS helpers ──────────────────────────────────────────────────────────────
async function wdsGet(path) {
  const url = `${WDS}/${path}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    headers: { 'User-Agent': 'ca-housing-dashboard/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const json = await res.json();
  if (json.status !== 'SUCCESS') throw new Error(`WDS error: ${json.status} for ${url}`);
  return json.object;
}

/**
 * Build a map of { memberNameEn → memberId } for a specific dimension
 * of a StatCan table, by calling getCubeMetadata.
 */
async function getDimensionMembers(tablePid, dimensionPos) {
  const meta = await wdsGet(`getCubeMetadata/${tablePid}`);
  const dim = meta.dimension.find(d => d.dimensionPositionId === dimensionPos);
  if (!dim) throw new Error(`Dimension ${dimensionPos} not found in table ${tablePid}`);
  const map = {};
  for (const m of dim.member) {
    map[m.memberNameEn] = m.memberId;
  }
  return map;
}

/**
 * Fetch the last N data points for a specific coordinate in a table.
 * Returns an array of { refPer, value } sorted newest-first.
 */
async function getSeriesData(tablePid, coord, nPeriods = 3) {
  const data = await wdsGet(`getDataFromCubePidCoordAndLatestNPeriods/${tablePid}/${coord}/${nPeriods}`);
  return (data.vectorDataPoint ?? [])
    .map(p => ({ refPer: p.refPer, value: parseFloat(p.value) }))
    .filter(p => !isNaN(p.value))
    .sort((a, b) => b.refPer.localeCompare(a.refPer));
}

// ─── 1. Housing Starts — Table 34-10-0134-01 (annual, CMA) ───────────────────
//
// Table dimensions:
//   1 = Geography (CMA)
//   2 = Type of dwelling unit  →  we want "Total units"
//   3 = Housing estimates       →  we want "Starts"
//   4 = Year of construction   →  typically just "Total"
//
async function updateHousingStarts(cities) {
  const TABLE = '34100134'; // 8-digit WDS PID for Table 34-10-0134-01
  console.log(`  Table ${TABLE} (CMHC housing starts, annual CMA)`);

  let geoMembers, typeMembers, estMembers;
  try {
    console.log('  Fetching table metadata...');
    [geoMembers, typeMembers, estMembers] = await Promise.all([
      getDimensionMembers(TABLE, 1),
      getDimensionMembers(TABLE, 2),
      getDimensionMembers(TABLE, 3),
    ]);
  } catch (e) {
    console.warn(`  ⚠ Metadata fetch failed: ${e.message} — skipping`);
    return 0;
  }

  // Find member IDs for our dimension filters
  const typeId = typeMembers['Total units'] ?? typeMembers['Total dwelling units'];
  const estId  = estMembers['Starts'] ?? estMembers['Housing starts'];
  if (!typeId || !estId) {
    console.warn(`  ⚠ Could not find "Total units" or "Starts" member. Available:`);
    console.warn(`    Type: ${Object.keys(typeMembers).slice(0, 5).join(', ')}`);
    console.warn(`    Estimates: ${Object.keys(estMembers).slice(0, 5).join(', ')}`);
    return 0;
  }

  // Check 4th dimension (year of construction / type) - usually "Total"
  let dim4Id = 1; // default to member 1 if dimension exists
  try {
    const dim4 = await getDimensionMembers(TABLE, 4);
    dim4Id = Object.values(dim4)[0]; // use first (Total) member
  } catch { /* table may only have 3 dimensions */ }

  let updated = 0;

  for (const [cmaName, slug] of Object.entries(CMA_NAME_TO_SLUG)) {
    const geoId = geoMembers[cmaName];
    if (!geoId) continue; // CMA not in this table

    // Build coordinate: dim1.dim2.dim3[.dim4]
    const coord = dim4Id
      ? `${geoId}.${typeId}.${estId}.${dim4Id}`
      : `${geoId}.${typeId}.${estId}`;

    let series;
    try {
      series = await getSeriesData(TABLE, coord, 3);
    } catch (e) {
      console.warn(`  ⚠ ${cmaName}: ${e.message}`);
      continue;
    }

    if (series.length < 2) continue;

    const latest = series[0].value;
    const prev   = series[1].value;
    const yoy    = +((latest - prev) / prev * 100).toFixed(1);

    const city = cities.find(c => c.slug === slug);
    if (!city) continue;

    city.housing_starts_latest = Math.round(latest);
    city.housing_starts_yoy_change_pct = yoy;
    city.last_updated = TODAY;
    console.log(`  ✓ ${city.name}: ${Math.round(latest).toLocaleString()} starts (${yoy >= 0 ? '+' : ''}${yoy}% YoY)`);
    updated++;
  }

  return updated;
}

// ─── 2. Population Estimates — Table 17-10-0148-01 (annual, CMA) ─────────────
//
// Table dimensions:
//   1 = Geography (CMA)
//   2 = Sex (we want "Both sexes" / "Total")
//
async function updatePopulation(cities) {
  const TABLE = '17100148'; // 8-digit WDS PID for Table 17-10-0148-01
  console.log(`  Table ${TABLE} (StatCan population estimates, annual CMA)`);

  let geoMembers, sexMembers;
  try {
    console.log('  Fetching table metadata...');
    [geoMembers, sexMembers] = await Promise.all([
      getDimensionMembers(TABLE, 1),
      getDimensionMembers(TABLE, 2).catch(() => null), // table may not have sex dimension
    ]);
  } catch (e) {
    console.warn(`  ⚠ Metadata fetch failed: ${e.message} — skipping`);
    return 0;
  }

  // "Both sexes" or just use member 1 if no sex dimension
  const sexId = sexMembers
    ? (sexMembers['Both sexes'] ?? sexMembers['Total'] ?? Object.values(sexMembers)[0])
    : null;

  let updated = 0;

  for (const [cmaName, slug] of Object.entries(CMA_NAME_TO_SLUG)) {
    const geoId = geoMembers[cmaName];
    if (!geoId) continue;

    const coord = sexId ? `${geoId}.${sexId}` : `${geoId}`;

    let series;
    try {
      series = await getSeriesData(TABLE, coord, 3);
    } catch (e) {
      console.warn(`  ⚠ ${cmaName}: ${e.message}`);
      continue;
    }

    if (series.length < 2) continue;

    const latest  = series[0].value;
    const yearAgo = series[1].value;
    const yoy     = +((latest - yearAgo) / yearAgo * 100).toFixed(1);

    const city = cities.find(c => c.slug === slug);
    if (!city) continue;

    city.population = Math.round(latest);
    city.population_growth_yoy_pct = yoy;
    city.last_updated = TODAY;
    console.log(`  ✓ ${city.name}: ${Math.round(latest).toLocaleString()} (${yoy >= 0 ? '+' : ''}${yoy}% YoY)`);
    updated++;
  }

  return updated;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== RelViz Data Updater — ${TODAY} ===\n`);

  const cities = JSON.parse(readFileSync(CITIES_PATH, 'utf8'));
  let totalUpdates = 0;

  console.log('📊 Housing Starts');
  totalUpdates += await updateHousingStarts(cities);

  console.log('\n👥 Population Estimates');
  totalUpdates += await updatePopulation(cities);

  console.log('');
  if (totalUpdates > 0) {
    writeFileSync(CITIES_PATH, JSON.stringify(cities, null, 2) + '\n');
    console.log(`✅ Done — ${totalUpdates} cities updated. cities.json written.`);
  } else {
    console.log('⚠  No updates made — cities.json unchanged.');
    console.log('   If unexpected, check CMA name mapping or StatCan API status.');
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
