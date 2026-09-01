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
  county: "Brevard" | "Volusia" | "Orange";
};

export type TownName =
  | "Scottsmoor"
  | "Mims"
  | "Titusville"
  | "Cocoa"
  | "Melbourne"
  | "Daytona Beach"
  | "DeLand"
  | "New Smyrna Beach"
  | "Orlando"
  | "Apopka";

export type Coordinates = { lat: number; lng: number };

export const PRESET_TOWNS: Record<TownName, Coordinates> = {
  Scottsmoor: { lat: 28.7617, lng: -80.8625 },
  Mims: { lat: 28.6653, lng: -80.8481 },
  Titusville: { lat: 28.6133, lng: -80.8091 },
  Cocoa: { lat: 28.3582, lng: -80.7302 },
  Melbourne: { lat: 28.0784, lng: -80.6026 },
  "Daytona Beach": { lat: 29.2108, lng: -81.0228 },
  DeLand: { lat: 29.0343, lng: -81.3035 },
  "New Smyrna Beach": { lat: 29.0258, lng: -80.9270 },
  Orlando: { lat: 28.5383, lng: -81.3792 },
  Apopka: { lat: 28.6734, lng: -81.5321 },
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
  "Volusia",
  "Orange County",
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
    county: "Brevard",
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
    county: "Brevard",
  },
  {
    id: "res-3",
    name: "Base Impact",
    category: "Charity Free Services",
    address: "",
    lat: 0,
    lng: 0,
    phone: "",
    description:
      "Digital application help, computer access, housing navigation, and hygiene kit distribution. Not open for walk-in visits — contact us first.",
    hoursText: "By appointment only",
    schedule: {},
    tags: ["Tech Assistance", "Housing Help", "Job Search", "Hygiene", "North Brevard"],
    partnerType: "Direct Base Impact Station",
    capacityStatus: "Contact for availability",
    triageCategory: "id_tech",
    county: "Brevard",
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
    county: "Brevard",
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
    county: "Brevard",
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
    county: "Brevard",
  },
  {
    id: "res-7",
    name: "South Brevard Sharing Center",
    category: "Food Banks",
    address: "6525 N Harbor City Blvd, Melbourne, FL 32940",
    lat: 28.0881,
    lng: -80.6156,
    phone: "(321) 727-2226",
    description:
      "Food pantry, emergency financial assistance for rent and utilities, and clothing for South Brevard families.",
    hoursText: "Mon, Wed, Fri 9:00 AM – 12:00 PM",
    schedule: { 1: [9, 12], 3: [9, 12], 5: [9, 12] },
    tags: ["Groceries", "Clothing", "Rent Help", "South Brevard"],
    partnerType: "Verified Non-Profit",
    capacityStatus: "Normal Supply",
    triageCategory: "food",
    county: "Brevard",
  },
  {
    id: "res-8",
    name: "The Rock Church of Mims",
    category: "Churches & Faith-Based",
    address: "2710 US-1, Mims, FL 32754",
    lat: 28.6691,
    lng: -80.8495,
    phone: "(321) 267-5719",
    description:
      "Community food pantry, pastoral care, and connection to local services. Call for current hours and availability.",
    hoursText: "Call for hours",
    schedule: {},
    tags: ["Food", "Pastoral Care", "North Brevard", "Faith-Based"],
    partnerType: "Faith Partner",
    capacityStatus: "Call for availability",
    triageCategory: "food",
    county: "Brevard",
  },
];

