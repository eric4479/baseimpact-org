/**
 * Validates the resource listings before a build is allowed to ship.
 *
 * The directory's whole value is that a person in trouble can act on what it says. A
 * wrong phone number or a "check the website" line pointing at nothing sends somebody
 * on a wasted trip, so the rules here fail the build rather than printing a warning
 * nobody reads.
 *
 * Loads the real module through Vite, so this validates exactly what ships - including
 * TypeScript and the "@/" alias - rather than a re-parsed approximation of it.
 *
 *   node scripts/validate-resources.mjs
 *
 * Exit 0 = shippable. Exit 1 = a rule below was broken.
 */
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const server = await createServer({
  root,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
  // Without this, Vite's dependency scanner keeps running while we call server.close()
  // below and fails with "The server is being restarted or closed". We never load a
  // browser entry, so there is nothing to pre-bundle.
  optimizeDeps: { noDiscovery: true, include: [] },
});

let mod;
try {
  mod = await server.ssrLoadModule("/src/lib/resources/index.ts");
} finally {
  // ssrLoadModule keeps the server alive; the process would hang without this.
  await server.close();
}

const {
  ALL_RESOURCES, CATEGORIES, BREVARD_RESOURCES, VOLUSIA_RESOURCES,
  ORANGE_RESOURCES, STATEWIDE_RESOURCES, telHref, servicePageLabel, domainOf,
} = mod;

const failures = [];
const warnings = [];
const fail = (id, msg) => failures.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

const KNOWN_COUNTIES = new Set(["Brevard", "Volusia", "Orange", "Statewide"]);
const KNOWN_CATEGORIES = new Set(CATEGORIES.filter((c) => c !== "All"));
const KNOWN_TRIAGE = new Set(["shelter", "food", "travel", "id_tech"]);

