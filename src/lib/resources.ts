import { resources } from '../data/resources';
import { CATEGORIES, CATEGORY_META, type Category, type Resource } from '../data/schema';
import { lookupZip } from './geo';
import { REGION_CITIES } from '../data/region-cities';

const DAY_MS = 86_400_000;
/** Records older than this render a "call ahead" warning. */
export const STALE_AFTER_DAYS = 120;

export function daysSince(iso?: string): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - t) / DAY_MS);
}

export function isStale(iso?: string): boolean {
  return daysSince(iso) > STALE_AFTER_DAYS;
}

export function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** A record is "trusted" if a human confirmed it — samples and pendings are not. */
export function isTrusted(r: Resource): boolean {
  return r.verification.status === 'verified' || r.verification.status === 'partner';
}

/** Everything the client-side search should look at, lower-cased and joined. */
export function searchIndex(r: Resource): string {
  return [
    r.name,
    r.orgType,
    r.city,
    r.address,
    r.eligibility,
    ...(r.cost ?? []),
    ...(r.population ?? []),
    ...r.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export interface ResolvedGeo {
  lat: number;
  lng: number;
  /** 'address' = from a street ZIP. 'city' = approximate city centroid. */
  precision: 'address' | 'city';
}

/**
 * Coordinates for distance sorting.
 *
 * Resolution order:
 *   1. An explicit `geo` pair (hand-verified street coordinates).
 *   2. The ZIP embedded in `address` → ZIP centroid. Street-level.
 *   3. `city` → city centroid. APPROXIMATE — surfaced to the user as such.
 *
 * Returns null for statewide/national resources with no physical location. Distance is
 * meaningless for a helpline, and inventing a pin would mislead someone who then
 * tries to walk there.
 */
export function resolveGeo(r: Resource): ResolvedGeo | null {
  if (r.geo) return { lat: r.geo[0], lng: r.geo[1], precision: 'address' };

  if (r.address) {
    const match = r.address.match(/\b(\d{5})\b/);
    if (match) {
      const zip = lookupZip(match[1]);
      if (zip) return { lat: zip.lat, lng: zip.lng, precision: 'address' };
    }
  }

  if (r.city) {
    const c = REGION_CITIES[r.city.trim()];
    if (c) return { lat: c[0], lng: c[1], precision: 'city' };
  }

  return null;
}

export interface Coverage {
  category: Category;
  label: string;
  total: number;
  trusted: number;
  sample: number;
}

export function coverage(): Coverage[] {
  return CATEGORIES.map((category) => {
    const inCat = resources.filter((r) => r.category === category);
    return {
      category,
      label: CATEGORY_META[category].label,
      total: inCat.length,
      trusted: inCat.filter(isTrusted).length,
      sample: inCat.filter((r) => r.verification.status === 'sample').length,
    };
  });
}

/**
 * The "gaps" report — categories where we do not yet have enough human-verified
 * coverage. This is the to-do list for the volunteer team.
 */
export function gaps(minTrusted = 2): Coverage[] {
  return coverage().filter((c) => c.trusted < minTrusted);
}

export function stats() {
  const trusted = resources.filter(isTrusted).length;
  const sample = resources.filter((r) => r.verification.status === 'sample').length;
  return { total: resources.length, trusted, sample, categories: CATEGORIES.length };
}

/** Sort: trusted first, then by category order, then alphabetically. */
export function sortedResources(): Resource[] {
  const order = new Map(CATEGORIES.map((c, i) => [c, i]));
  return [...resources].sort((a, b) => {
    const t = Number(isTrusted(b)) - Number(isTrusted(a));
    if (t !== 0) return t;
    const c = (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0);
    if (c !== 0) return c;
    return a.name.localeCompare(b.name);
  });
}

export { resources };
