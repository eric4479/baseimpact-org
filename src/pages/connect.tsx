import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CheckCircle, HelpCircle, Loader2, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel, Textarea } from "@/components/ui/input";
import { PageMeta } from "@/components/page-meta";

/**
 * The connect page.
 *
 * Someone who was referred enters the short code Base Impact read out to them and says
 * how it went. This is the numerator of the connected referral rate -- the referral log
 * is the denominator.
 *
 * WHY IT WORKS THIS WAY
 *
 *   * The code is the credential. There is no login, and there is no name, phone, or
 *     email anywhere on this page. The code identifies a referral, not a person, which
 *     is what makes a precise match possible without collecting anything about whoever
 *     was helped.
 *
 *   * It is deliberately unlisted. Not in the nav, not in the footer, not in the
 *     sitemap, and noindex. It is reached only by a link handed to someone who was
 *     referred, which keeps it out of search results and out of casual traffic.
 *
 *   * Two answers, not three. A person can say it worked or it did not; they cannot
 *     answer "unknown", because that is what we already assume when nobody replies.
 *     Letting someone pick "unknown" would make silence look like an answer.
 *
 *   * Photos are evidence, never content. Uploaded only with an explicit confirmation,
 *     stored in a private bucket with no public URL, and never shown on this site. The
 *     wording asks for the place or the food rather than people's faces, because a
 *     photo of a neighbour at a pantry identifies them as needing help.
 */

type Referral = {
  resource_name: string;
  county: string | null;
  referred_at: string;
  outcome: string;
};

const OUTCOME_LABEL: Record<string, string> = {
  connected: "You said this worked",
  not_connected: "You said this did not work",
  unknown: "No answer yet",
};

