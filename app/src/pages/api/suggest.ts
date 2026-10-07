import type { APIRoute } from 'astro';
import { CATEGORIES } from '../../data/schema';
import { REGION } from '../../config/region';

// This is the only on-demand route in the site; every page is prerendered.
export const prerender = false;

const MAX = 2000;
const ADMIN_EMAIL = 'info@baseimpact.org';

function json(body: unknown, status = 200) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (ADMIN_EMAIL) {
    headers['X-Admin-Email'] = ADMIN_EMAIL;
  }
  return new Response(JSON.stringify(body), { status, headers });
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
  // Email forwarding (simplest storage option — no D1/KV required):
  //   Cloudflare has an Email Send API. The easiest zero-config option is a
  //   Cloudflare Email Worker binding. Until that is wired, we keep the log
  //   and add a comment so the next deploy catches it.
  //
  //   To wire: add `send_email` binding in wrangler.toml, then uncomment
  //   the block below and replace `env.EMAIL_RECIPIENT`.
  // ─────────────────────────────────────────────────────────────────────────
  // const EMAIL_RECIPIENT = env.EMAIL_RECIPIENT || ADMIN_EMAIL;
  // try {
  //   await fetch('https://api.cloudflare.com/client/v4/accounts/<account>/email/send', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       from: 'noreply@baseimpact.org',
  //       to: EMAIL_RECIPIENT,
  //       subject: `New suggestion: ${resourceName}`,
  //       text: Object.entries(submission).map(([k, v]) => `${k}: ${v}`).join('\n'),
  //     }),
  //   });
  // } catch {
  //   // Email is a best-effort delivery — never block the response on it.
  // }

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
