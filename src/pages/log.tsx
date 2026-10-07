import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle, Loader2, Lock, LogOut, Search, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel, Textarea } from "@/components/ui/input";
import { PageMeta } from "@/components/page-meta";
import { ALL_RESOURCES } from "@/lib/resources";

/**
 * The referral log.
 *
 * This is the only screen in the whole project that exists to produce a number
 * rather than to help someone, and it is the denominator of the connected referral
 * rate. Two things follow from that and they drive every choice below.
 *
 * 1. It has to be fast. A log that takes a minute to fill in does not get filled in
 *    on a phone call, and a denominator nobody maintains is worse than none because
 *    it looks like data. So: one screen, the resource is a picker not typing, the
 *    channel defaults to phone, the note is optional, and the session lasts 90 days
 *    so the password is a once-a-season event rather than a per-referral one.
 *
 * 2. It must not flatter us. `unknown` is a first-class state and is shown next to
 *    the two decided ones, and the rate is always printed WITH its coverage. A rate
 *    of 100% off two replies is not a success rate, and the moment that number can
 *    be screenshotted without its coverage it will end up in a grant application
 *    meaning something it does not mean.
 */

type Stats = {
  referrals_made: number;
  connected: number;
  not_connected: number;
  unknown: number;
  answered: number;
};

type Row = {
  id: number;
  referred_at: string;
  resource_name: string;
  county: string | null;
  channel: string;
  outcome: string;
  ref_code: string | null;
  self_reported: number;
  has_photo: number;
};

type FormSubmission = {
  id: number;
  created_at: string;
  endpoint: string;
  identity: string | null;
  topic: string | null;
  name: string | null;
  email: string | null;
  email_sent: number;
  email_error: string | null;
  notified_at: string | null;
  note: string | null;
};

type FormInbox = {
  counts: { total: number; emailed: number; unsent: number } | null;
  unnotified: number;
  submissions: FormSubmission[];
};

const CHANNELS = [
  { key: "phone", label: "Phone" },
  { key: "text", label: "Text" },
  { key: "in_person", label: "In person" },
  { key: "email", label: "Email" },
  { key: "other", label: "Other" },
];

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  let body: unknown = null;
  try { body = await res.json(); } catch { /* empty body is fine */ }
  return { ok: res.ok, status: res.status, body: body as Record<string, unknown> | null };
}

