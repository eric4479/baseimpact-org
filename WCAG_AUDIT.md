# WCAG 2.1 AA Audit — baseimpact.org

**Date:** 2026-10-07
**Auditor:** automated (axe-core 4.14) + programmatic keyboard/screen-reader checks
**Scope:** all 17 public prerendered routes
**Standard:** WCAG 2.1 Level AA (plus WCAG 2.2 AA SC 2.5.8 Target Size, Minimum)
**Production:** https://baseimpact.org · repo `eric4479/baseimpact-org`

---

## What this is, and what it is not

This is an **automated and programmatic review**. It is not a substitute for:

- a manual screen-reader walkthrough (NVDA, JAWS, VoiceOver) with a human
- testing with users with disabilities
- an expert accessibility review before making a conformance claim

Automated tooling reliably finds roughly **30–40%** of WCAG issues. A clean automated
report is necessary but not sufficient for conformance.

Reproduce any number below with:

```bash
cd /home/eric/projects/baseimpact-live

# 1. Prove the harness can actually detect failures before trusting a clean result
/home/eric/.venv/bin/python scripts/wcag-audit.py --self-test

# 2. Audit the live site
/home/eric/.venv/bin/python scripts/wcag-audit.py --base https://baseimpact.org

# 3. Audit a local build
npm run build
python3 -m http.server 8899 --directory dist --bind 127.0.0.1 &
/home/eric/.venv/bin/python scripts/wcag-audit.py --base http://127.0.0.1:8899 --flat
```

`--self-test` injects three deliberate WCAG AA failures (low contrast, missing image
alt, unlabelled input) into a real page and asserts axe catches all three. Without it, a
"0 violations" report from a broken harness would be indistinguishable from a clean site.

---

## Methodology

axe-core is injected via CDP `Page.addScriptToEvaluateOnNewDocument`, so it runs before
any page script and sees the real DOM. Testing runs at **390×844** (iPhone-class) —
auditors commonly test desktop and miss that the target audience is on a phone, often a
cracked one, often in bad light.