const VOLUSIA_RESOURCES: Resource[] = [
  {
    id: "vol-1",
    name: "Second Harvest Food Bank of Central Florida — Volusia Branch",
    category: "Food Banks",
    address: "3650 Cypress Ridge Blvd, DeLand, FL 32724",
    lat: 29.0343,
    lng: -81.3035,
    phone: "(407) 295-5009",
    description:
      "Regional food bank serving Volusia County. Call for distribution sites, pantry hours, and weekend assistance.",
    hoursText: "Call for distribution times",
    schedule: {},
    tags: ["Groceries", "Family Food", "Volusia", "Weekend Help"],
    partnerType: "Regional Food Bank",
    capacityStatus: "Normal Supply",
    triageCategory: "food",
    county: "Volusia",
  },
  {
    id: "vol-2",
    name: "Halifax Urban Ministries",
    category: "Charity Free Services",
    address: "1340 Wright St, Daytona Beach, FL 32114",
    lat: 29.2205,
    lng: -81.0225,
    phone: "(386) 255-0349",
    description:
      "Feed-a-Family grocery distributions at multiple sites, Pathways to Housing homeless prevention, and Hope Place emergency shelter for families.",
    hoursText: "Mon–Fri 9:00 AM – 3:00 PM",
    schedule: { 1: [9, 15], 2: [9, 15], 3: [9, 15], 4: [9, 15], 5: [9, 15] },
    tags: ["Groceries", "Shelter", "Family", "Volusia", "Homeless Prevention"],
    partnerType: "Regional Partner",
    capacityStatus: "Normal Supply",
    triageCategory: "shelter",
    county: "Volusia",
  },
  {
    id: "vol-3",
    name: "Neighborhood Center of West Volusia",
    category: "Charity Free Services",
    address: "434 S Woodland Blvd, DeLand, FL 32720",
    lat: 29.0289,
    lng: -81.3039,
    phone: "(386) 734-8120",
    description:
      "Food pantry, rent and utility assistance, employment navigation, and case management for West Volusia families.",
    hoursText: "Tue & Thu 9:00 AM – 12:00 PM",
    schedule: { 2: [9, 12], 4: [9, 12] },
    tags: ["Groceries", "Rent Help", "Utilities", "Employment", "Volusia"],
    partnerType: "Community Partner",
    capacityStatus: "Normal Supply",
    triageCategory: "food",
    county: "Volusia",
  },
  {
    id: "vol-4",
    name: "Daytona Beach Health Department — Homeless Outreach",
    category: "Charity Free Services",
    address: "605 N Segrave St, Daytona Beach, FL 32114",
    lat: 29.2261,
    lng: -81.0196,
    phone: "(386) 317-0708",
    description:
      "Street outreach, hygiene supplies, harm reduction supplies, and connections to shelter and treatment services.",
    hoursText: "Mon–Fri 8:00 AM – 5:00 PM",
    schedule: { 1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 17] },
    tags: ["Hygiene", "Outreach", "Health", "Volusia", "Street Medicine"],
    partnerType: "Public Health",
    capacityStatus: "Open & Ready",
    triageCategory: "shelter",
    county: "Volusia",
  },
  {
    id: "vol-5",
    name: "First Call for Help — Volusia-Flagler 211",
    category: "Charity Free Services",
    address: "Daytona Beach, FL 32114",
    lat: 29.2108,
    lng: -81.0228,
    phone: "211",
    description:
      "24/7 helpline for food, shelter, mental health, and disaster response across Volusia and Flagler counties.",
    hoursText: "24/7",
    schedule: { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] },
    tags: ["24/7", "Helpline", "Volusia", "Flagler", "Crisis"],
    partnerType: "Helpline",
    capacityStatus: "Open & Ready",
    triageCategory: "food",
    county: "Volusia",
  },
  {
    id: "vol-6",
    name: "Avenues 12 Emergency Shelter",
    category: "Shelters & Housing",
    address: "204 South St, Daytona Beach, FL 32114",
    lat: 29.2153,
    lng: -81.0247,
    phone: "(386) 265-4955",
    description:
      "Emergency shelter for single adults 18 and older. Intake begins at 4:30 PM daily. Bed reservations accepted.",
    hoursText: "Intake 4:30 PM daily",
    schedule: { 0: [16.5, 20], 1: [16.5, 20], 2: [16.5, 20], 3: [16.5, 20], 4: [16.5, 20], 5: [16.5, 20], 6: [16.5, 20] },
    tags: ["Shelter", "Single Adults", "Intake", "Volusia"],
    partnerType: "Shelter Network",
    capacityStatus: "Limited Beds",
    triageCategory: "shelter",
    county: "Volusia",
  },
];

