/**
 * The resource schema.
 *
 * Design rules:
 *  - Every optional contact field is genuinely optional. A record with only a name and
 *    a category is valid — the UI degrades to "pending verification" rather than
 *    inventing a phone number.
 *  - `verification.status` is the trust signal. 'sample' records render a loud badge and
 *    must never be used for a real organization.
 */

export const CATEGORIES = [
  'food',
  'basic',
  'tech',
  'health',
  'housing',
  'stability',
  'employment',
  'community',
  'recovery',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface CategoryMeta {
  label: string;
  /** Short line used on the hub and in gap reporting. */
  blurb: string;
  /** Tailwind classes for the card badge. */
  badge: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  food: {
    label: 'Food',
    blurb: 'Food pantries, food banks, hot meals, groceries, WIC & SNAP.',
    badge: 'bg-amber-100 text-amber-900',
  },
  health: {
    label: 'Health & Dental',
    blurb: 'Medical and dental care for low or no income, sliding-scale clinics.',
    badge: 'bg-rose-100 text-rose-900',
  },
  housing: {
    label: 'Housing',
    blurb: 'Emergency and cold-weather shelter, rehousing, rent & utility aid.',
    badge: 'bg-sky-100 text-sky-900',
  },
  basic: {
    label: 'Basic Needs',
    blurb: 'Clothing, hygiene, showers, transportation, childcare.',
    badge: 'bg-rose-100 text-rose-800',
  },
  tech: {
    label: 'Tech & Internet',
    blurb: 'Free computer access, low-cost internet, devices, and digital help.',
    badge: 'bg-indigo-100 text-indigo-900',
  },
  stability: {
    label: 'Stability',
    blurb: 'Referral lines, legal aid, ID & documents, benefits, healthcare.',
    badge: 'bg-violet-100 text-violet-800',
  },
  employment: {
    label: 'Jobs & Income',
    blurb: 'Workforce centers, training, fair-chance employers, day labor.',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  community: {
    label: 'Community',
    blurb: 'Churches, support groups, community meals, mentorship.',
    badge: 'bg-teal-100 text-teal-800',
  },
  recovery: {
    label: 'Recovery',
    blurb: 'Treatment, recovery support, and peer programs.',
    badge: 'bg-slate-200 text-slate-800',
  },
};

export type VerificationStatus =
  | 'verified' // A Base Impact volunteer confirmed the details directly.
  | 'partner' // Known partner organization; details may still be partial.
  | 'pending' // Reported but not yet confirmed.
  | 'sample' // PLACEHOLDER. Renders a SAMPLE badge. Never a real org.
  | 'stale' // Confirmed previously, now past the re-verify window.
  | 'closed'; // Confirmed no longer operating.

export interface Verification {
  status: VerificationStatus;
  /** ISO date (YYYY-MM-DD) of the last confirmation. */
  lastVerified?: string;
  verifiedBy?: string;
  /** Where the information came from — a URL or "word of mouth". */
  source?: string;
  note?: string;
}

/**
 * Who a resource is specifically set up to serve. Lets people filter for
 * "housing for all types of people" without inventing a new category per population.
 */
export const POPULATIONS = [
  'recovery', // people in or seeking recovery from substance use
  'disability', // intellectual, developmental, or physical disability
  'mental-health', // mental health condition / psychosocial support needs
  'reentry', // returning from incarceration, or with a criminal record
  'veterans',
  'seniors',
  'youth', // under 18 or transitional-age
  'families',
  'immigrants', // including mixed-status households
  'unhoused', // currently or recently experiencing homelessness
  'lgbtq',
] as const;

export type Population = (typeof POPULATIONS)[number];

export const POPULATION_LABELS: Record<Population, string> = {
  recovery: 'Recovery',
  disability: 'Disability',
  'mental-health': 'Mental health',
  reentry: 'Reentry / record',
  veterans: 'Veterans',
  seniors: 'Seniors',
  youth: 'Youth',
  families: 'Families',
  immigrants: 'Immigrants',
  unhoused: 'Experiencing homelessness',
  lgbtq: 'LGBTQ+',
};

export interface Resource {
  /** Stable slug. Used as the DOM id and for de-duplication. */
  id: string;
  name: string;
  /** Plain-language description of what it is, e.g. "Food pantry". */
  orgType: string;
  category: Category;
  /**
   * Additional categories this listing should also appear under.
   *
   * Some organizations genuinely serve more than one need — LifePointe runs a food
   * ministry, a shower/hygiene ministry, and a cold-night shelter. Without this, the
   * choice is either to duplicate the record (which produces two cards for one place)
   * or to bury it under one category. Neither is honest. `category` stays the primary
   * (it drives the card badge); `alsoIn` widens the filter without duplicating anything.
   */
  alsoIn?: Category[];
  /** Which of the tri-county counties it serves. */
  counties: string[];
  city?: string;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
  /** e.g. ['Free'], ['Insurance', 'Sliding scale']. */
  cost?: string[];
  eligibility?: string;
  languages?: string[];
  walkIn?: boolean;
  /**
   * Who this is specifically set up to serve. Drives the "who it's for" filter.
   * Omit when the resource is genuinely open to everyone.
   */
  population?: Population[];
  /**
   * Optional coordinates for distance sorting. Prefer letting the visitor's ZIP drive
   * distance — only set these when you have verified them, and never geocode a
   * person's location server-side (see RISKS_AND_RECOMMENDATIONS.md R3).
   */
  geo?: [lat: number, lng: number];
  /**
   * Licensing. REQUIRED if you ever list a residential or clinical facility —
   * see RISKS_AND_RECOMMENDATIONS.md R1. The v1 seed data deliberately lists licensed
   * *gateways* instead of facilities, so these are unset.
   */
  licenseNumber?: string;
  licensingAuthority?: string;
  /** Free-text keywords used by the client-side search. */
  tags: string[];
  verification: Verification;
  notes?: string;
}
