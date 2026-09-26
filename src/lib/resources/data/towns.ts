/**
 * Towns used to seed the location picker and to name a detected position.
 *
 * These are approximate town centres, NOT the coordinates of any listing. They exist
 * so the visitor can pick a place by name and so a GPS fix can be described back to
 * them; a listing's own coordinates must be the real geocoded address.
 */

import type { Coordinates, ResourceCategory, TownName } from "../types";

export const PRESET_TOWNS: Record<TownName, Coordinates> = {
  "Cocoa": { lat: 28.3582, lng: -80.7302 },
  "Cocoa Beach": { lat: 28.32, lng: -80.6075 },
  "Daytona Beach": { lat: 29.2108, lng: -81.0228 },
  "DeLand": { lat: 29.0343, lng: -81.3035 },
  "Edgewater": { lat: 28.9886, lng: -80.902 },
  "Melbourne": { lat: 28.0784, lng: -80.6026 },
  "Merritt Island": { lat: 28.5392, lng: -80.672 },
  "Mims": { lat: 28.6653, lng: -80.8481 },
  "Mobile": { lat: 28.7617, lng: -80.8625 },
  "National": { lat: 28.7617, lng: -80.8625 },
  "New Smyrna Beach": { lat: 29.0258, lng: -80.927 },
  "Orlando": { lat: 28.5383, lng: -81.3792 },
  "Ormond Beach": { lat: 29.2858, lng: -81.0559 },
  "Rockledge": { lat: 28.3161, lng: -80.7262 },
  "Scottsmoor": { lat: 28.7617, lng: -80.8625 },
  "Statewide": { lat: 28.7617, lng: -80.8625 },
  "Titusville": { lat: 28.6133, lng: -80.8091 },
  "Viera": { lat: 28.2453, lng: -80.7401 },
  "Winter Garden": { lat: 28.5653, lng: -81.5862 },
};

export const TOWN_NAMES = Object.keys(PRESET_TOWNS) as TownName[];

/**
 * Keys in PRESET_TOWNS that are filter buckets rather than places.
 *
 * All three share Scottsmoor's coordinates, so naming one would tell a visitor standing
 * in Scottsmoor that they are in "Statewide". They exist so the directory can be scoped
 * by reach, and must never be presented as a location.
 */

export const CATEGORIES: Array<"All" | ResourceCategory> = [
  "All",
  "Food Banks",
  "Shelters & Housing",
  "Showers & Hygiene",
  "Churches & Faith-Based",
  "Charity Free Services",
];

export const FILTER_TAGS = [
  "All",
  "No ID Required",
  "Open Residency",
  "Showers",
  "Tech Assistance",
  "Groceries",
  "Hot Meals",
  "Cold Night Shelter",
  "Rent Help",
  "Veterans",
  "North Brevard",
  "Volusia",
  "Orange County",
  "Statewide",
] as const;
