#!/usr/bin/env python3
"""
scripts/update-data.py
Monthly automated data updater for data/cities.json.

Uses the Statistics Canada WDS API (two-step):
  1. GET  getFullTableDownloadCSV/{pid}/en  → returns JSON with ZIP URL
  2. GET  that ZIP URL                      → download + extract CSV

Automated fields:
  housing_starts_latest, housing_starts_yoy_change_pct  – StatCan Table 34-10-0134-01 (annual)
  population, population_growth_yoy_pct                 – StatCan Table 17-10-0148-01 (annual)

Fields NOT automated (require CREA membership or manual research):
  benchmark_price, mom/yoy_price_change_pct, SNLR, months_of_inventory,
  avg_rent_1br/2br, rent_yoy_change_pct, vacancy_rate_pct
  → See scripts/MANUAL_UPDATE.md

Run:  python3 scripts/update-data.py
"""

import csv, io, json, sys, zipfile, datetime
import urllib.request
from pathlib import Path
from collections import defaultdict

CITIES_PATH = Path(__file__).parent.parent / "data" / "cities.json"
TODAY = datetime.date.today().isoformat()

# ─── GEO name → slug maps ──────────────────────────────────────────────────────
# Must match exact GEO column values in each StatCan CSV.
# These differ between tables (different naming conventions).

# Table 34-10-0134-01 (housing starts, annual CMA)
STARTS_GEO = {
    "Toronto, Ontario":                                    "toronto",
    "Vancouver, British Columbia":                         "vancouver",
    "Calgary, Alberta":                                    "calgary",
    "Edmonton, Alberta":                                   "edmonton",
    "Montréal, Quebec":                                    "montreal",
    "Ottawa-Gatineau, Ontario part, Ontario/Quebec":       "ottawa",
    "Victoria, British Columbia":                          "victoria",
    "Hamilton, Ontario":                                   "hamilton",
    "Kitchener-Cambridge-Waterloo, Ontario":               "kitchener-waterloo",
    "Winnipeg, Manitoba":                                  "winnipeg",
    "London, Ontario":                                     "london",
    "Halifax, Nova Scotia":                                "halifax",
    "Saskatoon, Saskatchewan":                             "saskatoon",
    "Regina, Saskatchewan":                                "regina",
    "Kelowna, British Columbia":                           "kelowna",
    "Abbotsford-Mission, British Columbia":                "abbotsford",
    "Barrie, Ontario":                                     "barrie",
    "Guelph, Ontario":                                     "guelph",
    "Windsor, Ontario":                                    "windsor",
    "Greater Sudbury, Ontario":                            "greater-sudbury",
}

# Table 17-10-0148-01 (population estimates, annual CMA)
POP_GEO = {
    "Toronto (CMA), Ontario":                              "toronto",
    "Vancouver (CMA), British Columbia":                   "vancouver",
    "Calgary (CMA), Alberta":                              "calgary",
    "Edmonton (CMA), Alberta":                             "edmonton",
    "Montréal (CMA), Quebec":                              "montreal",
    "Ottawa - Gatineau (CMA), Ontario part, Ontario":      "ottawa",
    "Victoria (CMA), British Columbia":                    "victoria",
    "Hamilton (CMA), Ontario":                             "hamilton",
    "Kitchener - Cambridge - Waterloo (CMA), Ontario":     "kitchener-waterloo",
    "Winnipeg (CMA), Manitoba":                            "winnipeg",
    "London (CMA), Ontario":                               "london",
    "Halifax (CMA), Nova Scotia":                          "halifax",
    "Saskatoon (CMA), Saskatchewan":                       "saskatoon",
    "Regina (CMA), Saskatchewan":                          "regina",
    "Kelowna (CMA), British Columbia":                     "kelowna",
    "Abbotsford - Mission (CMA), British Columbia":        "abbotsford",
    "Barrie (CMA), Ontario":                               "barrie",
    "Guelph (CMA), Ontario":                               "guelph",
    "Windsor (CMA), Ontario":                              "windsor",
    "Greater Sudbury (CMA), Ontario":                      "greater-sudbury",
}


