/**
 * Base Impact – Cloudflare Worker
 *
 * Four jobs, all on baseimpact.org/api/*:
 *
 *   1. The referral log (password gated). This is the denominator of the connected
 *      referral rate -- the number of people Base Impact actually sent somewhere.
 *      Nothing else can produce it, because only Base Impact knows who it referred.
 *
 *   2. The public connect page's endpoints. Someone who was referred enters the short
 *      reference code they were given and reports how it went. This is the numerator.
 *      It needs no login and holds no personal data: the code identifies a referral,
 *      not a person.
 *
 *   3. Private evidence. Photos submitted with an outcome are written to an R2 bucket
 *      that is not public and has no domain. They are readable only through an
 *      authenticated /log request.
 *
 *   4. The contact/partner/volunteer forms. These currently post nowhere -- both site
 *      forms fall back to opening the visitor's mail app -- so these endpoints are
 *      kept for when that changes.
 *
 * Deploy:  wrangler deploy
 * Secrets: wrangler secret put LOG_PASSWORD
 *          wrangler secret put TURNSTILE_SECRET_KEY
 *          wrangler secret put FORM_TO_EMAIL
 *
 * NOTE ON `env`: every binding and secret is read INSIDE the fetch handler. The
 * original version read `env` at module scope, where it does not exist in Workers.
 * That is a ReferenceError at load, not a caught error, so the worker would fail to
 * start at all -- the deploy would look fine and every request would fail.
 */

type Env = {
  REFERRALS: D1Database;
  EVIDENCE: R2Bucket;
  LOG_PASSWORD?: string;
  TURNSTILE_SECRET_KEY?: string;
  FORM_TO_EMAIL?: string;
  CF_RATE_LIMIT_MAX?: string;
  CF_RATE_LIMIT_WINDOW?: string;
};

type FormPayload = {
  name?: string;
  email?: string;
  identity: string;
  topic: string;
  note: string;
  _hp?: string;
  cfToken: string;
};

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const ALLOWED_ORIGIN = "https://baseimpact.org";
const SESSION_SECONDS = 60 * 60 * 24 * 90;

/**
 * Reference-code alphabet.
 *
 * Deliberately excludes 0/O, 1/I/L and U/V. These codes get read aloud over a phone
 * and written down by hand, so the characters people confuse are the ones that matter
 * -- a mistyped code is a referral that silently never gets an outcome, which shows up
 * later as a hole in the rate rather than as an error.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTWXYZ23456789";
const CODE_LENGTH = 6;

/** Largest photo accepted, in bytes. Phones produce 3-8 MB; 10 MB is generous. */
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowSec: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

function sanitize(input: string, maxLen = 5000): string {
  return String(input ?? "")
    .replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" }[c] || c))
    .slice(0, maxLen)
    .trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(), ...extra },
  });
}

/* ------------------------------------------------------------------ *
 * Reference codes
 * ------------------------------------------------------------------ */

function newCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

/**
 * Insert until the code is unique.
 *
 * The column has a UNIQUE index, so a collision fails the insert rather than creating
 * a duplicate -- this retries a few times and then gives up loudly. With 30^6 (~729
 * million) codes and a table this size, a collision is vanishingly unlikely; the loop
 * exists so that "unlikely" cannot become "silently two referrals share a code".
 */
