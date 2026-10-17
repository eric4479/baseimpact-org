/**
 * Site + region configuration.
 *
 * Region is intentionally a single source of truth: the tri-county footprint and the
 * crisis numbers appear in the crisis bar, the footer, and every resource card.
 * Change them here, nowhere else.
 */

export const SITE = {
  name: 'Base Impact, Inc.',
  shortName: 'Base Impact',
  url: 'https://baseimpact.org',
  domain: 'baseimpact.org',
  email: 'info@baseimpact.org',
  tagline: 'Find help. Fill gaps. Build stability.',
  description:
    "A crisis-first, verified resource locator for Florida's Space Coast — recovery, housing, employment, and basic needs across Brevard, Volusia, and Indian River counties.",
  legalNotice:
    'Base Impact, Inc. is a Florida non-profit corporation in formation. Federal 501(c)(3) tax-exempt status application pending.',
  ein: '43-2200667',
  fdacsRegistration: 'CH85670',
  fdacsExpiration: 'October 16, 2027',
} as const;

export const REGION = {
  label: "Florida's Space Coast & Central Florida",
  anchorCity: 'Titusville',
  state: 'FL',
  /**
   * Service footprint. Drives coverage + gap reporting.
   * Space Coast (Brevard · Volusia · Indian River) + Orange · Flagler.
   */
  counties: ['Brevard', 'Volusia', 'Indian River', 'Orange', 'Flagler'] as const,
} as const;

export type County = (typeof REGION.counties)[number];

export interface CrisisLine {
  label: string;
  tel: string;
  display: string;
  note: string;
}

/**
 * Pinned to the top of EVERY page. Base Impact is a router, not a crisis service —
 * these must never be more than one tap away.
 */
export const CRISIS_LINES: CrisisLine[] = [
  { label: '988 Suicide & Crisis Lifeline', tel: '988', display: '988', note: 'Call or text · 24/7' },
  { label: 'SAMHSA National Helpline', tel: '18006624357', display: '1-800-662-HELP', note: 'Free · 24/7 · confidential' },
  { label: '211 (United Way)', tel: '211', display: '211', note: 'Local resources' },
  { label: 'Emergency', tel: '911', display: '911', note: 'Immediate danger' },
];

/** Standing legal notice shown wherever listings appear. */
export const LISTING_DISCLAIMER =
  'Base Impact is a navigator, not a provider. We do not give medical or legal advice and we do not recommend a particular level of care. A listing is not an endorsement or a guarantee. Base Impact accepts no compensation for any listing or referral — including any treatment provider or recovery residence (Fla. Stat. § 817.505).';
