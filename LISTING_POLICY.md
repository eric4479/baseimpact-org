# Base Impact — Listing Policy

**What we list, what we don't, and why.** This is both an operational guide for volunteers and a
defensible record of the judgment behind every decision. If anyone ever asks "why is this on your
site?" — this document is the answer.

**Last reviewed:** 2026-10-06

---

## 1. The governing principle

> **Base Impact is a router, not a provider.**

We connect people to help. We do not provide the help ourselves, we do not enroll anyone in a
program, we do not take custody of documents, and we do not accept compensation for any listing or
referral.

Everything below follows from that one sentence.

---

## 2. What we WILL list

| Type | Examples | Why |
|---|---|---|
| **Licensed gateways** | AHCA facility locator, APD, HUD, SSA, DCF MyACCESS, VA | The official, accountable entry point. Carries its own license numbers and oversight. |
| **Government programs** | Lifeline, SNAP/Medicaid/TANF, CareerSource, 211 | Public programs with public accountability. |
| **Verified partner organizations** | No One Hungry, LifePointe Ministries, Under The Bridge | Organizations we work alongside and have confirmed directly. |
| **Accredited helplines** | 988, SAMHSA, VA homeless veterans, Elder Helpline | National infrastructure with published standards. |
| **Community organizations** | Churches, food pantries, support groups | Local, human-scale help that big directories miss. |
| **Named local treatment & recovery providers** | Circles of Care, local detox and outpatient programs | The local name a person in crisis can actually reach. See §3a for the three conditions. |

**Every listing must have:**
- A name we can confirm exists
- At least one contact method we have verified (phone, website, or in-person)
- A `last_verified` date and a `verified_by` name
- A `source` — where the information came from

---

## 3. What we will NOT list

