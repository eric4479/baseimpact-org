# Base Impact — Risks, Legal Guardrails & Recommendations

**Reviewed:** 2026-10-06 · **Scope:** the Find Help resource locator

> **Not legal advice.** I verified the statutes and federal rules cited below against primary
> sources, but I am not a lawyer and this is not a legal opinion. **Recommendation R8 is to retain a
> Florida nonprofit attorney before launch.** Everything here is a map of where to point them.

---

## 0. The one-paragraph version

Your instinct is right: **four of the things you want to build are regulated.** Two are critical
(residential facility listings, and the Lifeline phone program), one is a privacy trap (GPS
detection), and one is a data-custody trap (ID/SSN documents). The good news is that a single design
principle resolves almost all of it:

> **Base Impact is a router, not a provider. Route to the licensed gatekeeper — don't list the
> facility, don't enroll the person, don't hold the document.**

---

## 1. ⚠️ R1 — CRITICAL: residential facility listings

This is the sharpest edge in the project. "Housing for all types of people — halfway housing,
mentally challenged, small affordable living space" maps onto **at least four separate licensing
regimes**:

| What you called it | What Florida calls it | Regulator | Statute |
|---|---|---|---|
| Housing for mentally challenged | Group home / ALF / Adult Family Care Home | **AHCA** + **APD** | Ch. 429, Ch. 393 |
| Small assisted living | Assisted Living Facility (ALF) | **AHCA** | Ch. 429, 408 Pt. II |
| Halfway / sober housing | Recovery Residence | **FARR / DCF** | § 397.487 (certification) |
| Halfway house (criminal justice) | Work release / transitional | **FDC** | — |

**Two specific traps:**

1. **§ 429.47, F.S. requires ALF advertising to include the AHCA license number.** If you publish a
   facility's promotional details without its license number, you are not just listing — you may be
   *advertising* an unlicensed facility.
2. **§ 817.505, F.S.** (already in your guardrails) makes it a third-degree felony to give *or
   receive* anything of value for a treatment/recovery referral. Recovery residences sit squarely
   inside this.

### Recommendation

**For v1, do not list residential facilities at all.** List the **licensed gateways** instead:

- **AHCA Facility Locator** — every licensed ALF and AFCH, with license numbers
- **APD (Agency for Persons with Disabilities)** — group homes for developmental disabilities
- **Florida Housing / HUD** — subsidized and affordable units
- **211** — the staffed human who knows today's openings

If you later decide to list facilities, the record **must** carry `licenseNumber` and `licensingAuthority`,
and the card **must** display them. I've added those fields to the schema so the door is open — but
the v1 seed data uses gateways only.

---

## 2. ⚠️ R2 — CRITICAL: the "Government Lifeline Cell Phone" program

**You almost certainly have outdated information, and so do most of the websites your clients are
finding.**

| Program | Status | What it does |
|---|---|---|
| **ACP** (Affordable Connectivity Program) | ❌ **ENDED June 1, 2024** | Was $30/mo internet discount + device credit |
| **Lifeline** | ✅ **Active** | $9.25/mo off phone/internet ($34.25 on Tribal lands) |

The FCC has issued a **consumer advisory warning about websites that still advertise the ACP**.
23 million households lost that benefit. There is a whole cottage industry of "free government
phone" sites trading on confusion — and it is a **trust landmine** if Base Impact echoes it.

**Also:** the FCC is moving to **prohibit commissions for Lifeline enrollment agents**
(47 CFR Part 54 Subpart E; see the 2026 Lifeline Reform rulemaking). Lifeline enrollment fraud is
aggressively enforced — the FCC has blocked providers from enrolling *any* new customers.

### Recommendation

- **Never enroll anyone. Never take a commission. Never charge a fee.** Those three rules are the
  whole game.
- Route people to **lifelinesupport.org** or their chosen carrier, or hand them to a trusted
  community org.
- **Build a short page that debunks the "free government phone" sites** and explains ACP vs Lifeline.
  This is a genuine public service and it positions Base Impact as the honest actor in the space.
- Verify current benefit amounts before publishing — they change.

---

## 3. ⚠️ R3 — HIGH: GPS / location detection is a privacy trap

The Florida Digital Bill of Rights (**SB 262 / FDBR**) defines **"precise geolocation"** as
**sensitive data**, alongside mental/physical health diagnosis, religious beliefs, sexual
orientation, and immigration status — all requiring consent and opt-out.

FDBR's *obligations* target for-profit entities above revenue thresholds, so **Base Impact is
probably exempt as a nonprofit** — but that is **not** a reason to build the feature. Think about
what the data actually is:

> "I searched for detox near me" **is a health disclosure.** Pairing that with a device location,
> an IP address, or a stored profile creates a record that could be subpoenaed, breached, or
> misused. For someone in recovery, that record can cost them a job or a custody case.

### Recommendation — the privacy-safe distance design

| Tier | Method | Storage | Notes |
|---|---|---|---|
| **1 (default)** | **ZIP code input** → centroid → sort by distance | none | No permission prompt. Works for everyone. Start here. |
| **2 (opt-in)** | "Use my location" → `navigator.geolocation` → **compute distance in the browser** | none | Coordinates **never** sent to your server |
| **3** | Address input → client-side geocode | none | Fallback for people who don't know their ZIP |