def _get(url, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def download_statcan_zip(table_8digit):
    """Two-step download: ask WDS for the ZIP URL, then download it."""
    meta_url = f"https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/{table_8digit}/en"
    print(f"  Requesting download URL for table {table_8digit}...")
    meta = json.loads(_get(meta_url, timeout=30))
    if meta.get("status") != "SUCCESS":
        raise RuntimeError(f"WDS returned: {meta}")
    zip_url = meta["object"]
    print(f"  Downloading {zip_url} ...")
    return _get(zip_url, timeout=180)


def csv_from_zip(zip_bytes, table_8digit):
    """Extract and return the main CSV from a StatCan ZIP (small tables only)."""
    z = zipfile.ZipFile(io.BytesIO(zip_bytes))
    content = z.read(f"{table_8digit}.csv").decode("utf-8-sig")
    return list(csv.DictReader(io.StringIO(content)))


def update_housing_starts(cities_by_slug):
    try:
        zip_bytes = download_statcan_zip("34100134")
        rows = csv_from_zip(zip_bytes, "34100134")
    except Exception as e:
        print(f"  ⚠  Skipping housing starts: {e}")
        return 0

    # Filter for Total units / Housing starts rows
    starts = [r for r in rows
              if r.get("Type of unit") == "Total units"
              and r.get("Housing estimates") == "Housing starts"]

    # Group by GEO, sorted newest-first
    by_geo = defaultdict(list)
    for r in starts:
        by_geo[r["GEO"]].append(r)
    for v in by_geo.values():
        v.sort(key=lambda r: r["REF_DATE"], reverse=True)

    updated = 0
    for geo_name, slug in STARTS_GEO.items():
        geo_rows = by_geo.get(geo_name, [])
        if len(geo_rows) < 2:
            continue
        try:
            latest = float(geo_rows[0]["VALUE"])
            prev   = float(geo_rows[1]["VALUE"])
        except (ValueError, KeyError):
            continue
        if prev == 0:
            continue

        city = cities_by_slug.get(slug)
        if not city:
            continue

        yoy = round((latest - prev) / prev * 100, 1)
        city["housing_starts_latest"]        = round(latest)
        city["housing_starts_yoy_change_pct"] = yoy
        city["last_updated"]                  = TODAY
        print(f"  ✓ {city['name']}: {round(latest):,} starts ({yoy:+.1f}% YoY)")
        updated += 1

    return updated


def update_population(cities_by_slug):
    try:
        zip_bytes = download_statcan_zip("17100148")
    except Exception as e:
        print(f"  ⚠  Skipping population: {e}")
        return 0

    # Stream-parse the large CSV (1.8M rows), keeping only relevant geos + dimensions
    print("  Parsing population CSV (large file — may take a moment)...")
    relevant = set(POP_GEO.keys())
    by_geo = defaultdict(dict)   # geo → {year: population}

    z = zipfile.ZipFile(io.BytesIO(zip_bytes))
    with z.open("17100148.csv") as raw:
        reader = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig"))
        for row in reader:
            geo = row["GEO"]
            if geo not in relevant:
                continue
            if row.get("Gender", "Total - gender") not in ("Total - gender", ""):
                continue
            if row.get("Age group", "All ages") not in ("All ages", ""):
                continue
            try:
                value = float(row["VALUE"])
            except ValueError:
                continue
            by_geo[geo][row["REF_DATE"]] = value

    updated = 0
    for geo_name, slug in POP_GEO.items():
        year_data = by_geo.get(geo_name, {})
        if len(year_data) < 2:
            continue

        years  = sorted(year_data.keys(), reverse=True)
        latest = year_data[years[0]]
        prev   = year_data[years[1]]
        if prev == 0:
            continue

        city = cities_by_slug.get(slug)
        if not city:
            continue

        yoy = round((latest - prev) / prev * 100, 1)
        city["population"]                = round(latest)
        city["population_growth_yoy_pct"] = yoy
        city["last_updated"]              = TODAY
        print(f"  ✓ {city['name']}: {round(latest):,} ({yoy:+.1f}% YoY)")
        updated += 1

    return updated


def main():
    print(f"\n=== RelViz Data Updater — {TODAY} ===\n")

    cities = json.loads(CITIES_PATH.read_text(encoding="utf-8"))
    cities_by_slug = {c["slug"]: c for c in cities}

    total = 0

    print("📊 Housing Starts (StatCan Table 34-10-0134-01)")
    total += update_housing_starts(cities_by_slug)

    print("\n👥 Population Estimates (StatCan Table 17-10-0148-01)")
    total += update_population(cities_by_slug)

    print()
    if total > 0:
        CITIES_PATH.write_text(
            json.dumps(cities, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8"
        )
        print(f"✅ Done — {total} cities updated. cities.json written.")
    else:
        print("⚠  No updates made — cities.json unchanged.")


if __name__ == "__main__":
    main()
