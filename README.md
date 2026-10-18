# Base Impact — Find Help

Crisis-first, verified resource locator for **Brevard · Volusia · Indian River · Orange · Flagler**
counties in Florida.

Base Impact, Inc. is a Florida Not For Profit Corporation (501(c)(3) application pending).
We connect people to recovery, housing, employment, and basic-needs resources, help grassroots
nonprofits modernize, and **partner with 211 rather than replacing it**.

**Live:** https://baseimpact.org

---

## Stack

| Piece | Version |
|---|---|
| Astro | 6.4.4 |
| Adapter | `@astrojs/cloudflare` 13.6.1 — **Cloudflare Workers** (v13 has no Pages target) |
| Runtime | Cloudflare Worker `baseimpact-org` |
| Tailwind | v4 (via `@tailwindcss/vite`) |
| Node | >= 22 |

All pages are **prerendered**. The only on-demand route is `/api/suggest`.

---

## Commands

```sh
npm install
npm run dev        # → http://localhost:4321
npm run build      # → dist/client (assets) + dist/server (worker)
npm run preview
npm run deploy     # build + wrangler deploy --config dist/server/wrangler.json
```

`npm run deploy` needs Cloudflare credentials. In CI they come from repo secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; locally set `CLOUDFLARE_API_TOKEN`.

---

## Deployment topology (read before touching Cloudflare)

- **Worker:** `baseimpact-org` — serves the site.
- **Routes:** `baseimpact.org/*` and `www.baseimpact.org/*` (zone routes, in `wrangler.toml`).
- **DNS:** proxied CNAMEs on the apex and `www` anchor the routes; Cloudflare intercepts
  before the origin. `www` 301-redirects to the apex.
- **Email:** Cloudflare Email Routing (inbound) → Gmail. SPF/DMARC set; DKIM present for
  Cloudflare Email Routing (`cf2024-1._domainkey`) and SendGrid (`s1/s2._domainkey`).
- **CI:** `.github/workflows/deploy.yml` builds every push/PR; deploys on `main`.

**Note:** the legacy Cloudflare **Pages** project `baseimpact-org` still exists but its Git
builds are disabled and it no longer serves the domain. Worker custom domains are not
reachable through OAuth logins (API error 10405) — that is why zone routes are used.

---

## Project map

```
src/
├── config/region.ts        Site identity, counties, crisis lines, EIN/FDACS
├── data/
│   ├── schema.ts           Resource types + category definitions
│   └── resources.ts        ← THE SEED DATA. Edit this to add a resource.
├── lib/resources.ts        Query helpers: coverage, gaps, staleness
├── styles/global.css       Tailwind v4 theme + light/dark tokens
├── layouts/Base.astro      Shell — crisis bar, header, footer, theme bootstrap
├── components/
│   ├── CrisisBar.astro     Pinned 988 / SAMHSA / 211 / 911 bar
│   ├── SiteHeader.astro    Nav + theme toggle
│   ├── SiteFooter.astro    Legal, EIN, FDACS #, links
│   ├── ResourceCard.astro
│   └── ResourceExplorer.astro
└── pages/
    ├── index.astro         Find Help hub (homepage)
    ├── guide.astro         Pick-your-situation guide
    ├── partners.astro      Partner / register your organization
    ├── volunteer.astro     Volunteer opportunities
    ├── donate.astro        Donations (Zeffy) + tax status + registration
    ├── grants.astro        Grant funding + fiscal sponsor
    ├── about.astro         Mission, founder, partners
    ├── lifeline.astro      Lifeline / "free government phone" explainer
    ├── submit.astro        Suggest a resource
    ├── privacy.astro       Privacy policy
    ├── terms.astro         Terms & disclaimer
    └── api/suggest.ts      On-demand form endpoint (EMAIL binding)
```

---

## Theme

Light is the default; the header toggle switches to dark and the choice persists in
`localStorage`. OS `prefers-color-scheme` is honoured on first visit. Transitions are
disabled under `prefers-reduced-motion`. `color-scheme` is set so native controls match.

---

## Legal guardrails (do not remove)

- **F.S. § 817.505 — Florida Patient Brokering Act.** Third-degree felony ($50K fine;
  escalating to first-degree + $500K at volume) to give or receive anything of value to
  induce a referral to a substance-abuse or mental-health provider. It reaches
  information/referral services.
  → **Base Impact accepts ZERO compensation for any listing or referral. No ads, no
  "featured," no sponsorships, no affiliate links, no data sales.**
- **FDACS Ch. 496, F.S.** Registration # **CH85670** (expires 2026-10-16 → renewed to 2027).
  Must appear on solicitations.
- **501(c)(3) pending.** Donations are **not** tax-deductible until the IRS grants
  exemption — the site must say so.
- **Listed ≠ endorsed.** No clinical advice; never recommend a level of care.
- Sober homes must be FL-certified (F.S. § 397.487) before listing.

---

## Verification cadence

Re-verify each record **quarterly**. Anything with `lastVerified` older than **120 days**
renders a "⚠ Call ahead" warning (see `isStale()` in `src/lib/resources.ts`).