export function ConnectPage() {
  const [code, setCode] = useState("");
  const [referral, setReferral] = useState<Referral | null>(null);
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [outcome, setOutcome] = useState<"" | "connected" | "not_connected">("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /**
   * The code may arrive as ?code=XXXXXX, which is how the link is handed out, so the
   * person does not have to retype it. Read in an effect rather than a state
   * initialiser because this page is prerendered and `window` is not available then.
   */
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("code");
    if (fromUrl) setCode(fromUrl.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
  }, []);

  const lookup = useCallback(async (value: string) => {
    setLooking(true); setLookupError("");
    try {
      const res = await fetch(`/api/connect/${encodeURIComponent(value)}`, { credentials: "same-origin" });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.referral) {
        setReferral(body.referral as Referral);
        if (body.referral.outcome !== "unknown") setOutcome(body.referral.outcome);
      } else {
        setLookupError(body?.error ?? `That did not work (HTTP ${res.status}).`);
      }
    } catch {
      setLookupError("We could not reach the server. Check your connection and try again.");
    } finally {
      setLooking(false);
    }
  }, []);

  const onLookup = (e: FormEvent) => {
    e.preventDefault();
    if (code.length === 6) void lookup(code);
  };

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!referral || !outcome) return;
    setSending(true); setSendError("");

    const fd = new FormData();
    fd.append("outcome", outcome);
    if (note.trim()) fd.append("note", note.trim());
    if (photo) { fd.append("photo", photo); fd.append("consent", "yes"); }

    try {
      const res = await fetch(`/api/connect/${encodeURIComponent(code)}`, {
        method: "POST", body: fd, credentials: "same-origin",
      });
      const body = await res.json().catch(() => null);
      if (res.ok) setDone(true);
      else setSendError(body?.error ?? `That did not send (HTTP ${res.status}).`);
    } catch {
      setSendError("We could not reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <PageMeta title="Thank you" description="Outcome recorded." path="/connect" />
        <div className="rounded-2xl bg-tint-positive px-5 py-10 text-center text-positive">
          <CheckCircle className="mx-auto size-10" aria-hidden />
          <h1 className="mt-3 font-display text-2xl font-semibold text-body">Thank you</h1>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            That tells us whether this is actually working, which is the only way we find
            out. If something was wrong with the listing, we will fix it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageMeta title="How did it go?" description="Tell us whether the referral worked." path="/connect" />

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">How did it go?</h1>
        <p className="text-muted">
          Enter the 6-character code we gave you. It tells us which place we sent you to,
          and nothing about you.
        </p>
      </header>

      {!referral && (
        <form onSubmit={onLookup} className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <div>
            <FieldLabel htmlFor="code">Your code</FieldLabel>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="M4K7QP"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="text-center font-display text-2xl tracking-[0.3em]"
              aria-describedby="code-help"
            />
            <p id="code-help" className="mt-2 text-xs text-muted">
              Six characters, letters and numbers. Case does not matter.
            </p>
          </div>
          {lookupError && <p className="text-sm font-semibold text-critical">{lookupError}</p>}
          <Button type="submit" variant="pine" size="lg" className="w-full" disabled={code.length !== 6 || looking}>
            {looking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />}
            Look up my referral
          </Button>
        </form>
      )}

      {referral && (
        <form onSubmit={onSend} className="space-y-5">
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">We sent you to</p>
            <p className="mt-1 font-display text-xl font-semibold">{referral.resource_name}</p>
            <p className="text-sm text-muted">
              {referral.county ? `${referral.county} · ` : ""}
              referred {referral.referred_at}
            </p>
            {referral.outcome !== "unknown" && (
              <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
                {OUTCOME_LABEL[referral.outcome] ?? "You already answered"} — you can change it.
              </p>
            )}
            <button
              type="button"
              onClick={() => { setReferral(null); setOutcome(""); setPhoto(null); setConsent(false); }}
              className="mt-3 text-sm font-semibold text-accent underline underline-offset-2"
            >
              Not this one — use a different code
            </button>
          </div>

          <fieldset className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <legend className="font-display text-lg font-semibold">Did you get help?</legend>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button" onClick={() => setOutcome("connected")} aria-pressed={outcome === "connected"}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left font-semibold ${
                  outcome === "connected" ? "bg-fill text-on-fill" : "bg-inset text-body"}`}>
                <CheckCircle className="size-5 shrink-0" aria-hidden /> Yes, they helped me
              </button>
              <button
                type="button" onClick={() => setOutcome("not_connected")} aria-pressed={outcome === "not_connected"}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left font-semibold ${
                  outcome === "not_connected" ? "bg-fill text-on-fill" : "bg-inset text-body"}`}>
                <XCircle className="size-5 shrink-0" aria-hidden /> No, it did not work out
              </button>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-muted">
              <HelpCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              &ldquo;No&rdquo; is just as useful as &ldquo;yes&rdquo;. It is how we find a listing that
              is closed, moved, or wrong.
            </p>
          </fieldset>

          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <FieldLabel htmlFor="note">Anything you want to add? (optional)</FieldLabel>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Were they open? Did they ask for something you did not have?" />
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-lg font-semibold">Add a photo? (optional)</h2>
            <p className="mt-2 text-sm text-muted">
              A picture of the place, a sign, or what you were given. <strong className="text-body">Please
              do not include people&apos;s faces</strong> — including your own. A photo like that
              could identify someone who asked for help.
            </p>
            <p className="mt-2 text-sm text-muted">
              Photos are kept private. They are never posted on this website or shared
              publicly, and are only used to understand what happened.
            </p>

            {photo ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-inset px-3 py-2">
                <span className="min-w-0 truncate text-sm font-semibold">{photo.name}</span>
                <button type="button" onClick={() => { setPhoto(null); setConsent(false); if (fileRef.current) fileRef.current.value = ""; }}
                        className="shrink-0 text-sm font-semibold text-accent underline underline-offset-2">
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <input
                  ref={fileRef} id="photo" type="file" accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                  <Camera className="size-4" aria-hidden /> Choose a photo
                </Button>
              </div>
            )}

            {photo && (
              <label className="mt-3 flex items-start gap-3 rounded-xl bg-inset p-3 text-sm">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                       className="mt-0.5 size-4 shrink-0" />
                <span>
                  I took this photo, there are no people&apos;s faces in it, and Base Impact may
                  keep it privately to understand what happened.
                </span>
              </label>
            )}
          </div>

          {sendError && <p className="text-sm font-semibold text-critical">{sendError}</p>}

          <Button type="submit" variant="pine" size="lg" className="w-full"
                  disabled={!outcome || sending || (!!photo && !consent)}>
            {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle className="size-4" aria-hidden />}
            Send
          </Button>
        </form>
      )}
    </div>
  );
}
