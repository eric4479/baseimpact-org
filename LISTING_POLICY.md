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
| **Treatment providers we haven't verified** | § 817.505 makes paid referral a felony; unverified referral is a trust failure. | Link **SAMHSA** and **FindTreatment.gov**. |
| **"Free government phone" / ACP sites** | ACP **ended June 1, 2024**. The FCC has warned about sites still advertising it. | Link **Lifeline Support Center** and explain the difference. |
| **Any organization that pays to appear** | 501(c)(3) private-benefit rule; § 817.505. | We accept **zero** compensation for listings. Period. |
| **Services that handle ID/SSN documents for people** | Document custody creates breach liability and fraud exposure. | Link **SSA** and **vital records** offices; a volunteer may accompany, never hold. |
| **Political or advocacy organizations** | 501(c)(3) limits on political activity. | Out of scope for a resource directory. |
| **For-profit businesses** (unless they are the licensed gateway) | A directory of paid services is an ad platform, not a help hub. | Exception: the official program itself (e.g. a Lifeline carrier's own enrollment page). |

---

## 4. The verification standard

A listing goes live only when a human has confirmed it. "Found it on Google" is not verification.

**Minimum to list:**
- [ ] Called the number, or visited in person, or confirmed via an official website
- [ ] Confirmed it is currently operating
- [ ] Recorded hours, cost, and eligibility if available
- [ ] Set `last_verified` to today's date
- [ ] Named who verified it

**Re-verification:** every record is re-checked **quarterly**. Anything older than **120 days**
automatically renders a "⚠ Call ahead" warning on the site.

**If a record can't be verified:** it either doesn't go up, or it goes up with
`verification.status: 'pending'` and a visible badge. It never goes up silently.

---

## 5. The SAMPLE rule

`verification.status: 'sample'` is a **placeholder**. It renders a loud SAMPLE badge and is
intended to be replaced with a real, verified organization.

**A SAMPLE record must never:**
- Present a real organization's name without verification
- Show a phone number we haven't called
- Be mistaken for a live listing by a volunteer or a visitor

When a SAMPLE is replaced, the new record starts at `pending` and only becomes `verified` after a
human confirms it.

---

## 6. Corrections and takedowns

Anyone can report a problem through the **Suggest a Resource** form. We treat every report as
legitimate until proven otherwise.

- **Wrong number / closed** → mark `status: 'closed'` within 48 hours
- **Changed hours or location** → update and re-stamp `last_verified`
- **Disputed listing** → remove pending review; a human decides
- **Legal concern** → remove immediately, document the reason, escalate to the board

---

## 7. What "listed" means

**Listed ≠ endorsed.**

A listing means: *we confirmed this organization exists and is operating.* It does **not** mean:
- We vouch for the quality of their services
- We recommend them over another option
- We have inspected their facilities
- We are responsible for what happens when you contact them

This distinction is printed on every page and on every card.

---

## 8. The compensation rule (non-negotiable)

**Base Impact accepts zero compensation for any listing or referral.**

No ads. No "featured" placements. No sponsorships. No affiliate links. No data sales. No "premium"
listings. No exceptions, no matter how reasonable the offer sounds.

This is not a policy we can waive. It is a legal requirement under **F.S. § 817.505** (Florida
Patient Brokering Act) and a condition of **501(c)(3)** status.

---

## 9. Review cadence

| What | How often | Who |
|---|---|---|
| Re-verify all listings | Quarterly | Volunteers |
| Review this policy | Annually | Board |
| Audit for stale records | Monthly (automated) | System |
| Review SAMPLE replacements | As submitted | Volunteer + reviewer |

---

*This policy is a living document. If a volunteer or board member believes something here is wrong,
outdated, or missing, they should raise it — the policy exists to protect the people we serve and
the people who serve them.*