Rules evaluated: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`.

Beyond axe, the harness checks what axe cannot: landmarks, heading order, skip link,
focus-ring visibility, tap-target size, and text contrast.

**Contrast measurement note.** Tailwind v4 emits `oklch()` colours, so
`getComputedStyle().color` returns e.g. `oklch(0.55 0.02 250)`. Naive `[\d.]+` regex
parsing of that produces meaningless RGB and false failures at ratios like 1.05. The
harness instead paints the colour to a canvas and reads the pixel back, which is exact
for every CSS colour syntax and composites translucent layers properly.

---

## Findings — before remediation

Run against production at audit start.

| # | Finding | SC | Severity | Pages |
|---|---------|----|----------|-------|
| 1 | **No `tel:911` anywhere.** Site lists 211 and 988 but not emergency services | 2.4.1 / best practice | **High** — content gap on a crisis site | 0/17 |
| 2 | **Directory filter buttons ~28×N px** (e.g. `Rent Help` 76×28) | 2.5.8 (2.2 AA), 2.5.5 (AAA) | Moderate | 407 instances on `/directory` |
| 3 | **Footer crisis links ~17 px tall** — 211, 988, main phone | 2.5.8 (2.2 AA) | **Moderate–High** — these are the most important links on the site | 4 × 17 pages |
| 4 | **Footer legal links 20 px tall** | 2.5.8 | Low | 4 × 17 pages |
| 5 | **Brand/home link 40 px tall** | 2.5.8 | Low | 17 |

### Severity honesty

Tap-target size was **not a WCAG 2.1 AA failure**. 44×44 is SC 2.5.5 at **Level AAA**;
WCAG 2.2 introduced 2.5.8 Target Size (Minimum) at **AA** with a 24×24 floor. These
findings are reported against the 2.2 AA standard and against real-world difficulty
for users with motor impairments — not inflated to a 2.1 AA failure.

The footer crisis links were still treated as the priority. Someone on a cracked phone
in a crisis trying to tap **988** is the exact user this site exists for, and a 17px
target fails them even though it technically passes the older standard.

---

## Remediation applied

All fixes in `src/components/site-shell.tsx` and `src/pages/directory.tsx`.

1. **Added `tel:911` "for immediate danger"** to the footer crisis row, completing the
   escalation path 211 → 988 → 911.
2. **Footer crisis + phone links** → `inline-flex min-h-11 min-w-11 items-center
   justify-center px-2 py-1`. `988` rendered 25px wide and `911` 20px, both under the
   24px AA floor despite sufficient height; horizontal padding clears it.
3. **Directory filter buttons** → `min-h-11` with `px-3 py-2` (was `px-2.5 py-1.5`).
4. **Footer legal links** → `inline-flex min-h-11 items-center`.
5. **Brand link** → `min-h-11`.

Text flow and visual density are unchanged; only hit areas grew.

### Safety check on the contact number

The footer contact number was edited by script, never by hand, because tooling that
round-trips text through a redaction layer can silently write a masked value into the
source. `apply_wcag_fixes.py` asserts the `tel:` href is byte-identical to `HEAD`
before and after, and verification confirmed:

- original 3 `tel:` hrefs preserved in order (SHA-256 match against `HEAD`)
- the **only** addition is `tel:911`
- all `tel:` hrefs are digits-only

---

## Findings — after remediation

Local build, 17/17 routes:

```
axe violations: 0 | sub-44px targets: 0 | contrast fails: 0
```

| Metric | Before | After |
|--------|--------|-------|
| axe violations (WCAG 2.1 A/AA + best-practice) | 0 | 0 |
| Sub-44px tap targets | 407 + ~100 site-wide | **0** |
| Text contrast failures | 0 | **0** |
| Pages with `tel:211` | 17/17 | 17/17 |
| Pages with `tel:988` | 17/17 | 17/17 |
| Pages with `tel:911` | **0/17** | **17/17** |
| `lang` attribute | 17/17 | 17/17 |
| Single `<h1>` | 17/17 | 17/17 |
| Heading-order jumps | 0 | 0 |
| Skip link | 17/17 | 17/17 |
| Images missing `alt` | 0 | 0 |
| Unlabelled form controls | 0 | 0 |
| Focus ring removed | 0 | 0 |
| Links with no accessible name | 0 | 0 |

axe itself reported 0 violations *before* remediation as well — findings 1–5 are all
outside axe's detection surface, which is precisely why the manual checks exist.

---

## Still outstanding

Not addressed in this pass:

- **No real screen-reader testing.** Highest-value next step.
- **No 200% zoom / 400% reflow check** (SC 1.4.10). Needs manual verification.
- **No keyboard-only walkthrough** of `/log` (password entry, Messages tab) or the
  directory's live-filter interactions. Automated focus checks confirm a focus ring
  exists; they do not confirm a logical focus *order*.
- **No verification that error states are announced.** Form status regions were added
  with `aria-live`, but announcement with a real screen reader is unverified.
- **Colour is not the sole means of conveying information** (SC 1.4.1) — unverified,
  particularly in the resource status badges.
- **Form consent wording** is not yet reconciled with the 90-day retention policy.
- Text contrast was measured in the default theme only; the dark theme is unverified.

---

## Legal note

A published accessibility conformance claim ("WCAG 2.1 AA compliant") is a legal
statement. Given the site handles crisis and health-adjacent information, publish an
honest partial statement plus a contact route for reporting barriers rather than an
unqualified claim. Recommend:

1. Publish this audit and its "not a substitute" caveat alongside a barrier-reporting
   contact.
2. Complete the manual screen-reader and reflow passes.
3. Have an accessibility professional review before any conformance claim.

---

## Files

| Path | Purpose |
|------|---------|
| `scripts/wcag-audit.py` | Repeatable self-validating audit (shipped) |
| `apply_wcag_fixes.py` | Phone-number-safe remediation script (scratch) |
| `wcag-report.json` | Machine-readable output |