| Type | Why | What we do instead |
|---|---|---|
| **Residential care facilities** (ALFs, group homes, sober living) | Licensed by AHCA/APD/FARR under Ch. 429, § 397.487. § 429.47 requires license numbers in advertising. | Link the **AHCA facility locator** and **APD** — they carry the license numbers. |
| **Treatment providers with no source we can point to** | § 817.505 makes *paid* referral a felony; an unsourced listing is a trust failure. | Link **SAMHSA** and **FindTreatment.gov**. |
| **"Free government phone" / ACP sites** | ACP **ended June 1, 2024**. The FCC has warned about sites still advertising it. | Link **Lifeline Support Center** and explain the difference. |
| **Any organization that pays to appear** | 501(c)(3) private-benefit rule; § 817.505. | We accept **zero** compensation for listings. Period. |
| **Services that handle ID/SSN documents for people** | Document custody creates breach liability and fraud exposure. | Link **SSA** and **vital records** offices; a volunteer may accompany, never hold. |
| **Political or advocacy organizations** | 501(c)(3) limits on political activity. | Out of scope for a resource directory. |
| **For-profit businesses** (unless they are the licensed gateway) | A directory of paid services is an ad platform, not a help hub. | Exception: the official program itself (e.g. a Lifeline carrier's own enrollment page). |

---

## 3a. Named local treatment and recovery providers — we DO list these

**A person in crisis needs the name of the local detox, not a federal search box.** Listing a
named provider is legal and it is useful, so we do it.

**Why it is legal.** F.S. § 817.505 (the Patient Brokering Act) criminalizes *paying or receiving
compensation* for a client referral. It does **not** prohibit a free directory from naming a
provider. Our compensation rule (§9) is absolute, so the statute is not engaged.

**The three conditions.** We list a named treatment or recovery provider only when **all** hold:

1. **No compensation, ever** — no fee, no gift, no in-kind, no affiliate link (§9).
2. **A source we can point to** — the provider's own site, or a government page (§4). Source URL
   and date are recorded in `data/sources.csv`.
3. **No clinical claim.** We describe what the organization says it offers. We never say a
   provider is "the best", "recommended", "licensed by us", or that we screened it.

**We always list the federal gateways alongside** — **SAMHSA National Helpline (1-800-662-4357)**
and **FindTreatment.gov**. A local listing is a shortcut, never the only door.

**Residential facilities are still different.** A sober-living or residential facility must show
its **license number** (F.S. § 429.47). Until we have that number, we link the **AHCA facility
locator** instead of listing the facility. That rule does not change.

---

## 4. Our listing standard

**We compile from public sources. We do not call, visit, or inspect every location.**

A listing goes up when we can read the information from a source we can point to.

**Accepted sources:**
- The organization's **own official website**
- The organization's **public Facebook page** or other verified social account
- A **government program page** — 211, AHCA, HUD, DHS, CareerSource, SSA, VA
- A **referral from a partner organization or a community member**, cross-checked against one of
  the above before it appears

**What we record:** the source and the date we read it. That record exists so we can answer
*"where did this come from?"* — it is **not** a claim that we contacted the organization.

**What we do NOT claim — on the site or anywhere else:**

| We do not claim | Why |
|---|---|
| That we called the organization | We don't, as a rule |
| That we visited or inspected the location | We don't |
| That hours, eligibility, or cost are currently accurate | They change without notice |
| That the listing is complete or ranked | It is a starting point |

**Standing advice on every listing: call ahead.** This is printed on every card.

**Re-checking.** Listings are **not** individually re-verified on a schedule. Corrections arrive
from community reports and from periodic sweeps of the source pages. A listing shown to be wrong
is corrected or removed within 48 hours.

---

## 5. Where we sit relative to 211

**Base Impact is a supplement to 211, not a replacement for it.**

211 maintains a statewide, staffed, verified resource database with live specialists. We cannot
match that and we do not try. Our value is narrow and local: the North Brevard organizations that
bigger directories miss, presented simply.

**We point people to 211 for the full county-wide picture** — on the homepage, on the guide, and
on every page footer. If someone needs a complete answer, 211 is the answer.

**We will not:** describe ourselves as a resource database, claim statewide coverage, or position
the guide as a substitute for calling 211.

---

## 6. The SAMPLE rule

`verification.status: 'sample'` is a **placeholder**. It renders a loud SAMPLE badge and is
intended to be replaced with a real organization.

**A SAMPLE record must never:**
- Present a real organization's name without a source
- Show a phone number we have not seen published by that organization
- Be mistaken for a live listing by a volunteer or a visitor

When a SAMPLE is replaced, the new record is added from a real source and the badge disappears.

---

## 7. Corrections and takedowns

Anyone can report a problem through the **Suggest a Resource** form. We treat every report as
legitimate until proven otherwise.

- **Wrong number / closed** → correct or remove within 48 hours
- **Changed hours or location** → update from the new source
- **Disputed listing** → remove pending review
- **Legal concern** → remove immediately, document the reason, escalate to the board

### 7a. Removal on request — an organization's right

**Any organization listed here can ask to be removed, for any reason, and we remove it.**

No justification required. We do not argue, we do not ask them to reconsider, and we do not
require them to explain. A listing is a courtesy, not a right we hold over them.

**How to ask:**

| Channel | Detail |
|---|---|
| **Form** | `/removal` — the fastest route |
| **Email** | `info@baseimpact.org`, subject line "Removal request" |
| **Phone** | The number in the site footer |

**What we do:**

1. **Acknowledge within 2 business days.**
2. **Remove or suppress the listing within 5 business days** — sooner if asked urgently.
3. **Record the request** in `data/removals.csv` (organization, date, channel, who handled it).
   We keep this log so we can prove we honored the request, and so the listing does not silently
   reappear at the next data refresh.
4. **Mark it permanently excluded** so a future import cannot restore it.

**If we believe the listing is genuinely useful to the community,** we may say so **once** — but
the organization decides, and their decision is final. No means no.

**Why this policy exists:** a directory that will not remove a listing on request is publishing
about someone without their consent. That is both a reputational and a legal risk, and it is not
how a community organization should behave.

---

## 8. What "listed" means

**Listed ≠ endorsed.**

A listing means: *we found this organization described on a source we can point to.* It does
**not** mean:
- We have contacted them
- We vouch for the quality of their services
- We recommend them over another option
- We have inspected their facilities
- We are responsible for what happens when you contact them

This distinction is printed on every page and on every card.

---

## 9. The compensation rule (non-negotiable)

**Base Impact accepts zero compensation for any listing or referral.**

No ads. No "featured" placements. No sponsorships. No affiliate links. No data sales. No "premium"
listings. No exceptions, no matter how reasonable the offer sounds.

This is not a policy we can waive. It is a legal requirement under **F.S. § 817.505** (Florida
Patient Brokering Act) and a condition of **501(c)(3)** status.

---

## 10. Review cadence

| What | How often | Who |
|---|---|---|
| Sweep source pages for changes | Quarterly | Volunteers / automated |
| Review this policy | Annually | Board |
| Action community corrections | Within 48 hours | Whoever sees it |
| Audit for SAMPLE records | Monthly | System |

---

*This policy is a living document. If a volunteer or board member believes something here is wrong,
outdated, or missing, they should raise it — the policy exists to protect the people we serve and
the people who serve them.*