export function LogPage() {
  // "error" is a first-class phase, not a fallback to "login". If the log cannot be
  // reached at all -- no network, a 500, a Worker that failed to deploy -- showing a
  // password box would invite someone to type a password into a screen that cannot
  // check it. The previous version had no error path and simply span forever.
  const [phase, setPhase] = useState<"loading" | "login" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<{ id: string; name: string; county: string } | null>(null);
  const [channel, setChannel] = useState("phone");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState("");
  /**
   * The code handed out for the referral just logged. It is held here, large and
   * separate from the toast, because its whole job is to be read aloud on the phone
   * before the call ends -- once the person hangs up without it, that referral can
   * never be matched to an outcome and quietly becomes an `unknown` forever.
   */
  const [issuedCode, setIssuedCode] = useState("");
  /** Why "Log it" could not proceed, shown instead of silently doing nothing. */
  const [logError, setLogError] = useState("");
  // Referral log vs. form inbox. The inbox exists because form submissions are stored
  // in D1 first and emailed second -- if the send fails, the message still exists and
  // someone has to be able to read it.
  const [view, setView] = useState<"referrals" | "messages">("referrals");
  const [inbox, setInbox] = useState<FormInbox | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api("/api/referrals?limit=25");
      if (r.status === 401) { setLoadError(""); setPhase("login"); return; }
      if (r.ok && r.body) {
        setStats(r.body.stats as Stats);
        setRows((r.body.recent as Row[]) ?? []);
        setLoadError("");
        setPhase("ready");
        return;
      }
      setLoadError(
        typeof r.body?.error === "string"
          ? r.body.error
          : `The log replied with HTTP ${r.status}. It may not be deployed yet.`,
      );
      setPhase("error");
    } catch {
      setLoadError("Could not reach the log. Check your connection and try again.");
      setPhase("error");
    }
  }, []);

  const loadInbox = useCallback(async () => {
    try {
      const r = await api("/api/forms");
      if (!r.ok) {
        setInbox({ counts: { total: 0, emailed: 0, unsent: 0 }, unnotified: 0, submissions: [] });
        return;
      }
      setInbox(r.body as FormInbox);
    } catch {
      setInbox({ counts: { total: 0, emailed: 0, unsent: 0 }, unnotified: 0, submissions: [] });
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Load the message count up front so the tab shows a badge before it is opened.
  useEffect(() => {
    if (phase !== "ready") return;
    void loadInbox();
  }, [phase, loadInbox]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return ALL_RESOURCES
      .filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) { setLoginError("Enter the password."); return; }
    setBusy(true); setLoginError("");
    const r = await api("/api/referrals/login", { method: "POST", body: JSON.stringify({ password }) });
    setBusy(false);
    if (r.ok) { setPassword(""); void load(); }
    else setLoginError((r.body?.error as string) ?? "Could not sign in.");
  };

  const onLogout = async () => {
    await api("/api/referrals/logout", { method: "POST" });
    setStats(null); setRows([]); setPhase("login");
  };

  const onLog = async () => {
    // Same reasoning as the connect page: a disabled button with no explanation is a
    // dead end. Answering the tap with the reason beats ignoring it.
    if (!picked) {
      setLogError("Pick who you sent them to first.");
      return;
    }
    setLogError("");
    setBusy(true);
    const r = await api("/api/referrals", {
      method: "POST",
      body: JSON.stringify({
        resource_id: picked.id,
        resource_name: picked.name,
        county: picked.county,
        channel,
        note,
      }),
    });
    setBusy(false);
    if (r.ok) {
      setIssuedCode(String(r.body?.ref_code ?? ""));
      setFlash(`Logged: ${picked.name}`);
      setPicked(null); setQuery(""); setNote(""); setChannel("phone");
      void load();
    }
  };

  const setOutcome = async (id: number, outcome: string) => {
    // Optimistic: the list is short and the write is cheap, so the row moves now
    // and the reload corrects it if the write failed.
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, outcome } : r)));
    const r = await api(`/api/referrals/${id}`, { method: "PATCH", body: JSON.stringify({ outcome }) });
    if (!r.ok) void load();
  };

  const rate = useMemo(() => {
    if (!stats) return null;
    const decided = stats.connected + stats.not_connected;
    if (decided === 0) return null;
    return {
      pct: Math.round((stats.connected / decided) * 100),
      coverage: stats.referrals_made ? Math.round((decided / stats.referrals_made) * 100) : 0,
    };
  }, [stats]);

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-muted">
        <Loader2 className="mx-auto size-6 animate-spin" aria-hidden />
        <p className="mt-2 text-sm">Opening the log…</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <PageMeta title="Referral log" description="Internal." path="/log" />
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-semibold">Referral log</h1>
        </header>
        <div className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <p className="font-semibold text-critical">The log is not reachable.</p>
          <p className="text-sm text-muted">{loadError}</p>
          <Button variant="pine" size="lg" className="w-full" onClick={() => { setPhase("loading"); void load(); }}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "login") {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <PageMeta title="Referral log" description="Internal." path="/log" />
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-semibold">Referral log</h1>
          <p className="text-muted">Internal. Sign in to record referrals.</p>
        </header>
        <form onSubmit={onLogin} className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <div>
            <FieldLabel htmlFor="pw">Password</FieldLabel>
            <Input id="pw" type="password" autoComplete="current-password"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {loginError && <p className="text-sm font-semibold text-critical">{loginError}</p>}
          <Button type="submit" variant="pine" size="lg" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
            Sign in
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageMeta title="Referral log" description="Internal." path="/log" />

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {view === "referrals" ? "Referral log" : "Messages"}
          </h1>
          <p className="text-sm text-muted">
            {view === "referrals"
              ? "Every referral you make is one row."
              : "Feedback, partner registrations, and contact messages."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="size-4" aria-hidden /> Sign out
        </Button>
      </header>

      {/* Two views behind one password: the referral log and the form inbox. */}
      <div className="flex gap-2" role="tablist" aria-label="Log sections">
        <Button
          role="tab"
          aria-selected={view === "referrals"}
          variant={view === "referrals" ? "pine" : "outline"}
          size="sm"
          onClick={() => setView("referrals")}
        >
          Referrals
        </Button>
        <Button
          role="tab"
          aria-selected={view === "messages"}
          variant={view === "messages" ? "pine" : "outline"}
          size="sm"
          onClick={() => {
            setView("messages");
            void loadInbox();
          }}
        >
          Messages
          {inbox && inbox.counts && inbox.counts.total > 0 && (
            <span className="ml-2 text-xs opacity-80">({inbox.counts.total})</span>
          )}
        </Button>
      </div>

      {view === "messages" && (
        <section className="space-y-3" role="tabpanel" aria-label="Messages">
          {inbox?.counts && (
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Messages</p>
                <p className="font-display text-2xl font-semibold">{inbox.counts.total}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Email sent</p>
                <p className="font-display text-2xl font-semibold text-positive">{inbox.counts.emailed}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Read here only</p>
                <p className="font-display text-2xl font-semibold text-caution">{inbox.counts.unsent}</p>
              </div>
            </div>
          )}
          {!inbox && (
            <p className="text-sm text-muted" role="status">
              <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden /> Loading messages…
            </p>
          )}
          {inbox && inbox.submissions.length === 0 && (
            <p className="rounded-2xl bg-card p-5 text-sm text-muted shadow-[var(--shadow-border)]">
              No messages yet. Feedback and partner registrations from the site will appear here.
            </p>
          )}
          {inbox?.submissions.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">
                  {s.topic || "No subject"}
                </h2>
                <time className="text-xs text-muted" dateTime={s.created_at}>
                  {s.created_at?.replace("T", " ").slice(0, 16)}
                </time>
              </div>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-accent">
                {s.endpoint}
              </p>
              <dl className="mt-2 space-y-0.5 text-sm">
                {s.identity && (
                  <div className="flex gap-2">
                    <dt className="text-muted">From</dt>
                    <dd>{s.identity}</dd>
                  </div>
                )}
                {(s.name || s.email) && (
                  <div className="flex gap-2">
                    <dt className="text-muted">Contact</dt>
                    <dd>
                      {[s.name, s.email].filter(Boolean).join(" · ")}
                    </dd>
                  </div>
                )}
              </dl>
              {s.note && (
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-inset p-3 text-sm">{s.note}</p>
              )}
              {/* Shown when the notification email did not go out -- the message is
                  here, but nobody was told. That is a different problem from no message. */}
              {!s.email_sent && (
                <p className="mt-3 text-xs text-caution">
                  Notification email did not send
                  {s.email_error ? `: ${s.email_error}` : "."} This message is saved and readable
                  here.
                </p>
              )}
              {s.email_sent && (
                <p className="mt-3 text-xs text-muted">Notification email sent.</p>
              )}
            </article>
          ))}
          <p className="text-xs text-muted">
            Messages are deleted automatically 90 days after they arrive.
          </p>
        </section>
      )}

      {view === "referrals" && stats && (
        <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Referrals made</p>
              <p className="font-display text-3xl font-semibold">{stats.referrals_made}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Connected</p>
              <p className="font-display text-3xl font-semibold text-positive">{stats.connected}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Not connected</p>
              <p className="font-display text-3xl font-semibold text-critical">{stats.not_connected}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Unknown</p>
              <p className="font-display text-3xl font-semibold">{stats.unknown}</p>
            </div>
          </div>
          <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
            {rate ? (
              <>
                <strong className="text-body">{rate.pct}% connected</strong> of the{" "}
                {stats.connected + stats.not_connected} referrals with a known outcome
                {" "}(<strong className="text-body">{rate.coverage}%</strong> of all{" "}
                {stats.referrals_made} referrals have one). The other {stats.unknown} are unanswered —
                not counted as successes.
              </>
            ) : (
              <>No outcomes recorded yet. The rate needs both a referral and a reply.</>
            )}
          </p>
        </section>
      )}

      {/* Log one. Three taps: pick, (channel is pre-set), Log it. */}
      {view === "referrals" && (
      <section className="space-y-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-xl font-semibold">Log a referral</h2>

        {picked ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-inset px-3 py-2">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{picked.name}</span>
              <span className="text-xs text-muted">{picked.county}</span>
            </span>
            <button type="button" onClick={() => setPicked(null)}
                    className="shrink-0 text-sm font-semibold text-accent underline underline-offset-2">
              Change
            </button>
          </div>
        ) : (
          <div>
            <FieldLabel htmlFor="res">Who did you send them to?</FieldLabel>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <Input id="res" className="pl-10" placeholder="Type a pantry, shelter, or service…"
                     value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
            </div>
            {suggestions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button type="button"
                            onClick={() => {
                              setPicked({ id: s.id, name: s.name, county: s.county });
                              setQuery(""); setLogError("");
                            }}
                            className="w-full rounded-lg bg-inset px-3 py-2 text-left text-sm hover:bg-card">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-xs text-muted">{s.county}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div>
          <FieldLabel htmlFor="chan">How</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <button key={c.key} type="button" onClick={() => setChannel(c.key)}
                      aria-pressed={channel === c.key}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        channel === c.key ? "bg-fill text-on-fill" : "bg-inset text-body"
                      }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Anything you'll want to remember." />
        </div>

        <Button variant="pine" size="lg" className="w-full" onClick={onLog} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle className="size-4" aria-hidden />}
          Log it
        </Button>
        {logError && <p className="text-sm font-semibold text-critical">{logError}</p>}
        {flash && <p className="text-sm font-semibold text-positive">{flash}</p>}

        {issuedCode && (
          <div className="rounded-xl bg-tint-positive p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Read this to them before the call ends
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-[0.25em] text-body">
              {issuedCode}
            </p>
            <p className="mt-2 text-xs text-muted">
              They enter it at baseimpact.org/connect to say whether it worked.
            </p>
            <button
              type="button"
              onClick={() => setIssuedCode("")}
              className="mt-2 text-sm font-semibold text-accent underline underline-offset-2"
            >
              Done
            </button>
          </div>
        )}
      </section>
      )}

      {/* Outcomes. Three buttons, never two. */}
      {view === "referrals" && (
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Recent referrals</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">Nothing logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">{r.resource_name}</span>
                  <span className="text-xs text-muted">{r.referred_at} · {r.channel}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  {r.ref_code && (
                    <span className="rounded-md bg-inset px-2 py-0.5 font-mono font-semibold tracking-wider text-body">
                      {r.ref_code}
                    </span>
                  )}
                  {/* Provenance matters: a self-reported answer is the person's word,
                      not something we verified, and the rate should never blur the two. */}
                  {r.self_reported ? (
                    <span className="text-muted">they reported this</span>
                  ) : (
                    <span className="text-muted">you recorded this</span>
                  )}
                  {r.has_photo ? <span className="text-muted">· photo attached</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setOutcome(r.id, "connected")}
                          aria-pressed={r.outcome === "connected"}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                            r.outcome === "connected" ? "bg-fill text-on-fill" : "bg-inset text-body"}`}>
                    <CheckCircle className="size-4" aria-hidden /> Connected
                  </button>
                  <button type="button" onClick={() => setOutcome(r.id, "not_connected")}
                          aria-pressed={r.outcome === "not_connected"}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                            r.outcome === "not_connected" ? "bg-fill text-on-fill" : "bg-inset text-body"}`}>
                    <XCircle className="size-4" aria-hidden /> Not connected
                  </button>
                  <button type="button" onClick={() => setOutcome(r.id, "unknown")}
                          aria-pressed={r.outcome === "unknown"}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                            r.outcome === "unknown" ? "bg-fill text-on-fill" : "bg-inset text-body"}`}>
                    <HelpCircle className="size-4" aria-hidden /> Unknown
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}
    </div>
  );
}
