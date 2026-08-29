export type ResourceCategory =
  | "Food Banks"
  | "Churches & Faith-Based"
  | "Charity Free Services"
  | "Shelters & Housing"
  | "Showers & Hygiene";

export type TriageNeed = "shelter" | "food" | "travel" | "id_tech";

export type Resource = {
  id: string;
  name: string;
  category: ResourceCategory;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  description: string;
  hoursText: string;
  schedule: Partial<Record<number, [number, number]>>;
  tags: string[];
  partnerType: string;
  capacityStatus: string;
  triageCategory: TriageNeed;
};

export type TownName = "Scottsmoor" | "Mims" | "Titusville" | "Cocoa" | "Melbourne";

export type Coordinates = { lat: number; lng: number };

export const PRESET_TOWNS: Record<TownName, Coordinates> = {
  Scottsmoor: { lat: 28.7617, lng: -80.8625 },
  Mims: { lat: 28.6653, lng: -80.8481 },
  Titusville: { lat: 28.6133, lng: -80.8091 },
  Cocoa: { lat: 28.3582, lng: -80.7302 },
  Melbourne: { lat: 28.0784, lng: -80.6026 },
};

export const TOWN_NAMES = Object.keys(PRESET_TOWNS) as TownName[];

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
  "North Brevard",
] as const;

export const BREVARD_RESOURCES: Resource[] = [
  {
    id: "res-1",
    name: "North Brevard Food Pantry & Outreach",
    category: "Food Banks",
    address: "4475 S Hopkins Ave, Titusville, FL 32780",
    lat: 28.5724,
    lng: -80.8038,
    phone: "(321) 269-6655",
    description:
      "Emergency grocery assistance, shelf-stable boxes, and a hot lunch program for North Brevard residents.",
    hoursText: "Mon–Fri 9:00 AM – 12:00 PM",
    schedule: { 1: [9, 12], 2: [9, 12], 3: [9, 12], 4: [9, 12], 5: [9, 12] },
    tags: ["No ID Required", "Groceries", "North Brevard", "Emergency Pantry"],
    partnerType: "Verified Non-Profit",
    capacityStatus: "Normal Supply",
    triageCategory: "food",
  },
  {
    id: "res-2",
    name: "St. Gabriel Episcopal Hope Center",
    category: "Churches & Faith-Based",
    address: "414 Pine St, Titusville, FL 32796",
    lat: 28.6133,
    lng: -80.8091,
    phone: "(321) 267-2545",
    description:
      "Weekly hot meals, shower trailer vouchers, and emergency travel assistance gas cards.",
    hoursText: "Tue & Thu 10:00 AM – 1:30 PM",
    schedule: { 2: [10, 13.5], 4: [10, 13.5] },
    tags: ["Hot Meals", "Showers", "Travelers", "No ID Required", "Fuel Cards"],
    partnerType: "Faith Partner",
    capacityStatus: "High Demand",
    triageCategory: "travel",
  },
  {
    id: "res-3",
    name: "Scottsmoor Community Care Hub (Base Impact)",
    category: "Charity Free Services",
    address: "3750 Magoon Ave, Scottsmoor, FL 32775",
    lat: 28.7617,
    lng: -80.8625,
    phone: "(321) 555-0199",
    description:
      "Digital application help, computer access, housing navigation, and hygiene kit distribution.",
    hoursText: "Mon, Wed, Fri 1:00 PM – 5:00 PM",
    schedule: { 1: [13, 17], 3: [13, 17], 5: [13, 17] },
    tags: ["Tech Assistance", "Housing Help", "Job Search", "Hygiene", "North Brevard"],
    partnerType: "Direct Base Impact Station",
    capacityStatus: "Open & Ready",
    triageCategory: "id_tech",
  },
  {
    id: "res-4",
    name: "Central Brevard Sharing Center Shelter",
    category: "Shelters & Housing",
    address: "113 Aurora St, Cocoa, FL 32922",
    lat: 28.3582,
    lng: -80.7302,
    phone: "(321) 631-0306",
    description:
      "Day center, emergency night shelter vouchers, laundry, and social service case management.",
    hoursText: "Mon–Sat 9:00 AM – 3:00 PM",
    schedule: { 1: [9, 15], 2: [9, 15], 3: [9, 15], 4: [9, 15], 5: [9, 15], 6: [9, 15] },
    tags: ["Showers", "Laundry", "Case Management", "Open Residency", "Shelter"],
    partnerType: "Regional Partner",
    capacityStatus: "Limited Beds",
    triageCategory: "shelter",
  },
  {
    id: "res-5",
    name: "Daily Bread Melbourne Day Center",
    category: "Showers & Hygiene",
    address: "815 E Strawbridge Ave, Melbourne, FL 32901",
    lat: 28.0784,
    lng: -80.6026,
    phone: "(321) 723-1060",
    description:
      "Daily hot lunch, showers, mail collection for unhoused neighbors, and healthcare navigation.",
    hoursText: "Daily 11:00 AM – 1:00 PM",
    schedule: {
      0: [11, 13],
      1: [11, 13],
      2: [11, 13],
      3: [11, 13],
      4: [11, 13],
      5: [11, 13],
      6: [11, 13],
    },
    tags: ["Daily Lunch", "Showers", "Mail Service", "Healthcare", "No ID Required"],
    partnerType: "Regional Partner",
    capacityStatus: "Normal Supply",
    triageCategory: "food",
  },
  {
    id: "res-6",
    name: "Mims Community Garden & Produce Pantry",
    category: "Food Banks",
    address: "2470 Kelly Rd, Mims, FL 32754",
    lat: 28.6653,
    lng: -80.8481,
    phone: "(321) 555-0144",
    description:
      "Fresh vegetable distribution from local community gardens and nutrition education workshops.",
    hoursText: "Saturday 8:00 AM – 11:00 AM",
    schedule: { 6: [8, 11] },
    tags: ["Fresh Produce", "Eco-Space", "North Brevard"],
    partnerType: "Grassroots Partner",
    capacityStatus: "Open & Ready",
    triageCategory: "food",
  },
];

