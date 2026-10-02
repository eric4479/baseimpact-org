/**
 * Base Impact – Cloudflare Worker
 *
 * Two jobs, both on baseimpact.org/api/*:
 *
 *   1. The referral log. This is the denominator of the connected referral rate --
 *      the number of people Base Impact actually sent somewhere. Nothing else can
 *      produce it, because only Base Impact knows who it referred. Password gated,
 *      never public.
 *
 *   2. The contact/partner/volunteer forms. These currently post nowhere: both site
 *      forms fall back to opening the visitor's mail app, so these endpoints are
 *      kept for when that changes.
 *
 * Deploy:  wrangler deploy
 * Secrets: wrangler secret put LOG_PASSWORD        (the /log page password)
 *          wrangler secret put TURNSTILE_SECRET_KEY
 *          wrangler secret put FORM_TO_EMAIL
 *
 * NOTE ON `env`: every binding and secret is read INSIDE the fetch handler. The
 * previous version read `env` at module scope, where it does not exist in Workers.
 * That is a ReferenceError at load, not a caught error, so the worker would fail to
 * start at all -- the deploy would look fine and every request would fail.
 */

type Env = {
  REFERRALS: D1Database;
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

/** How long a /log session lasts. Long, because logging happens in the field. */
const SESSION_SECONDS = 60 * 60 * 24 * 90;

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
 * Session handling for /log
 *
 * One shared password held as a Worker secret, never in the bundle. On
 * success the worker sets an HttpOnly cookie holding an expiry plus an
 * HMAC of that expiry, so the cookie cannot be forged without the
 * password and the password itself is never stored client-side.
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
  // SameSite=Strict + HttpOnly: the log is unreachable from a cross-site form post,
  // and no script on the page can read the cookie.
  return `bi_log=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

/* ------------------------------------------------------------------ *
 * Referral endpoints
 * ------------------------------------------------------------------ */

type ReferralInput = {
  resource_id?: string;
  resource_name?: string;
  county?: string;
  channel?: string;
  person_ref?: string;
  note?: string;
  referred_at?: string;
};

const CHANNELS = ["phone", "text", "in_person", "email", "other"];
const OUTCOMES = ["unknown", "connected", "not_connected"];

async function handleReferralLogin(req: Request, env: Env): Promise<Response> {
  if (!env.LOG_PASSWORD) return json({ error: "Logging is not configured yet." }, 503);

  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  // Tighter than the form limit: this is the only password on the site.
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
  let raw: ReferralInput;
  try { raw = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }

  const name = sanitize(raw.resource_name ?? "", 200);
  if (!name) return json({ error: "Which resource was this?" }, 400);

  const channel = CHANNELS.includes(raw.channel ?? "") ? raw.channel! : "phone";
  const referredAt = raw.referred_at && /^\d{4}-\d{2}-\d{2}/.test(raw.referred_at)
    ? sanitize(raw.referred_at, 32)
    : new Date().toISOString().replace("T", " ").slice(0, 19);

  await env.REFERRALS.prepare(
    `INSERT INTO referrals (referred_at, resource_id, resource_name, county, channel, person_ref, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    referredAt,
    sanitize(raw.resource_id ?? "", 120) || null,
    name,
    sanitize(raw.county ?? "", 40) || null,
    channel,
    sanitize(raw.person_ref ?? "", 40) || null,
    sanitize(raw.note ?? "", 1000) || null,
  ).run();

  return json({ ok: true });
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
      `SELECT id, referred_at, resource_name, county, channel, outcome
         FROM referrals ORDER BY referred_at DESC, id DESC LIMIT ?`,
    ).bind(limit).all(),
  ]);
  return json({ stats: stats.results[0] ?? null, recent: recent.results ?? [] });
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

  // Honeypot: answer 200 so the bot believes it succeeded.
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

    // ---- referral log (password gated) ----
    if (path === "/api/referrals/login" && req.method === "POST") return handleReferralLogin(req, env);
    if (path === "/api/referrals/logout" && req.method === "POST") return handleReferralLogout();

    if (path.startsWith("/api/referrals")) {
      if (!env.LOG_PASSWORD) return json({ error: "Logging is not configured yet." }, 503);
      if (!(await sessionValid(req.headers.get("Cookie"), env.LOG_PASSWORD))) {
        return json({ error: "Not signed in." }, 401);
      }

      if (path === "/api/referrals" && req.method === "POST") return handleCreateReferral(req, env);
      if (path === "/api/referrals" && req.method === "GET") return handleListReferrals(url, env);

      const m = path.match(/^\/api\/referrals\/(\d+)$/);
      if (m && req.method === "PATCH") return handleUpdateOutcome(req, env, m[1]);

      return json({ error: "Not found." }, 404);
    }

    // ---- forms ----
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    if (path === "/api/feedback" || path === "/api/contact") return handleForm(req, env, "feedback", "Feedback");
    if (path === "/api/partners") return handleForm(req, env, "partners", "Partner Registration");
    if (path === "/api/volunteer") return handleForm(req, env, "volunteer", "Volunteer Sign-up");
    if (path === "/api/join") return handleForm(req, env, "join", "Stay Informed");

    return json({ error: "Not found." }, 404);
  },
};