**Hard rules:** no cookies, no analytics, no session recording, no server-side logging of location
or search terms on help pages. The location exists in the browser tab and dies with it.

### 🔑 The insight that matters more than distance

**For someone without a car, mileage is nearly useless — transit access is what determines whether
they can actually get there.** A resource 1.2 miles away with no bus route is less reachable than
one 4 miles away on a line that runs every 20 minutes.

Add to every card:
- **Transit reachability** — "on SCAT Route 1" / "no transit access"
- **Walkability** — sidewalk / crossing conditions if you can get them
- **Call-ahead flag** — many services require a phone call before arriving

Distance alone would look sophisticated and help less.

---

## 4. ⚠️ R4 — HIGH: ID, Social Security cards & birth certificates

Helping people get documents is **legal and enormously valuable** — no ID means no job, no housing,
no benefits. It's a genuine choke point. But:

- Identity-document fraud is a serious crime, and you'd be adjacent to it.
- Holding scans or photocopies of SSN cards and birth certificates creates a breach liability that a
  volunteer-run nonprofit should never accept.

### Recommendation

**Never take custody of a document. Never store a scan. Never transmit one.**

The volunteer **accompanies** the person; the person holds their own paperwork at all times. You help
with *process* — which office, which form (SS-5 for a replacement SSN card), what proof, what fee,
how long — not with *data*. I've added ID/document resources as verified gateways (SSA, vital
records) rather than any service that handles documents for people.

---

## 5. R5 — MEDIUM: charitable solicitation & the 501(c)(3) gap

- **Ch. 496, F.S.** — Florida requires charitable organizations that solicit donations to
  **register with FDACS**. Do this when you start fundraising.
- **While 501(c)(3) is pending, donations are NOT tax-deductible.** The site says "pending," which
  is correct — but make the *deductibility* consequence explicit on any donation page, in plain
  words. Misleading donors on this is both a legal and a trust problem.

---

## 6. R6 — MEDIUM: "listed ≠ endorsed" is a shield, not armor

Your disclaimer is good and necessary. It reduces exposure but does not eliminate it if you refer
someone to a bad actor. Mitigations, in order:

1. A real **Terms / Disclaimer page** (linked in the footer, not just inline text)
2. **Documented verification** — you already log `lastVerified` + `verifiedBy` + `source`; keep it
3. **Insurance** once the board forms — D&O + general liability
4. A written **listing policy** — what you will and won't list, and why (this doubles as your defense)

---

## 7. R7 — MEDIUM: accessibility & language

- **WCAG 2.1 AA** is the floor. This audience skews older, lower-income, phone-first, and
  assistive-tech-dependent.
- **Spanish matters** in Orange, Brevard, and Indian River counties. A help site that only speaks
  English fails a large share of the people who need it. Haitian Creole too, in parts of Orange.
- Your current build already has: skip link, `aria-live` result counts, labeled inputs, focus rings,
  print styles. Keep that discipline.

---

## 8. 🎯 R8 — HIGHEST-ROI: you are one person, and a nonprofit is a shield

A Florida nonprofit needs **bylaws, a board of directors, and a conflict-of-interest policy**.
501(c)(3) applicants are expected to show a board (commonly 3+ unrelated directors).

**This is the single highest-return spend in the project.** Budget **$1,000–$3,000** for a Florida
nonprofit attorney. What it buys you:

- Incorporation and 1023 done right the first time
- A **corporate shield** — liability sits with the entity, not with Eric personally
- A board that shares the risk and the decisions
- Someone who can read the four statutes above and tell you what actually applies to you

Right now, every one of these risks is landing on you personally. That's the thing to fix first.

---

## 9. What I changed in the code because of this review

- Added `population` to the schema (`veterans`, `reentry`, `disability`, `seniors`, `youth`,
  `families`, `recovery`, `immigrants`, `unhoused`) so "housing for all types of people" is
  filterable without inventing new categories.
- Added `licenseNumber` / `licensingAuthority` fields — **unused in v1 seed data on purpose**, ready
  if you decide to list facilities.
- Added **8 verified gateway resources** instead of facility listings: Lifeline, SSA, Florida DCF
  ACCESS, HUD/Florida Housing, VA, AHCA Facility Locator, APD, and the Elder Affairs/ADRC line.

---

## 10. Recommended order of work

| # | Task | Why now |
|---|---|---|
| 1 | Retain a nonprofit attorney; form the board | Converts personal risk into corporate risk |
| 2 | Write the **listing policy** (what you won't list) | Your defense, and it's free |
| 3 | Build the **Lifeline / ACP debunk page** | High value, zero legal risk, differentiates you |
| 4 | Implement **ZIP-first distance** + transit info | The feature people actually need |
| 5 | Verify and fill the 10 `[SAMPLE]` placeholders | Turns the scaffold into something usable |
| 6 | Terms page + FDACS charitable registration | Before any fundraising |
| 7 | Spanish translation pass | Serves a large share of the service area |
| 8 | Wire submissions to storage (D1/KV/email) | Currently validated, logged, and dropped |
