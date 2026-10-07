# Base Impact — "Find Help" Resource Navigator
### Plan, taxonomy & legal guardrails

> **Purpose:** make `baseimpact.org` actually *function* as the place people go to find help — a
> verified, crisis-first navigation hub routing people to recovery, housing, employment, and
> basic-needs resources, and teaching them to keep finding resources themselves.

> **Status (2026-10-06):** scaffolded and verified. Live Astro 6.4.4 + Cloudflare Workers project in
> `app/`. Footprint set to **Brevard · Volusia · Indian River · Orange · Flagler**.

This operationalizes Base Impact's stated method ("connect community members to **verified partner
organizations**") and extends Pillar 3 (Workforce & Housing Navigation) with the missing
**recovery / addiction** dimension.

---

## 1. Where it fits in the pillar model

Current 5 pillars: Grassroots Nonprofits · Health & Safety Referrals · **Workforce & Housing
Navigation** · Eco-Sanctuaries · Community Tech Education.

- **Option A** — add a 6th pillar: **Recovery & Restoration**.
- **Option B (recommended)** — keep the 5 marketing pillars, and add a dedicated **`/find-help`
  hub page** that spans them all, framed as a **Stability Continuum**:
  `Recovery → Housing → Employment → Income → Self-sufficiency`.

The hub is the product. The pillars are the story. Consider making `/find-help` the **homepage** —
it is the single highest-value thing the site can do.

---

## 2. ⚠️ Legal guardrails — non-negotiable, Florida-specific

### 2a. Florida Patient Brokering Act — F.S. § 817.505
It is a **third-degree felony** (fine **$50,000**; escalating to a **first-degree felony + $500,000**
at 20+ patients) to offer, pay, or receive *anything of value* to induce the referral of a patient
to a substance-abuse provider (ch. 397), a mental-health provider (ch. 394 pt. IV), or a related
service. It explicitly reaches **information/referral services**.

> **RULE: Base Impact accepts ZERO compensation — in any form — for listing or referring to any
> treatment provider, sober home, or recovery service.**
> No paid placement · no "featured" · no sponsorships · no affiliate links · no data sales.

### 2b. 501(c)(3) private-benefit / inurement
Listings must be **neutral and merit-based**, never pay-to-rank. A listing is not an endorsement.

### 2c. Other hard rules
- **Listed ≠ endorsed.** Publish this on every page and on every card.
- **No clinical advice.** Never recommend a level of care. Route to SAMHSA / findtreatment.gov and
  licensed assessors.
- **Sober homes:** Florida requires sober-home certification (F.S. § 397.487). Verify certification
  status *before* listing — uncertified sober homes are a known harm vector.
- **Privacy:** no ad/tracking pixels on help pages; don't retain help-seeking data beyond need.
- **Accessibility:** WCAG 2.1 AA — this audience is disproportionately on phones, older devices, and
  assistive tech.

---

## 3. Crisis-first routing (pinned on every page, above everything else)

| Line | Use |
|---|---|
| **988** | Suicide & Crisis Lifeline — call / text / chat (988lifeline.org) |
| **1-800-662-HELP (4357)** | SAMHSA National Helpline — free, 24/7, confidential, treatment referrals |
| **211** | United Way — local housing, food, utility, and crisis resources |
| **findtreatment.gov** | SAMHSA's official treatment-locator |
| **911** | Immediate danger |

Base Impact is a **router, not a crisis service**. Never let a page load without these.

---

## 4. Don't rebuild 211 — navigate it

211 already maintains a statewide, staffed, verified database. Duplicating it wastes money and rots
faster. Base Impact's value is the **human + local** layer:

1. Hand-verified *local* partners (the ones 211's national index handles poorly),
2. Plain-language navigation ("here's exactly what to bring and who to ask for"),
3. **Teaching people to use 211 / SAMHSA themselves** — that *is* your digital-literacy mission.

**Partner with 211; do not compete with it.**

---

## 5. Taxonomy — 6 categories

1. **Recovery & Addiction** — faith-based recovery churches (Celebrate Recovery, recovery-church
   movement), AA / NA / SMART Recovery, detox, inpatient & outpatient treatment, MAT, **certified**
   sober living, peer recovery specialists, family support (Al-Anon / Nar-Anon).
2. **Housing** — emergency shelter, **cold-weather shelter**, transitional, rapid rehousing,
   affordable/subsidized (Section 8 / HUD), rent & utility assistance, tenant rights.
3. **Employment & Income** — workforce centers (CareerSource), job training (WIOA), **fair-chance
   (second-chance) employers**, resume coaching, day labor, micro-jobs, benefits (SNAP/TANF).
4. **Basic Needs** — food pantries, SNAP/WIC, clothing, transportation, childcare.
5. **Stability** — financial coaching, legal aid, healthcare/clinics, Medicaid, **ID & documents
   recovery** (no ID = no job = no housing — a critical choke point).
6. **Community** — support groups, community meals, mentorship, faith communities.

---

## 6. Verified-partner data model

```
name                 org_type            category            subcategory
address              geo (lat/lng)       phone               website
hours                cost (Free | Sliding | Insurance | Medicaid)
eligibility          languages           accessibility       intake_process
walk_in (bool)       serves_population   sober_home_certified (bool)
last_verified (date) verified_by         source_url          notes
status (active | stale | closed)
```

Every record carries `last_verified` **publicly**. Anything older than ~120 days renders as
*"may be outdated — call ahead."*

---

## 7. MVP scope — ship the minimum that actually helps

- **Geography — decided:** Brevard · Volusia · Indian River · Orange · Flagler
  (Space Coast + Central Florida).
- **One category done really well first** — Recovery **or** Employment.
- **25–40 hand-verified entries**, each with a `last_verified` stamp.
- Crisis bar on every page.
- Client-side search + category filter (no backend needed for v1).
- **"Report a problem / suggest a resource"** form → feeds the verification queue.

---

## 8. Verification cadence

- Re-verify every record **quarterly**; auto-flag anything > 120 days.
- Public `last_verified` date on every listing.
- Simple admin queue for additions/corrections.
- Track: listings added, verified, stale, reported-broken.

---

## 9. Open questions

1. ~~Geography~~ → **Decided:** Brevard · Volusia · Indian River · Orange · Flagler.
2. ~~6th pillar vs. hub page~~ → **Decided:** `/` *is* the find-help hub.
3. ~~Mockup vs. real project~~ → **Decided:** real Astro 6.4.4 + Cloudflare Workers project in `app/`.
4. Who is the **verifier of record** — you, a volunteer, or a partner org? *(open)*
5. Where do form submissions land — D1, KV, or email forwarding? Currently validated, logged, and
   dropped. *(open)*
6. Do we list **individual volunteers/mentors**, or organizations only? *(open — affects the schema)*

---

*Companion artifact: `site/find-help.html` — a working, filterable prototype of this hub with
clearly-labeled SAMPLE data.*