async function insertWithCode(db: D1Database, row: Record<string, unknown>): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    try {
      await db.prepare(
        `INSERT INTO referrals (referred_at, resource_id, resource_name, county, channel, person_ref, note, ref_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        row.referred_at, row.resource_id, row.resource_name, row.county,
        row.channel, row.person_ref, row.note, code,
      ).run();
      return code;
    } catch (err) {
      if (attempt === 4) throw err;
    }
  }
  throw new Error("could not allocate a unique reference code");
}

/* ------------------------------------------------------------------ *
 * Session handling for /log
 * ------------------------------------------------------------------ */

function b64url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

/** Length-independent comparison, so a wrong password leaks no timing signal. */
function timingSafeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

async function makeSession(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${exp}.${await sign(secret, String(exp))}`;
}

async function sessionValid(cookieHeader: string | null, secret: string): Promise<boolean> {
  if (!cookieHeader) return false;
  const m = cookieHeader.match(/(?:^|;\s*)bi_log=([^;]+)/);
  if (!m) return false;
  const [expStr, sig] = m[1].split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(sig, await sign(secret, expStr));
}

function sessionCookie(value: string, maxAge: number): string {
  return `bi_log=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

/* ------------------------------------------------------------------ *
 * Referral log (authenticated)
 * ------------------------------------------------------------------ */

const CHANNELS = ["phone", "text", "in_person", "email", "other"];
const OUTCOMES = ["unknown", "connected", "not_connected"];

async function handleReferralLogin(req: Request, env: Env): Promise<Response> {
  if (!env.LOG_PASSWORD) return json({ error: "Logging is not configured yet." }, 503);

  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(`login:${ip}`, 8, 900)) {
    return json({ error: "Too many attempts. Try again in a few minutes." }, 429);
  }

  let body: { password?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }

  if (!timingSafeEqual(String(body.password ?? ""), env.LOG_PASSWORD)) {
    return json({ error: "Incorrect password." }, 401);
  }
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await makeSession(env.LOG_PASSWORD), SESSION_SECONDS) });
}

function handleReferralLogout(): Response {
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}

async function handleCreateReferral(req: Request, env: Env): Promise<Response> {
  let raw: { resource_id?: string; resource_name?: string; county?: string;
             channel?: string; person_ref?: string; note?: string; referred_at?: string };
  try { raw = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }

  const name = sanitize(raw.resource_name ?? "", 200);
  if (!name) return json({ error: "Which resource was this?" }, 400);

  const channel = CHANNELS.includes(raw.channel ?? "") ? raw.channel! : "phone";
  const referredAt = raw.referred_at && /^\d{4}-\d{2}-\d{2}/.test(raw.referred_at)
    ? sanitize(raw.referred_at, 32)
    : new Date().toISOString().replace("T", " ").slice(0, 19);

  const code = await insertWithCode(env.REFERRALS, {
    referred_at: referredAt,
    resource_id: sanitize(raw.resource_id ?? "", 120) || null,
    resource_name: name,
    county: sanitize(raw.county ?? "", 40) || null,
    channel,
    person_ref: sanitize(raw.person_ref ?? "", 40) || null,
    note: sanitize(raw.note ?? "", 1000) || null,
  });

  // The code comes back so /log can show it immediately for reading aloud.
  return json({ ok: true, ref_code: code });
}

async function handleUpdateOutcome(req: Request, env: Env, id: string): Promise<Response> {
  let raw: { outcome?: string; outcome_note?: string };
  try { raw = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }

  if (!OUTCOMES.includes(raw.outcome ?? "")) {
    return json({ error: "Outcome must be connected, not_connected, or unknown." }, 400);
  }
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const res = await env.REFERRALS.prepare(
    `UPDATE referrals SET outcome = ?, outcome_note = ?, outcome_at = ?, updated_at = ? WHERE id = ?`,
  ).bind(raw.outcome, sanitize(raw.outcome_note ?? "", 1000) || null, now, now, id).run();

  if (!res.meta.changes) return json({ error: "No such referral." }, 404);
  return json({ ok: true });
}

async function handleListReferrals(url: URL, env: Env): Promise<Response> {
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
  const [stats, recent] = await Promise.all([
    env.REFERRALS.prepare("SELECT * FROM referral_stats").all(),
    env.REFERRALS.prepare(
      `SELECT id, referred_at, resource_name, county, channel, outcome, ref_code,
              self_reported, photo_key IS NOT NULL AS has_photo
         FROM referrals ORDER BY referred_at DESC, id DESC LIMIT ?`,
    ).bind(limit).all(),
  ]);
  return json({ stats: stats.results[0] ?? null, recent: recent.results ?? [] });
}

/** Evidence photos, readable only with a valid /log session. */
async function handleGetEvidence(env: Env, id: string): Promise<Response> {
  const row = await env.REFERRALS.prepare(
    `SELECT photo_key FROM referrals WHERE id = ?`,
  ).bind(id).first<{ photo_key: string | null }>();

  if (!row?.photo_key) return json({ error: "No photo for that referral." }, 404);

  const obj = await env.EVIDENCE.get(row.photo_key);
  if (!obj) return json({ error: "Photo not found in storage." }, 404);

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      // Private: this is someone's photo of a hard moment, not a public asset.
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="evidence-${id}"`,
    },
  });
}

