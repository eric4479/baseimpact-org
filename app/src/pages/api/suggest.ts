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

export const POST: APIRoute = async ({ request, env }) => {
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
  // Email forwarding via Cloudflare Email Send API (wrangler.toml binding).
  // Falls back to console.log if EMAIL binding is not configured.
  // ─────────────────────────────────────────────────────────────────────────
  const emailSent = sendSubmissionEmail(submission, env);

  console.log('[suggest]', JSON.stringify(submission), 'email:', emailSent ? 'sent' : 'not configured');

  return json({
    ok: true,
    message:
      'Thanks — a volunteer will review this and verify it before it appears. We appreciate you.',
  });
};

function sendSubmissionEmail(
  submission: Record<string, unknown>,
  env: Record<string, unknown> | undefined
): boolean {
  const emailBinding = env?.EMAIL;
  if (!emailBinding) return false;

  const recipient = (typeof env === 'object' && env.EMAIL_RECIPIENT) || ADMIN_EMAIL;
  const lines = Object.entries(submission)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  try {
    // Cloudflare Email Send API — see https://developers.cloudflare.com/email/send/
    fetch('https://api.cloudflare.com/client/v4/accounts/<account-id>/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization is set via wrangler secret, not hardcoded
        Authorization: `Bearer ${env.CF_API_TOKEN || ''}`,
      },
      body: JSON.stringify({
        from: 'noreply@baseimpact.org',
        to: recipient,
        subject: `New suggestion: ${submission.resourceName}`,
        text: lines,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

// Anything other than POST is not allowed.
export const ALL: APIRoute = () =>
  json({ ok: false, message: 'Method not allowed.' }, 405);