export type AvailabilityStatus = "OPEN" | "SOON" | "CLOSED" | "UNKNOWN";

export type Availability = {
  status: AvailabilityStatus;
  label: string;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatTime(decimalTime: number): string {
  const hrs = Math.floor(decimalTime);
  const mins = Math.round((decimalTime - hrs) * 60);
  const period = hrs >= 12 ? "PM" : "AM";
  const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
  const displayMins = mins < 10 ? `0${mins}` : String(mins);
  return `${displayHrs}:${displayMins} ${period}`;
}

export function getNextAvailableInfo(resource: Resource, now = new Date()): Availability {
  const currentDay = now.getDay();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const todayHours = resource.schedule[currentDay];

  if (todayHours && currentHour >= todayHours[0] && currentHour < todayHours[1]) {
    const remainingHours = Math.ceil(todayHours[1] - currentHour);
    return { status: "OPEN", label: `Open now · closes in ~${remainingHours}h` };
  }

  if (todayHours && currentHour < todayHours[0]) {
    return { status: "SOON", label: `Opens today at ${formatTime(todayHours[0])}` };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const checkDay = (currentDay + offset) % 7;
    const hours = resource.schedule[checkDay];
    if (hours) {
      const openTime = formatTime(hours[0]);
      const dayLabel = offset === 1 ? "Tomorrow" : DAY_NAMES[checkDay];
      return { status: "CLOSED", label: `Next: ${dayLabel} at ${openTime}` };
    }
  }

  return { status: "UNKNOWN", label: "Call for schedule" };
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

export type ProcessedResource = Resource & {
  distanceMiles: number;
  nextAvail: Availability;
};

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
  return BREVARD_RESOURCES.map((res) => ({
    ...res,
    distanceMiles: calculateDistanceMiles(origin.lat, origin.lng, res.lat, res.lng),
    nextAvail: getNextAvailableInfo(res),
  }))
    .filter((res) => res.distanceMiles <= maxDistance)
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
  return BREVARD_RESOURCES.filter(
    (res) =>
      res.triageCategory === need ||
      res.tags.some((t) => t.toLowerCase().includes(need.replace("_", " "))),
  );
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mapsHref(address: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}
