# Base Impact — Find Help

A **crisis-first, verified resource locator** for Florida's Space Coast and Central Florida
(**Brevard · Volusia · Indian River · Orange · Flagler**).

Base Impact, Inc. is a Florida non-profit corporation in formation (501(c)(3) pending).
This site is the "find help" front door: it connects people to recovery, housing, employment,
and basic-needs resources — and **partners with 211 rather than replacing it**.

---

## Stack

| Piece | Version |
|---|---|
| Astro | 6.4.4 |
| Adapter | `@astrojs/cloudflare` 13.6.1 (Workers) |
| Tailwind | v4 (via `@tailwindcss/vite`) |
| Node | >= 22.12.0 |
| Language | TypeScript (strict) |

Content pages are **prerendered**; only `/api/suggest` runs on-demand.

---

## Commands

```sh
npm install        # install deps
npm run dev        # dev server → http://localhost:4321
npm run build      # production build → ./dist
npm run preview    # preview the build
npm test           # build + 25 DOM assertions against the real built page
npm run gen:zips   # regenerate ZIP/city centroid tables
npm run deploy     # build + `wrangler deploy`
```

---

## Project map

```
src/
├── config/region.ts        Site identity, 5-county footprint, crisis lines
├── data/
│   ├── schema.ts           Resource types, categories, populations
│   ├── resources.ts        ← THE SEED DATA. Edit this to add a resource.
│   ├── fl-zips.ts          Generated: all FL ZIP centroids (server-side lookups)
│   ├── region-zips.ts      Generated: 300 service-area ZIPs, shipped to the browser
│   └── region-cities.ts    Generated: 119 city centroids (approximate fallback)
├── lib/
│   ├── resources.ts        Query helpers: coverage, gaps, staleness, geo resolution
│   └── geo.ts              Haversine + ZIP lookup (all client-side)
├── styles/global.css       Tailwind v4 theme (fonts, cream bg, print rules)
├── layouts/Base.astro      Shell — always renders CrisisBar
├── components/
│   ├── CrisisBar.astro     Pinned 988 / SAMHSA / 211 / 911 bar
│   ├── SiteHeader.astro
│   ├── SiteFooter.astro
│   ├── ResourceCard.astro  Handles missing fields gracefully
│   └── ResourceExplorer.astro  Search + category + population + distance (vanilla JS)
└── pages/
    ├── index.astro         The Find Help hub (homepage)
    ├── about.astro         Mission, verification method, coverage gaps
    ├── submit.astro        Suggest a resource / report a correction
    └── api/suggest.ts      On-demand form endpoint
scripts/
├── gen-zips.mjs            Regenerates the ZIP + city centroid tables
└── smoke-test.mjs          25 DOM assertions against the built page (`npm test`)
```

---

## Distance, and why it works the way it does

Coordinates resolve in three tiers (`resolveGeo` in `src/lib/resources.ts`):

1. `geo: [lat, lng]` on the record — hand-verified street coordinates
2. ZIP parsed out of `address` → ZIP centroid — **street-level**
3. `city` → city centroid — **approximate**, and the UI says so on the badge

Resources with no physical location (helplines, statewide gateways) get **no** coordinates
and sink to the bottom when sorting. Distance to a phone number is meaningless, and a fake
pin would send someone walking to nothing.

**Privacy:** the visitor's ZIP is resolved to a centroid **in the browser** against the
embedded 8KB regional table. Device location is opt-in via `navigator.geolocation` and the
coordinates never leave the tab. Nothing is transmitted or stored. See R3 in the risks doc.

---

## Adding a resource

Edit `src/data/resources.ts` and append an object. Only `id`, `name`, `orgType`,
`category`, `counties`, `tags`, and `verification` are required — leave any contact
field `undefined` rather than guessing, and the card will render
"Contact info pending verification" instead of a broken link.

```ts
{
  id: 'example-org',
  name: 'Example Org',
  orgType: 'Food pantry',
  category: 'basic',
  counties: ['Brevard'],
  city: 'Titusville',              // gives approximate distance if no address
  address: '123 Main St, Titusville, FL 32780',  // gives street-level distance
  phone: '321-555-0100',
  hours: 'Tuesdays 10am–12pm',
  cost: ['Free'],
  population: ['veterans', 'families'],  // optional: who it's specifically for
  tags: ['food', 'pantry'],
  verification: {
    status: 'verified',          // verified | partner | pending | sample | stale | closed
    lastVerified: '2026-10-06',
    verifiedBy: 'Base Impact',
    source: 'example.org',
  },
}
```

`verification.status: 'sample'` renders a loud SAMPLE badge — use it for placeholders
you intend to replace, never for real orgs.

**If you ever list a residential or clinical facility**, you must set `licenseNumber` and
`licensingAuthority` — see R1 in the risks doc. The v1 seed data deliberately does not.

---

## ⚠️ Legal guardrails (do not remove)

- **F.S. § 817.505 — Florida Patient Brokering Act.** Third-degree felony ($50K fine;
  escalating to first-degree + $500K at volume) to give or receive anything of value to
  induce a referral to a substance-abuse or mental-health provider. It reaches
  information/referral services.
  → **Base Impact accepts ZERO compensation for any listing or referral. No ads, no
  "featured," no sponsorships, no affiliate links, no data sales.**
- **Ch. 429 / § 429.47, F.S.** — ALFs and Adult Family Care Homes are licensed by AHCA, and
  licensed facilities must advertise with their license number. We link AHCA's locator
  instead of listing facilities.
- **Lifeline** — never enroll anyone, never charge a fee, never take a commission
  (47 CFR pt. 54 subpt. E). The ACP **ended** June 1, 2024; do not advertise it.
- **ID/SSN documents** — never take custody, never scan, never store.
- **501(c)(3):** listings are neutral and merit-based, never pay-to-rank.
- **Listed ≠ endorsed.** No clinical advice — never recommend a level of care.
- **Sober homes** must be FL-certified (F.S. § 397.487) before listing.
- No ad/tracking pixels on help pages. No server-side logging of location or search terms.

---

## Verification cadence

Re-verify each record **quarterly**. Anything with `lastVerified` older than **120 days**
automatically renders a "⚠ Call ahead" warning (see `isStale()` in `src/lib/resources.ts`).