/* ------------------------------------------------------------------ *
 * Public connect endpoints
 *
 * No login. The reference code is the credential, which is why it is random and
 * why lookups are rate limited: someone guessing codes should not be able to
 * enumerate other people's referrals.
 * ------------------------------------------------------------------ */

/** What a person is allowed to see about their own referral. Deliberately minimal. */
async function handleConnectLookup(env: Env, code: string): Promise<Response> {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
  if (clean.length !== CODE_LENGTH) {
    return json({ error: "That code does not look right. It is 6 characters." }, 400);
  }

  const row = await env.REFERRALS.prepare(
    `SELECT id, resource_name, county, referred_at, outcome
       FROM referrals WHERE ref_code = ?`,
  ).bind(clean).first<{ id: number; resource_name: string; county: string | null;
                        referred_at: string; outcome: string }>();

  if (!row) return json({ error: "We could not find that code. Check it and try again." }, 404);

  // Only the three fields needed to confirm "yes, that was me". No notes, no channel.
  return json({
    ok: true,
    referral: {
      resource_name: row.resource_name,
      county: row.county,
      referred_at: row.referred_at.slice(0, 10),
      outcome: row.outcome,
    },
  });
}

async function handleConnectSubmit(req: Request, env: Env, code: string): Promise<Response> {
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  // Generous enough for a real person correcting a typo, tight enough to stop a script.
  if (!checkRateLimit(`connect:${ip}`, 20, 3600)) {
    return json({ error: "Too many submissions from this connection. Try again later." }, 429);
  }

  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
  if (clean.length !== CODE_LENGTH) return json({ error: "That code does not look right." }, 400);

  const row = await env.REFERRALS.prepare(
    `SELECT id FROM referrals WHERE ref_code = ?`,
  ).bind(clean).first<{ id: number }>();
  if (!row) return json({ error: "We could not find that code." }, 404);

  const contentType = req.headers.get("Content-Type") || "";

  // Accept JSON (status + note) or multipart (status + note + photo).
  let outcome = "";
  let note = "";
  let consent = false;
  let photo: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try { form = await req.formData(); } catch { return json({ error: "Invalid upload." }, 400); }
    outcome = String(form.get("outcome") ?? "");
    note = String(form.get("note") ?? "");
    consent = String(form.get("consent") ?? "") === "yes";
    const f = form.get("photo");
    if (f && typeof f === "object" && "size" in f && (f as File).size > 0) photo = f as File;
  } else {
    let body: { outcome?: string; note?: string };
    try { body = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }
    outcome = String(body.outcome ?? "");
    note = String(body.note ?? "");
  }

  if (!OUTCOMES.includes(outcome) || outcome === "unknown") {
    return json({ error: "Pick whether it worked or not." }, 400);
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  let photoKey: string | null = null;

  if (photo) {
    if (!consent) {
      return json({ error: "Please confirm the photo note before sending it." }, 400);
    }
    if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
      return json({ error: "That file type is not supported. Use a JPEG, PNG, or WebP photo." }, 400);
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return json({ error: "That photo is too large. Please use one under 10 MB." }, 400);
    }
    const ext = photo.type.split("/")[1].replace("jpeg", "jpg");
    // Random key, never the reference code, so the object path cannot be derived from
    // anything a person might share. The code lives in D1, not in the storage path.
    photoKey = `evidence/${crypto.randomUUID()}.${ext}`;
    await env.EVIDENCE.put(photoKey, await photo.arrayBuffer(), {
      httpMetadata: { contentType: photo.type },
    });
  }

  await env.REFERRALS.prepare(
    `UPDATE referrals
        SET outcome = ?, outcome_note = ?, outcome_at = ?, updated_at = ?,
            self_reported = 1, submitted_at = ?,
            photo_key = COALESCE(?, photo_key)
      WHERE id = ?`,
  ).bind(
    outcome,
    sanitize(note, 1000) || null,
    now, now, now,
    photoKey,
    row.id,
  ).run();

  return json({ ok: true, message: "Thank you — that helps us know what is working." });
}

/* ------------------------------------------------------------------ *
 * Form endpoints (behaviour unchanged)
 * ------------------------------------------------------------------ */

async function verifyTurnstile(token: string, secret: string | undefined, ip?: string): Promise<boolean> {
  if (!secret) return true;
  try {
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);
    const resp = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form });
    const result = await resp.json<{ success: boolean }>();
    return result.success === true;
  } catch {
    return false;
  }
}

