/**
 * Behaviour over the listings: availability, distance, filtering, and naming a place.
 *
 * Nothing in here holds data. It is separated from `data/` so the two can be reasoned
 * about, and tested, independently - the logic is the part that can be wrong in a way
 * data cannot, and it is the part a future backend would keep unchanged.
 */

import type {
  Availability,
  Coordinates,
  ProcessedResource,
  Resource,
  TownName,
  TriageNeed,
} from "./types";
import { PRESET_TOWNS, TOWN_NAMES } from "./data/towns";
import { ALL_RESOURCES } from "./data";

const NON_GEOGRAPHIC_TOWNS = new Set<TownName>(["Mobile", "National", "Statewide"]);

/**
 * The real town nearest a coordinate, or null when nothing is close enough.
 *
 * Returning null past `maxMiles` matters: a visitor in the panhandle is 250 miles from
 * the nearest town in this list, and naming "Titusville" there would be a confident
 * wrong answer about where they are standing.
 */
export function nearestTownName(coords: Coordinates, maxMiles = 30): string | null {
  let best: TownName | null = null;
  let bestDist = Infinity;
  for (const name of TOWN_NAMES) {
    if (NON_GEOGRAPHIC_TOWNS.has(name)) continue;
    const d = calculateDistanceMiles(coords.lat, coords.lng, PRESET_TOWNS[name].lat, PRESET_TOWNS[name].lng);
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best !== null && bestDist <= maxMiles ? best : null;
}

export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatTime(decimalTime: number): string {
  const hrs = Math.floor(decimalTime);
  const mins = Math.round((decimalTime - hrs) * 60);
  const period = hrs >= 12 ? "PM" : "AM";
  const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
  const displayMins = mins < 10 ? `0${mins}` : String(mins);
  return `${displayHrs}:${displayMins} ${period}`;
}

/**
 * Availability is derived only from hours the organization publishes.
 *
 * Entries whose hours are unconfirmed carry an empty `schedule`, so they fall through
 * to "Call for schedule" rather than showing an "Open now" badge that may be wrong.
 */
export function getNextAvailableInfo(resource: Resource, now = new Date()): Availability {
  const currentDay = now.getDay();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const today = resource.schedule[currentDay] ?? [];

  for (const [open, close] of today) {
    if (currentHour >= open && currentHour < close) {
      const remaining = Math.ceil(close - currentHour);
      return { status: "OPEN", label: `Open now · closes in ~${remaining}h` };
    }
  }

  const laterToday = today.find(([open]) => currentHour < open);
  if (laterToday) {
    return { status: "SOON", label: `Opens today at ${formatTime(laterToday[0])}` };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const ranges = resource.schedule[(currentDay + offset) % 7];
    if (ranges?.length) {
      const dayLabel = offset === 1 ? "Tomorrow" : DAY_NAMES[(currentDay + offset) % 7];
      return { status: "CLOSED", label: `Next: ${dayLabel} at ${formatTime(ranges[0][0])}` };
    }
  }

  return { status: "UNKNOWN", label: "Call for schedule" };
}

export function processResources(
  origin: Coordinates,
  maxDistance: number,
  options: {
    category: string;
    tag: string;
    query: string;
    onlySaved: boolean;
    savedIds: string[];
    openNow?: boolean;
  },
): ProcessedResource[] {
  const q = options.query.trim().toLowerCase();
  return ALL_RESOURCES.map((res) => ({
    ...res,
    distanceMiles: calculateDistanceMiles(origin.lat, origin.lng, res.lat, res.lng),
    nextAvail: getNextAvailableInfo(res),
  }))
    // Phone-based and mobile entries have no meaningful distance, so the radius
    // filter must not drop them.
    .filter((res) => res.mobileOnly || res.distanceMiles <= maxDistance)
    .filter((res) => {
      if (options.onlySaved && !options.savedIds.includes(res.id)) return false;
      if (options.openNow && res.nextAvail.status !== "OPEN") return false;
      if (options.category !== "All" && res.category !== options.category) return false;
      if (options.tag !== "All" && !res.tags.includes(options.tag)) return false;
      if (!q) return true;
      return (
        res.name.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.address.toLowerCase().includes(q) ||
        res.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const rank = { OPEN: 0, SOON: 1, CLOSED: 2, UNKNOWN: 3 };
      const statusDelta = rank[a.nextAvail.status] - rank[b.nextAvail.status];
      if (statusDelta !== 0) return statusDelta;
      return a.distanceMiles - b.distanceMiles;
    });
}

export function resourcesForTriage(need: TriageNeed): Resource[] {
  return ALL_RESOURCES.filter(
    (res) =>
      res.triageCategory === need ||
      res.tags.some((t) => t.toLowerCase().includes(need.replace("_", " "))),
  );
}
