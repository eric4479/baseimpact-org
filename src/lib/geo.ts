import { FL_ZIPS } from '../data/fl-zips';

/**
 * Distance helpers.
 *
 * ── PRIVACY DESIGN (RISKS_AND_RECOMMENDATIONS.md R3) ─────────────────────────────────
 * Every function here runs in the browser. A ZIP or a device coordinate is resolved to a
 * centroid locally, distances are computed locally, and nothing is transmitted or stored.
 * "I searched for detox near me" is a health disclosure — it must not leave the tab.
 * ─────────────────────────────────────────────────────────────────────────────────────
 */

const EARTH_RADIUS_MI = 3958.7613;

export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface ZipInfo {
  lat: number;
  lng: number;
  city: string;
}

/** Resolve a 5-digit ZIP to a centroid. Returns null if unknown or not in Florida. */
export function lookupZip(zip: string): ZipInfo | null {
  const key = zip.trim().slice(0, 5);
  if (!/^\d{5}$/.test(key)) return null;
  const hit = FL_ZIPS[key];
  if (!hit) return null;
  return { lat: hit[0], lng: hit[1], city: hit[2] };
}

export function isFloridaZip(zip: string): boolean {
  return lookupZip(zip) !== null;
}

/**
 * "3.2 mi" / "0.4 mi" / "less than 0.1 mi".
 * Deliberately coarse above 10 miles — false precision would imply a confidence we don't have.
 */
export function fmtDistance(miles: number): string {
  if (miles < 0.1) return 'less than 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/**
 * Distance tiers, used for color coding. Distance is a *rough* signal — for someone
 * without a car, transit access matters more than mileage (R3).
 */
export function distanceTier(miles: number): 'near' | 'mid' | 'far' {
  if (miles <= 5) return 'near';
  if (miles <= 15) return 'mid';
  return 'far';
}