const isUrl = (s) => {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const seenIds = new Map();
const seenPlaces = new Map();

for (const res of ALL_RESOURCES) {
  const id = res.id ?? "(no id)";

  // --- identity -----------------------------------------------------------
  if (seenIds.has(res.id)) fail(id, `duplicate id, also used by ${seenIds.get(res.id)}`);
  seenIds.set(res.id, res.name);

  if (!/^res-\d+$/.test(res.id ?? "")) fail(id, `id does not match res-<number>`);

  const placeKey = `${(res.name ?? "").trim().toLowerCase()}|${(res.address ?? "").trim().toLowerCase()}`;
  if (seenPlaces.has(placeKey)) {
    fail(id, `same name and address as ${seenPlaces.get(placeKey)} - probably one organization listed twice`);
  }
  seenPlaces.set(placeKey, id);

  // --- required text ------------------------------------------------------
  for (const field of ["name", "category", "address", "description", "hoursText",
                       "partnerType", "capacityStatus", "triageCategory", "county"]) {
    if (typeof res[field] !== "string" || res[field].trim() === "") {
      fail(id, `${field} is empty`);
    }
  }

  if (!KNOWN_CATEGORIES.has(res.category)) fail(id, `unknown category "${res.category}"`);
  if (!KNOWN_COUNTIES.has(res.county)) fail(id, `unknown county "${res.county}"`);
  if (!KNOWN_TRIAGE.has(res.triageCategory)) fail(id, `unknown triageCategory "${res.triageCategory}"`);

  // --- coordinates --------------------------------------------------------
  const { lat, lng } = res;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    fail(id, `lat/lng not finite (${lat}, ${lng})`);
  } else if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    fail(id, `lat/lng out of range (${lat}, ${lng})`);
  } else if (lat === 0 && lng === 0 && (res.address ?? "").trim() !== "") {
    // A real address at Null Island is a missing geocode, and it silently ruins the
    // distance sort - the entry lands near the Gulf of Guinea and sorts as farthest.
    fail(id, "lat/lng is 0,0 but the entry has an address (missing geocode)");
  }

  // --- links --------------------------------------------------------------
  if (res.website && !isUrl(res.website)) fail(id, `website is not a usable http(s) URL: ${res.website}`);
  if (res.serviceUrl && !isUrl(res.serviceUrl)) fail(id, `serviceUrl is not a usable http(s) URL: ${res.serviceUrl}`);
  if (res.website && res.serviceUrl && res.website === res.serviceUrl) {
    fail(id, "serviceUrl is identical to website and should be omitted");
  }

  if (res.website) {
    // A deep path in `website` means the homepage is still missing, which is what the
    // visitor needs to judge whether an organization is legitimate.
    const path = (() => { try { return new URL(res.website).pathname; } catch { return "/"; } })();
    if (path !== "/" && path !== "") {
      warn(id, `website looks like a deep page, not a homepage: ${domainOf(res.website)}${path}`);
    }
  }

  // --- the defect that shipped ------------------------------------------
  // Hours or description telling the reader to check a website, or to call, when the
  // entry carries neither. This is exactly how a listing ended up saying "Rotating
  // schedule - check the website" with nothing clickable next to it.
  //
  // Matched on INSTRUCTIONS ("check the website", "call for hours") rather than on the
  // bare words. An entry that says "no published phone number" is being honest about
  // the gap, and flagging it would train whoever runs this to delete the honesty
  // instead of the problem.
  const prose = `${res.hoursText ?? ""} ${res.description ?? ""}`;
  // Denials are tracked PER FIELD. A single combined flag let "no published phone
  // number" cancel a "check the website" instruction in the same sentence pair, so an
  // entry could still tell the reader to open a site it does not have.
  const deniesPhone = /\bno (published |public |listed )?(phone|number|telephone)\b/i.test(prose);
  const deniesSite = /\bno (published |public |listed )?(website|web ?site|webpage|site|online presence)\b/i.test(prose);
  const mentionsSite =
    /\b(check|see|visit|use|on)\s+(the\s+|their\s+|its\s+|our\s+|a\s+)?(website|web site|webpage|facebook|fb page|facebook page|page|site)\b/i.test(prose);
  const mentionsCall =
    /\b(call|phone|ring)\s+(for|to|ahead|before|first|us|them|the\s+\w+)\b/i.test(prose) ||
    /\bcall ahead\b/i.test(prose) ||
    /\bcall to confirm\b/i.test(prose);
  const phone = (res.phone ?? "").trim();
  const hasAnyLink = Boolean(res.website || res.serviceUrl);

  if (mentionsSite && !hasAnyLink && !deniesSite) {
    fail(id, "text tells the reader to check a website, but the entry has no website");
  }
  if (mentionsCall && phone === "" && !hasAnyLink && !deniesPhone) {
    fail(id, "text tells the reader to call, but the entry has no phone and no website");
  }

  // --- phone --------------------------------------------------------------
  if (phone !== "") {
    const href = telHref(phone);
    const digits = href.replace(/^tel:/, "").split(";")[0].replace(/\D/g, "");
    const isShortCode = ["211", "911", "988"].includes(digits);
    const isStarCode = /^\*\d+$/.test(href.replace(/^tel:/, "").split(";")[0]);
    if (!href.startsWith("tel:")) fail(id, `phone does not produce a tel: link (${phone})`);
    else if (!isShortCode && !isStarCode && digits.length < 10) {
      fail(id, `phone "${phone}" produces an undialable ${digits.length}-digit link`);
    } else if (digits.length > 11) {
      fail(id, `phone "${phone}" produces ${digits.length} digits - an extension was probably concatenated`);
    }
  }

  // --- schedule -----------------------------------------------------------
  if (res.schedule && typeof res.schedule === "object") {
    const days = Object.entries(res.schedule);
    if (days.length > 0 && (res.hoursText ?? "").trim() === "") {
      fail(id, "has a schedule but no hoursText to display");
    }
    for (const [day, ranges] of days) {
      const d = Number(day);
      if (!Number.isInteger(d) || d < 0 || d > 6) fail(id, `schedule has invalid weekday key "${day}"`);
      if (!Array.isArray(ranges)) { fail(id, `schedule[${day}] is not an array`); continue; }
      for (const r of ranges) {
        if (!Array.isArray(r) || r.length !== 2) { fail(id, `schedule[${day}] has a malformed range`); continue; }
        const [open, close] = r;
        if (!Number.isFinite(open) || !Number.isFinite(close)) fail(id, `schedule[${day}] has non-numeric hours`);
        else if (open < 0 || close > 24) fail(id, `schedule[${day}] outside 0-24 (${open}-${close})`);
        else if (open >= close) fail(id, `schedule[${day}] opens at or after it closes (${open}-${close})`);
      }
    }
  }

  // --- provenance ---------------------------------------------------------
  if (!res.sourceUrl) {
    warn(id, "no sourceUrl - the fact this entry came from is not recorded");
  } else if (!isUrl(res.sourceUrl)) {
    fail(id, `sourceUrl is not a usable http(s) URL: ${res.sourceUrl}`);
  }

  if (res.lastVerified) {
    const t = Date.parse(res.lastVerified);
    if (Number.isNaN(t)) fail(id, `lastVerified is not a date: ${res.lastVerified}`);
    else if (t > Date.now() + 24 * 3600 * 1000) fail(id, `lastVerified is in the future: ${res.lastVerified}`);
    else {
      const days = Math.floor((Date.now() - t) / 86_400_000);
      if (days > 180) warn(id, `last verified ${days} days ago`);
    }
  } else {
    warn(id, "no lastVerified date");
  }
}

// --- cross-file sanity -----------------------------------------------------
const parts = { BREVARD_RESOURCES, VOLUSIA_RESOURCES, ORANGE_RESOURCES, STATEWIDE_RESOURCES };
const summed = Object.values(parts).reduce((n, a) => n + a.length, 0);
if (summed !== ALL_RESOURCES.length) {
  fail("ALL_RESOURCES", `holds ${ALL_RESOURCES.length} entries but its parts hold ${summed}`);
}

// --- report ----------------------------------------------------------------
const label = (s) => `  ${s}`;
if (warnings.length) {
  console.log(`\nvalidate-resources: ${warnings.length} warning(s)\n`);
  for (const w of warnings) console.log(label(w));
}
if (failures.length) {
  console.error(`\nvalidate-resources: ${failures.length} PROBLEM(S)\n`);
  for (const f of failures) console.error(label(f));
  console.error("\nRefusing to build. Fix the entries above, or the directory ships information people cannot act on.\n");
  process.exit(1);
}

console.log(
  `\nvalidate-resources: ${ALL_RESOURCES.length} entries OK` +
  ` (${BREVARD_RESOURCES.length} Brevard, ${VOLUSIA_RESOURCES.length} Volusia,` +
  ` ${ORANGE_RESOURCES.length} Orange, ${STATEWIDE_RESOURCES.length} statewide)` +
  `${warnings.length ? `, ${warnings.length} warning(s)` : ""}\n`,
);