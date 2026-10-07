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
npm run deploy     # build + `wrangler deploy`
```

---

## Project map

```
src/
├── config/region.ts        Site identity, tri-county list, crisis lines
├── data/
│   ├── schema.ts           Resource types + category definitions
│   └── resources.ts        ← THE SEED DATA. Edit this to add a resource.
├── lib/resources.ts        Query helpers: coverage, gaps, staleness
├── styles/global.css       Tailwind v4 theme (fonts, cream bg, print rules)
├── layouts/Base.astro      Shell — always renders CrisisBar
├── components/
│   ├── CrisisBar.astro     Pinned 988 / SAMHSA / 211 / 911 bar
│   ├── SiteHeader.astro
│   ├── SiteFooter.astro
│   ├── ResourceCard.astro  Handles missing fields gracefully
│   └── ResourceExplorer.astro  Search + category filter (vanilla, no hydration)
└── pages/
    ├── index.astro         The Find Help hub (homepage)
    ├── about.astro         Mission, verification method, coverage gaps
    ├── submit.astro        Suggest a resource / report a correction
    └── api/suggest.ts      On-demand form endpoint
```

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
  city: 'Titusville',
  phone: '321-555-0100',
  hours: 'Tuesdays 10am–12pm',
  cost: ['Free'],
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

---

## ⚠️ Legal guardrails (do not remove)

- **F.S. § 817.505 — Florida Patient Brokering Act.** Third-degree felony ($50K fine;
  escalating to first-degree + $500K at volume) to give or receive anything of value to
  induce a referral to a substance-abuse or mental-health provider. It reaches
  information/referral services.
  → **Base Impact accepts ZERO compensation for any listing or referral. No ads, no
  "featured," no sponsorships, no affiliate links, no data sales.**
- **501(c)(3):** listings are neutral and merit-based, never pay-to-rank.
- **Listed ≠ endorsed.** No clinical advice — never recommend a level of care.
- **Sober homes** must be FL-certified (F.S. § 397.487) before listing.
- No ad/tracking pixels on help pages.

---

## Verification cadence

Re-verify each record **quarterly**. Anything with `lastVerified` older than **120 days**
automatically renders a "⚠ Call ahead" warning (see `isStale()` in `src/lib/resources.ts`).