const ORANGE_RESOURCES: Resource[] = [
  {
    id: "orl-1",
    name: "Christian Service Center for the Homeless",
    category: "Charity Free Services",
    address: "808 W Central Blvd, Orlando, FL 32805",
    lat: 28.5273,
    lng: -81.3978,
    phone: "(407) 426-2600",
    description:
      "Prevents homelessness through rent and utility assistance, free meals, clothing, and shelter navigation.",
    hoursText: "Mon–Fri 8:00 AM – 3:00 PM",
    schedule: { 1: [8, 15], 2: [8, 15], 3: [8, 15], 4: [8, 15], 5: [8, 15] },
    tags: ["Food", "Shelter", "Clothing", "Orange County", "Rent Help"],
    partnerType: "Regional Partner",
    capacityStatus: "High Demand",
    triageCategory: "shelter",
    county: "Orange",
  },
  {
    id: "orl-2",
    name: "Coalition for the Homeless of Central Florida",
    category: "Shelters & Housing",
    address: "18 N Terry Ave, Orlando, FL 32801",
    lat: 28.5432,
    lng: -81.3853,
    phone: "(407) 652-5300",
    description:
      "Central Florida&apos;s largest homeless services provider. Emergency shelter, meals, case management, and rapid rehousing.",
    hoursText: "Intake 24/7 — call first",
    schedule: { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] },
    tags: ["Shelter", "Meals", "Case Management", "Rapid Rehousing", "Orange County"],
    partnerType: "Regional Partner",
    capacityStatus: "Limited Beds",
    triageCategory: "shelter",
    county: "Orange",
  },
  {
    id: "orl-3",
    name: "Second Harvest Food Bank of Central Florida — Orange Branch",
    category: "Food Banks",
    address: "1410 S Kirkman Rd, Orlando, FL 32811",
    lat: 28.5234,
    lng: -81.4478,
    phone: "(407) 295-5009",
    description:
      "Central Florida food bank. Call for partner pantry locations, mobile pantry schedules, and weekend food distributions.",
    hoursText: "Call for distribution times",
    schedule: {},
    tags: ["Groceries", "Mobile Pantry", "Orange County", "Family Food"],
    partnerType: "Regional Food Bank",
    capacityStatus: "Normal Supply",
    triageCategory: "food",
    county: "Orange",
  },
  {
    id: "orl-4",
    name: "Orange County Family Resource Program",
    category: "Charity Free Services",
    address: "9837 E Colonial Dr, Orlando, FL 32817",
    lat: 28.5543,
    lng: -81.3456,
    phone: "(407) 836-8466",
    description:
      "Homelessness prevention, rental assistance, utility assistance, and connections to supportive services for Orange County families.",
    hoursText: "Mon–Sat 9:00 AM – 4:00 PM",
    schedule: { 1: [9, 16], 2: [9, 16], 3: [9, 16], 4: [9, 16], 5: [9, 16], 6: [9, 16] },
    tags: ["Rent Help", "Utilities", "Prevention", "Orange County", "Families"],
    partnerType: "County Program",
    capacityStatus: "High Demand",
    triageCategory: "shelter",
    county: "Orange",
  },
  {
    id: "orl-5",
    name: "Orlando Union Rescue Mission",
    category: "Shelters & Housing",
    address: "1525 W Washington St, Orlando, FL 32805",
    lat: 28.5321,
    lng: -81.3989,
    phone: "(407) 422-4858",
    description:
      "Emergency shelter, meals, job training, and transitional housing for men, women, and families in Orlando.",
    hoursText: "Call for intake hours",
    schedule: {},
    tags: ["Shelter", "Meals", "Job Training", "Transitional Housing", "Orange County"],
    partnerType: "Faith-Based",
    capacityStatus: "Limited Beds",
    triageCategory: "shelter",
    county: "Orange",
  },
  {
    id: "orl-6",
    name: "IDignity — Help Getting IDs & Documents",
    category: "Charity Free Services",
    address: "26 E Lucerne Circle Rd, Orlando, FL 32801",
    lat: 28.5421,
    lng: -81.3789,
    phone: "(407) 426-3030",
    description:
      "Free help getting Florida ID, birth certificates, and other documents needed for jobs, housing, and benefits.",
    hoursText: "Tue & Thu 9:00 AM – 12:00 PM",
    schedule: { 2: [9, 12], 4: [9, 12] },
    tags: ["ID Help", "Documents", "Employment", "Orange County"],
    partnerType: "Nonprofit",
    capacityStatus: "Normal Supply",
    triageCategory: "id_tech",
    county: "Orange",
  },
];

export const ALL_RESOURCES: Resource[] = [
  ...BREVARD_RESOURCES,
  ...VOLUSIA_RESOURCES,
  ...ORANGE_RESOURCES,
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
  return ALL_RESOURCES.map((res) => ({
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
  return ALL_RESOURCES.filter(
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
