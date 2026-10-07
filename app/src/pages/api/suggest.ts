import type { APIRoute } from 'astro';
import { CATEGORIES } from '../../data/schema';
import { REGION } from '../../config/region';

// This is the only on-demand route in the site; every page is prerendered.
export const prerender = false;

const MAX = 2000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function clean(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, MAX) : '';
}

export const POST: APIRoute = async ({ request }) => {
  let raw: Record<string, unknown>;

  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      raw = (await request.json()) as Record<string, unknown>;
    } else {
      const fd = await request.formData();
      raw = Object.fromEntries(Array.from(fd.entries()).map(([k, v]) => [k, String(v)]));
    }
  } catch {
    return json({ ok: false, message: 'Could not read the submission.' }, 400);
  }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (clean(raw._gotcha)) {
    return json({ ok: true, message: 'Thanks — a volunteer will review this.' });
  }

  const intent = clean(raw.intent) || 'new';
  const resourceName = clean(raw.resourceName);
  const category = clean(raw.category);

  const errors: Record<string, string> = {};
  if (!resourceName) errors.resourceName = 'Please enter the organization name.';
  if (!category) errors.category = 'Please choose a category.';
  else if (!(CATEGORIES as readonly string[]).includes(category)) {
    errors.category = 'That category is not recognized.';
  }

  const county = clean(raw.county);
  if (county && !(REGION.counties as readonly string[]).includes(county)) {
    errors.county = 'That county is not in our service area.';
  }

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, errors }, 400);
  }

  const submission = {
    intent,
    resourceName,
    category,
    county,
    city: clean(raw.city),
    phone: clean(raw.phone),
    website: clean(raw.website),
    hours: clean(raw.hours),
    cost: clean(raw.cost),
    notes: clean(raw.notes),
    submitterName: clean(raw.submitterName),
    submitterEmail: clean(raw.submitterEmail),
    receivedAt: new Date().toISOString(),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TODO(storage): persist this submission. Options, in order of effort:
  //   1. Cloudflare D1  — add a `submissions` table, write via env.DB
  //   2. Cloudflare KV  — env.SUBMISSIONS.put(`sub:${crypto.randomUUID()}`, ...)
  //   3. Email          — forward via a Cloudflare Email binding to info@baseimpact.org
  // Until one is wired, submissions are logged and dropped.
  // ─────────────────────────────────────────────────────────────────────────
  console.log('[suggest]', JSON.stringify(submission));

  return json({
    ok: true,
    message:
      'Thanks — a volunteer will review this and verify it before it appears. We appreciate you.',
  });
};

// Anything other than POST is not allowed.
export const ALL: APIRoute = () =>
  json({ ok: false, message: 'Method not allowed.' }, 405);
