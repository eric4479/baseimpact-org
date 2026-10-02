/**
 * The social accounts Base Impact actually owns.
 *
 * One entry per live account. Adding a platform later is a one-line change here --
 * the /socials page, the footer link, and the Organization schema all read this list,
 * so there is no second place to update.
 *
 * THE RULE FOR THIS FILE: only accounts that exist and are controlled by Base Impact.
 * A handle that is planned, reserved, or squatted by someone else does not belong
 * here. The site's whole promise to a reader is that what it points at is real, and a
 * dead social link breaks that promise the same way a wrong pantry address does. If a
 * platform is being set up but is not live yet, it stays out of this array and goes in
 * PENDING below, which renders as plain text with no link.
 *
 * Handle standard: baseimpactorg. Verified 2026-10-01:
 *   - x.com/baseimpactorg        taken by us
 *   - x.com/baseimpact           TAKEN by ImpactBase, a pre-seed incubator
 *   - instagram.com/baseimpact   TAKEN by baseimpact (UK sports science)
 *   - instagram.com/baseimpactorg  free
 *   so the longer handle is the one that is ours on every platform.
 */

export type Social = {
  /** Platform name as a person would say it. */
  name: string;
  /** The handle, written the way the platform writes it. */
  handle: string;
  /** Full profile URL. */
  url: string;
  /** One short line on what gets posted there. */
  blurb: string;
  /** Icon key resolved by the page. "x" is an inline logo; others are lucide icons. */
  icon: "x" | "facebook" | "instagram" | "youtube" | "linkedin" | "tiktok" | "github";
};

export const SOCIALS: Social[] = [
  {
    name: "X",
    handle: "@baseimpactorg",
    url: "https://x.com/baseimpactorg",
    blurb: "Day-to-day updates, volunteer calls, and what we are working on.",
    icon: "x",
  },
];

/**
 * Platforms we are setting up but have not claimed yet.
 *
 * Deliberately has no URLs: there is nothing to link to, and guessing at a profile URL
 * would either 404 or land on a stranger's account. These render as plain text so the
 * page stays honest about what is and is not live yet.
 */
export const PENDING: string[] = ["Facebook", "Instagram"];