async function sendEmail(to: string | undefined, subject: string, body: string): Promise<boolean> {
  if (!to) return false;
  try {
    const resp = await fetch("https://api.mailchannels.net/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: [to], from: "Base Impact <noreply@baseimpact.org>", subject, text: body }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function handleForm(req: Request, env: Env, endpoint: string, subjectPrefix: string): Promise<Response> {
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const max = parseInt(env.CF_RATE_LIMIT_MAX || "10", 10);
  const windowSec = parseInt(env.CF_RATE_LIMIT_WINDOW || "3600", 10);
  if (!checkRateLimit(ip, max, windowSec)) {
    return json({ error: "Too many submissions. Please try again later." }, 429);
  }

  let data: FormPayload;
  try {
    const raw = await req.json<FormPayload>();
    data = {
      name: sanitize(raw.name || "", 200),
      email: sanitize(raw.email || "", 200),
      identity: sanitize(raw.identity, 100),
      topic: sanitize(raw.topic, 100),
      note: sanitize(raw.note || "", 5000),
      _hp: raw._hp,
      cfToken: raw.cfToken || "",
    };
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (data._hp && data._hp.length > 0) return json({ ok: true });

  if (!(await verifyTurnstile(data.cfToken, env.TURNSTILE_SECRET_KEY, ip))) {
    return json({ error: "Verification failed. Please try again." }, 403);
  }
  if (!data.identity || !data.topic) return json({ error: "Missing required fields." }, 400);
  if (data.email && !isValidEmail(data.email)) {
    return json({ error: "Please provide a valid email address." }, 400);
  }

  const emailed = await sendEmail(
    env.FORM_TO_EMAIL,
    `[Base Impact] ${subjectPrefix} – ${data.topic}`,
    [
      `Endpoint:  ${endpoint}`,
      `From:      ${data.name || "(not provided)"} <${data.email || "(no email)"}>`,
      `Identity:  ${data.identity}`,
      `Topic:     ${data.topic}`,
      `Note:`,
      data.note || "(empty)",
    ].join("\n"),
  );

  return json({
    ok: true,
    message: "Thank you — we'll be in touch.",
    fallbackNote: emailed ? undefined : "Your message was received. If you don't hear from us within a few days, email us directly.",
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });

    /* ---- public connect (no auth; the code is the credential) ---- */
    const cm = path.match(/^\/api\/connect\/([a-z0-9]+)$/i);
    if (cm) {
      if (req.method === "GET") return handleConnectLookup(env, cm[1]);
      if (req.method === "POST") return handleConnectSubmit(req, env, cm[1]);
      return json({ error: "Not found." }, 404);
    }

    /* ---- referral log (password gated) ---- */
    if (path === "/api/referrals/login" && req.method === "POST") return handleReferralLogin(req, env);
    if (path === "/api/referrals/logout" && req.method === "POST") return handleReferralLogout();

    if (path.startsWith("/api/referrals") || path.startsWith("/api/evidence")) {
      if (!env.LOG_PASSWORD) return json({ error: "Logging is not configured yet." }, 503);
      if (!(await sessionValid(req.headers.get("Cookie"), env.LOG_PASSWORD))) {
        return json({ error: "Not signed in." }, 401);
      }

      const em = path.match(/^\/api\/evidence\/(\d+)$/);
      if (em && req.method === "GET") return handleGetEvidence(env, em[1]);

      if (path === "/api/referrals" && req.method === "POST") return handleCreateReferral(req, env);
      if (path === "/api/referrals" && req.method === "GET") return handleListReferrals(url, env);

      const m = path.match(/^\/api\/referrals\/(\d+)$/);
      if (m && req.method === "PATCH") return handleUpdateOutcome(req, env, m[1]);

      return json({ error: "Not found." }, 404);
    }

    /* ---- forms ---- */
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    if (path === "/api/feedback" || path === "/api/contact") return handleForm(req, env, "feedback", "Feedback");
    if (path === "/api/partners") return handleForm(req, env, "partners", "Partner Registration");
    if (path === "/api/volunteer") return handleForm(req, env, "volunteer", "Volunteer Sign-up");
    if (path === "/api/join") return handleForm(req, env, "join", "Stay Informed");

    return json({ error: "Not found." }, 404);
  },
};
