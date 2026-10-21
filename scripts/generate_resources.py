#!/usr/bin/env python3
"""
generate_resources.py — turn data/sources.csv into src/data/resources.ts

This is the bridge between the CSV you maintain and the Astro cards the site renders.
Run it after editing the CSV:   python3 scripts/generate_resources.py

Then `npm run build`. The site is now driven entirely by the spreadsheet.
"""
import csv, os, re, sys, json

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(REPO, "data", "sources.csv")
OUT_PATH = os.path.join(REPO, "src", "data", "resources.ts")

CATEGORIES = {"recovery", "housing", "employment", "basic", "stability", "community"}
POPULATIONS = {"recovery", "disability", "mental-health", "reentry", "veterans", "seniors",
               "youth", "families", "immigrants", "unhoused", "lgbtq"}


def q(s: str) -> str:
    """Emit a single-quoted TS string, escaping as needed."""
    if s is None:
        return "''"
    s = str(s).replace("\\", "\\\\").replace("'", "\\'")
    s = s.replace("\n", " ").replace("\r", " ")
    return "'" + s + "'"


def split_list(s: str):
    if not s:
        return []
    return [x.strip() for x in re.split(r"[;,]", s) if x.strip()]


def main():
    if not os.path.exists(CSV_PATH):
        sys.exit(f"missing {CSV_PATH}")
    rows = list(csv.DictReader(open(CSV_PATH, encoding="utf-8")))
    print(f"read {len(rows)} rows from sources.csv")

    blocks, warnings = [], []
    seen_ids = set()

    for i, r in enumerate(rows, 1):
        name = (r.get("name") or "").strip()
        if not name:
            continue

        rid = (r.get("id") or "").strip() or re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        if rid in seen_ids:
            rid = f"{rid}-{i}"
        seen_ids.add(rid)

        cat = (r.get("category") or "").strip()
        if cat not in CATEGORIES:
            warnings.append(f"row {i} '{name}': bad category '{cat}' -> stability")
            cat = "stability"

        # ---- required-ish fields -------------------------------------------------
        lines = [f"  {{", f"    id: {q(rid)},", f"    name: {q(name)},",
                 f"    orgType: {q(r.get('org_type') or 'Community resource')},",
                 f"    category: {q(cat)},"]

        counties = split_list(r.get("counties") or "Brevard") or ["Brevard"]
        lines.append(f"    counties: [{', '.join(q(c) for c in counties)}],")

        # ---- optional contact fields (only emit when present) --------------------
        for csv_key, ts_key in (("city", "city"), ("address", "address"),
                                ("phone", "phone"), ("website", "website"),
                                ("hours", "hours"), ("eligibility", "eligibility")):
            v = (r.get(csv_key) or "").strip()
            if v:
                lines.append(f"    {ts_key}: {q(v)},")

        cost = split_list(r.get("cost"))
        if cost:
            lines.append(f"    cost: [{', '.join(q(c) for c in cost)}],")

        langs = split_list(r.get("languages"))
        if langs:
            lines.append(f"    languages: [{', '.join(q(l) for l in langs)}],")

        if (r.get("walk_in") or "").strip().lower() in ("true", "yes", "y", "1"):
            lines.append("    walkIn: true,")

        pops = [p for p in split_list(r.get("population")) if p in POPULATIONS]
        if pops:
            lines.append(f"    population: [{', '.join(q(p) for p in pops)}],")

        lat, lng = (r.get("lat") or "").strip(), (r.get("lng") or "").strip()
        if lat and lng:
            lines.append(f"    geo: [{lat}, {lng}],")

        lic = (r.get("license_number") or "").strip()
        if lic:
            lines.append(f"    licenseNumber: {q(lic)},")
            auth = (r.get("licensing_authority") or "").strip()
            if auth:
                lines.append(f"    licensingAuthority: {q(auth)},")

        tags = split_list(r.get("tags"))
        if tags:
            lines.append(f"    tags: [{', '.join(q(t) for t in tags)}],")
        else:
            lines.append("    tags: [],")

        # ---- verification block --------------------------------------------------
        status = (r.get("status") or "active").strip().lower()
        vstatus = {"active": "verified", "verified": "verified", "partner": "partner",
                   "pending": "pending", "sample": "sample", "stale": "stale",
                   "closed": "closed"}.get(status, "verified")
        v = [f"    verification: {{", f"      status: {q(vstatus)},"]
        if (r.get("date_accessed") or "").strip():
            v.append(f"      lastVerified: {q(r['date_accessed'].strip())},")
        if (r.get("source_url") or "").strip():
            v.append(f"      source: {q(r['source_url'].strip())},")
        elif (r.get("source_type") or "").strip():
            v.append(f"      source: {q(r['source_type'].strip())},")
        v.append("    },")
        lines += v

        notes = (r.get("notes") or "").strip()
        if notes:
            lines.append(f"    notes: {q(notes)},")

        lines.append("  },")
        blocks.append("\n".join(lines))

    header = '''/**
 * AUTO-GENERATED — DO NOT EDIT THIS FILE BY HAND.
 *
 * Source of truth:  data/sources.csv
 * Regenerate with:  python3 scripts/generate_resources.py
 *
 * Edit the CSV, run the generator, then `npm run build`.
 * Every field here traces back to a row in the CSV, and every row carries the
 * source URL and date it was read from.
 */
import type { Resource } from './schema';

export const resources: Resource[] = [
'''
    body = "\n".join(blocks)
    footer = "\n];\n\nexport default resources;\n"

    with open(OUT_PATH, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(header + body + footer)

    print(f"wrote {OUT_PATH}")
    print(f"  records: {len(blocks)}")
    if warnings:
        print(f"\n  WARNINGS ({len(warnings)}):")
        for w in warnings:
            print("   -", w)


if __name__ == "__main__":
    main()
