import pmTenuresData from '@/data/pm-tenures.json';
import pmSnapshotsData from '@/data/pm-snapshots.json';
import type { PMTenure, PMSnapshot } from '@/types/pm';

export function getPMTenures(): PMTenure[] {
  return pmTenuresData as PMTenure[];
}

export function getPMSnapshots(): PMSnapshot[] {
  return pmSnapshotsData as PMSnapshot[];
}

export function getPMSnapshotsForCity(citySlug: string): PMSnapshot[] {
  return getPMSnapshots().filter((s) => s.city_slug === citySlug);
}
