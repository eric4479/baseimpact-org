/**
 * Types for the resource directory.
 *
 * Split out from the data so the shape of an entry can be read, and changed, without
 * scrolling past 1,500 lines of entries.
 */

export type ResourceCategory =
  | "Food Banks"
  | "Churches & Faith-Based"
  | "Charity Free Services"
  | "Shelters & Housing"
  | "Showers & Hygiene";

export type ResourceCounty = "Brevard" | "Volusia" | "Orange" | "Statewide";

export type TriageNeed = "shelter" | "food" | "travel" | "id_tech";

export type Resource = {
  id: string;
  name: string;
  category: ResourceCategory;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  /**
   * The organization's MAIN website - its homepage, not a deep link.
   *
   * Separate from `serviceUrl` because the two answer different questions. Somebody who
   * wants to know whether an organization is legitimate, or who needs its hours, wants
   * the homepage. Somebody who wants THIS service wants the page describing it. Merging
   * them meant a food-pantry listing pointed at a church homepage with no pantry details,
   * or at a deep page with no way to reach the rest of the organization.
   */
  website?: string;
  /**
   * The page on that site describing the specific service this entry lists.
   *
   * Omitted when the homepage already serves as that page. Kept even when it lives on a
   * different domain than `website` - a program documented on a county site, for example.
   */
  serviceUrl?: string;
  description: string;
  hoursText: string;
  /**
   * Opening ranges keyed by weekday (Sunday 0 … Saturday 6). A day maps to a LIST of
   * ranges because plenty of organizations close over lunch or run a morning and an
   * evening session; collapsing those into one span would show "open" during hours
   * the doors are actually shut.
   */
  schedule: Partial<Record<number, Array<[number, number]>>>;
  tags: string[];
  partnerType: string;
  capacityStatus: string;
  triageCategory: TriageNeed;
  county: ResourceCounty;
  /** ISO date the listing was last checked against the organization's own website. */
  lastVerified?: string;
  /**
   * True when the organization has no public walk-in location, or is a phone-based
   * service. Distance and street directions are meaningless for these entries, so the
   * UI must not present them as a place to travel to.
   */
  mobileOnly?: boolean;
};

export type TownName =
  "Cocoa" |
  "Cocoa Beach" |
  "Daytona Beach" |
  "DeLand" |
  "Edgewater" |
  "Melbourne" |
  "Merritt Island" |
  "Mims" |
  "Mobile" |
  "National" |
  "New Smyrna Beach" |
  "Orlando" |
  "Ormond Beach" |
  "Rockledge" |
  "Scottsmoor" |
  "Statewide" |
  "Titusville" |
  "Viera" |
  "Winter Garden";

export type Coordinates = { lat: number; lng: number };

export type AvailabilityStatus = "OPEN" | "SOON" | "CLOSED" | "UNKNOWN";

export type Availability = {
  status: AvailabilityStatus;
  label: string;
};

export type ProcessedResource = Resource & {
  distanceMiles: number;
  nextAvail: Availability;
};
