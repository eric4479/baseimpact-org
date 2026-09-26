/**
 * Single source of truth for per-route metadata.
 *
 * Every route the app can render is declared here with the title and description
 * that belong to it. Two consumers read this list:
 *
 *   1. `PageMeta` — sets document.title and the social tags on the client.
 *   2. `scripts/prerender.mjs` — writes a real HTML file per route at build time,
 *      so crawlers and social scrapers (which do not run JavaScript) see the
 *      correct title, description, and Open Graph tags, and so the first paint
 *      has real content instead of an empty <div id="root">.
 *
 * Keep this in sync with the PATHS list in `src/lib/nav.tsx` and the app routes in
 * `public/_redirects`. `scripts/prerender.mjs` fails the build if the three drift
 * apart, so a mismatch surfaces at build time rather than in search results.
 */

export type RouteMeta = {
  /** The route path, exactly as it appears in the address bar. */
  path: string;
  /** Page title, without the "| Base Impact" suffix. */
  title: string;
  /** Meta description. Aim for 120-160 characters. */
  description: string;
  /** Excluded from the sitemap and served with `noindex` when true. */
  noindex?: boolean;
};

export const SITE_NAME = "Base Impact";
export const SITE_URL = "https://baseimpact.org";

export const ROUTE_META: RouteMeta[] = [
  {
    path: "/",
    title: "Base Impact — neighborhood help in Brevard County",
    description:
      "Tech help, food, shelter, and community support in North Brevard. Built for phones.",
  },
  {
    path: "/directory",
    title: "Find food, shelter, and help near you",
    description:
      "Search food pantries, shelters, showers, and local assistance across Brevard, Volusia, and Orange Counties by zip code, sorted by distance from you.",
  },
  {
    path: "/guide",
    title: "Resource guide",
    description:
      "Pick your situation and we'll point you to food, shelter, and help across Central Florida.",
  },
  {
    path: "/partners",
    title: "Partner with Base Impact",
    description:
      "Register your church, pantry, shelter, or small nonprofit in the Brevard referral network.",
  },
  {
    path: "/volunteer",
    title: "Volunteer with Base Impact",
    description:
      "Give a few hours at a care-package day, at a community garden, or helping a small church with tech.",
  },
  {
    path: "/give",
    title: "Ways to give",
    description:
      "Give directly to partners, donate goods, or give time. Pre-filing nonprofit — donations route to partners.",
  },
  {
    path: "/impact",
    title: "Impact stories",
    description:
      "Real stories from Base Impact: travelers, veterans, new residents, and church partnerships.",
  },
  {
    path: "/about",
    title: "About Base Impact",
    description:
      "Founder Eric Douglas's story, board duties, partner list, and pre-filing nonprofit status.",
  },
  {
    path: "/join",
    title: "Join Base Impact",
    description: "Volunteer, partner, give, or join the board. Pick what fits you.",
  },
  {
    path: "/contact",
    title: "Contact Base Impact",
    description:
      "Phone, email, and contact details for Base Impact, a pre-filing nonprofit serving North Brevard County, Florida.",
  },
  {
    path: "/feedback",
    title: "Send feedback",
    description:
      "Tell Base Impact what's missing, share a story, or suggest a new resource.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "What Base Impact collects, how we use it, and how to request deletion.",
  },
  {
    path: "/terms",
    title: "Terms of Use & Directory Disclaimer",
    description:
      "Terms of use, resource directory disclaimer, accuracy limits, and liability terms for baseimpact.org.",
  },
];

/** Look up metadata for a path. Falls back to the home entry for unknown paths. */
export function metaForPath(path: string): RouteMeta {
  const normalized = path.replace(/\/+$/, "") || "/";
  return (
    ROUTE_META.find((r) => r.path === normalized) ??
    ROUTE_META.find((r) => r.path === "/")!
  );
}