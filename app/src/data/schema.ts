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
  'recovery',
  'housing',
  'employment',
  'basic',
  'stability',
  'community',
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
  recovery: {
    label: 'Recovery',
    blurb: 'Faith-based recovery, treatment, sober living, peer support.',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  housing: {
    label: 'Housing',
    blurb: 'Emergency and cold-weather shelter, rehousing, rent & utility aid.',
    badge: 'bg-sky-100 text-sky-800',
  },
  employment: {
    label: 'Jobs & Income',
    blurb: 'Workforce centers, training, fair-chance employers, day labor.',
    badge: 'bg-amber-100 text-amber-800',
  },
  basic: {
    label: 'Basic Needs',
    blurb: 'Food, clothing, hygiene, transportation, childcare.',
    badge: 'bg-rose-100 text-rose-800',
  },
  stability: {
    label: 'Stability',
    blurb: 'Referral lines, legal aid, ID & documents, benefits, healthcare.',
    badge: 'bg-violet-100 text-violet-800',
  },
  community: {
    label: 'Community',
    blurb: 'Churches, support groups, community meals, mentorship.',
    badge: 'bg-teal-100 text-teal-800',
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

export interface Resource {
  /** Stable slug. Used as the DOM id and for de-duplication. */
  id: string;
  name: string;
  /** Plain-language description of what it is, e.g. "Food pantry". */
  orgType: string;
  category: Category;
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
  /** Free-text keywords used by the client-side search. */
  tags: string[];
  verification: Verification;
  notes?: string;
}
