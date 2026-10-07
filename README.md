# Base Impact — Find Help

Crisis-first, verified resource locator for **Brevard · Volusia · Indian River · Orange · Flagler**
counties in Florida.

Base Impact, Inc. is a Florida non-profit corporation in formation (501(c)(3) pending).
We connect people to recovery, housing, employment, and basic-needs resources, help grassroots
nonprofits modernize, and **partner with 211 rather than replacing it**.

---

## What's in here

| Path | What it is |
|---|---|
| **`app/`** | The real site — Astro 6.4.4 + Cloudflare Workers + Tailwind v4 |
| `site/find-help.html` | The original single-file prototype (kept for reference) |
| `FIND_HELP_PLAN.md` | Plan, taxonomy, legal guardrails, verification cadence |

---

## Quick start

```sh
cd app
npm install
npm run dev        # → http://localhost:4321
```

```sh
npm run build      # → dist/client (assets) + dist/server (worker)
npm run preview    # serve the build locally
npm run deploy     # build + wrangler deploy  (needs Cloudflare auth)
```

`npm run deploy` uses the wrangler config the adapter emits at
`dist/server/wrangler.json`. It has been validated with `--dry-run`
(551.9 KiB worker / 136.9 KiB gzip).

---

## Where to edit things

| I want to… | Edit |
|---|---|
| Add / fix a resource listing | `app/src/data/resources.ts` |
| Change the counties we cover | `app/src/config/region.ts` → `REGION.counties` |
| Change crisis numbers | `app/src/config/region.ts` → `CRISIS_LINES` |
| Change categories | `app/src/data/schema.ts` → `CATEGORIES` + `CATEGORY_META` |
| Change the legal disclaimer | `app/src/config/region.ts` → `LISTING_DISCLAIMER` |

---

## ⚠️ The one rule that governs this project

**F.S. § 817.505 — Florida Patient Brokering Act.** Third-degree felony ($50K fine; escalating to
first-degree + $500K at volume) to give *or receive* anything of value to induce a referral to a
substance-abuse or mental-health provider — and it explicitly reaches information/referral services.

> **Base Impact accepts ZERO compensation for any listing or referral.**
> No ads · no "featured" · no sponsorships · no affiliate links · no data sales.

Also: listings are neutral (501(c)(3) private-benefit rule), listed ≠ endorsed, no clinical advice,
and sober homes must be FL-certified (F.S. § 397.487) before they appear.

---

## Status

- ✅ Astro project scaffolded, builds clean, **27/27 DOM tests passing**
- ✅ **28 verified listings** across 6 categories — 0 placeholders remaining
- ✅ **Listing Policy** + **Lifeline debunk page** written and linked in the nav
- ✅ **Distance sorting** (ZIP-first, in-browser, privacy-safe) + population filters
- ✅ Form endpoint validated: 200 on success, 400 on bad input, 405 on wrong method, honeypot works
- ✅ Donation page with Zeffy integration live
- ✅ Grants page with fiscal sponsor info live
- ✅ FDACS registration #CH85670 displayed
- ⬜ Wire the submission endpoint to storage (D1 / KV / email forwarding)
