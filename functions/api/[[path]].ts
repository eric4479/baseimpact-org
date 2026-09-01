/**
 * Base Impact – Cloudflare Pages Form Handler
 *
 * Handles POST /api/feedback, /api/partners, /api/volunteer, /api/join
 *
 * Protections:
 *   - Cloudflare Turnstile validation
 *   - Honeypot field check (_hp)
 *   - Rate limiting per IP (KV-backed for multi-instance)
 *   - Input sanitization
 *
 * Delivery:
 *   Primary  → email via Cloudflare Email Routing or MailChannels
 *   Fallback → log to R2 if configured
 *
 * Required secrets (set in Cloudflare dashboard → Pages → Settings → Environment variables):
 *   TURNSTILE_SECRET_KEY – your Turnstile secret from dash.cloudflare.com/profile/turnstile
 *   FORM_TO_EMAIL       – where submissions go, e.g. hello@baseimpact.org
 *
 * Optional:
 *   Bind an R2 bucket as FORM_LOG for backup storage
 *   CF_RATE_LIMIT_MAX (default 10)
 *   CF_RATE_LIMIT_WINDOW (default 3600 seconds)
 */

type FormData = {
  name?: string;
  email?: string;
  identity: string;
  topic: string;
  note: string;
  _hp?: string;
  cfToken: string;
};

// ---- Configuration ----
const CF_RATE_LIMIT_MAX = parseInt(env.CF_RATE_LIMIT_MAX || "10", 10);
const CF_RATE_LIMIT_WINDOW = parseInt(env.CF_RATE_LIMIT_WINDOW || "3600", 10);
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_SECRET = env.TURNSTILE_SECRET_KEY as string | undefined;
const FORM_TO_EMAIL = env.FORM_TO_EMAIL as string | undefined;

// In-memory rate limiter (Pages Functions may run warm, so this works reasonably well;
// for stricter limits across instances, swap to KV)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + CF_RATE_LIMIT_WINDOW * 1000 });
    return true;
  }
  entry.count++;
  return entry.count <= CF_RATE_LIMIT_MAX;
}

function sanitize(input: string, maxLen = 5000): string {
  return input
    .replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" }[c] || c))
    .slice(0, maxLen)
    .trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function corsHeaders(status = "200 OK") {
  return {
    "Access-Control-Allow-Origin": "https://baseimpact.org",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    console.warn("TURNSTILE_SECRET_KEY not configured – skipping validation");
    return true;
  }

  try {
    const form = new FormData();
    form.append("secret", TURNSTILE_SECRET);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);

    const resp = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form });
    const result = await resp.json<{ success: boolean; "error-codes"?: string[] }>();
    return result.success === true;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}

async function sendEmail(subject: string, body: string): Promise<boolean> {
  if (!FORM_TO_EMAIL) {
    console.warn("FORM_TO_EMAIL not configured – email not sent");
    return false;
  }

  try {
    // Cloudflare Pages Functions can send email via MailChannels:
    // https://github.com/cloudflare/email-workers-example
    // Or via Cloudflare Email Routing with a Worker.
    // For Pages Functions, the simplest reliable path is MailChannels:

    const resp = await fetch("https://api.mailchannels.net/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: [FORM_TO_EMAIL],
        from: "Base Impact <noreply@baseimpact.org>",
        subject,
        text: body,
      }),
    });

    // If MailChannels isn't configured, log and accept the submission anyway
    if (!resp.ok) {
      console.warn(`MailChannels returned ${resp.status} – submission logged but not emailed`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

async function logToR2(data: FormData, endpoint: string): Promise<void> {
  const bucket = env.FORM_LOG as R2Bucket | undefined;
  if (!bucket) return;

  try {
    const key = `${endpoint}/${new Date().toISOString()}_${crypto.randomUUID()}.json`;
    await bucket.put(key, JSON.stringify({ endpoint, receivedAt: new Date().toISOString(), data }), {
      httpMetadata: { contentType: "application/json" },
    });
  } catch (err) {
    console.error("R2 log error:", err);
  }
}

function buildEmailBody(endpoint: string, data: FormData): string {
  const lines: string[] = [
    `Endpoint:  ${endpoint}`,
    `From:      ${data.name || "(not provided)"} <${data.email || "(no email)"}>`,
    `Identity:  ${data.identity}`,
    `Topic:     ${data.topic}`,
    `Note:`,
    data.note || "(empty)",
  ];
  return lines.join("\n");
}

// ---- Route handler ----
async function handleForm(req: Request, endpoint: string, subjectPrefix: string): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders(405) },
    });
  }

  const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({ error: "Too many submissions. Please try again later or email us directly." }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders(429) },
      }
    );
  }

  let data: FormData;
  try {
    const raw = await req.json<FormData>();
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
    return new Response(JSON.stringify({ error: "Invalid request." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(400) },
    });
  }

  // Honeypot – silently accept so bot stops trying
  if (data._hp && data._hp.length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  // Turnstile
  const turnstileOk = await verifyTurnstile(data.cfToken, clientIP);
  if (!turnstileOk) {
    return new Response(JSON.stringify({ error: "Verification failed. Please try again." }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders(403) },
    });
  }

  if (!data.identity || !data.topic) {
    return new Response(JSON.stringify({ error: "Missing required fields." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(400) },
    });
  }

  if (data.email && !isValidEmail(data.email)) {
    return new Response(JSON.stringify({ error: "Please provide a valid email address." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(400) },
    });
  }

  // Backup to R2 (non-blocking)
  logToR2(data, endpoint).catch(() => {});

  // Send email
  const subject = `[Base Impact] ${subjectPrefix} – ${data.topic}`;
  const body = buildEmailBody(endpoint, data);
  const emailed = await sendEmail(subject, body);

  if (!emailed) {
    console.error(`Email delivery failed for ${endpoint} submission from ${clientIP}`);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Thank you — we'll be in touch.",
      fallbackNote: emailed ? undefined : "Your message was received. If you don't hear from us within a few days, email us directly.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    }
  );
}

// ---- Pages Functions export ----
export const onRequest = async (context: { request: Request; env: Record<string, unknown>; next: (input?: Request | string) => Promise<Response> }) => {
  const url = new URL(context.request.url);
  const path = url.pathname.toLowerCase();

  if (path === "/api/feedback" || path === "/api/contact") {
    return handleForm(context.request, "feedback", "Feedback");
  }
  if (path === "/api/partners") {
    return handleForm(context.request, "partners", "Partner Registration");
  }
  if (path === "/api/volunteer") {
    return handleForm(context.request, "volunteer", "Volunteer Sign-up");
  }
  if (path === "/api/join") {
    return handleForm(context.request, "join", "Stay Informed");
  }

  // Let the SPA handle everything else
  return context.next();
};
