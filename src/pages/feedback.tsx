import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input, SelectField, Textarea } from "@/components/ui/input";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";
import TurnstileWidget from "@/components/turnstile-widget";
import { useFormSubmit, turnstileToken, turnstileConfigured as turnstileIsConfigured } from "@/components/use-form-submit";

const FEEDBACK_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function FeedbackPage() {
  // Honeypot value lives in component state so it can be submitted with the payload.
  const [hp, setHp] = useState("");
  // Shown when submit is blocked because the CAPTCHA has not been solved. An alert()
  // was the old behaviour and it is inaccessible and jarring, so this is inline.
  const [verifyHint, setVerifyHint] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Local Resident / Neighbor",
    type: "General Suggestion",
    message: "",
  });
  const { status, message, storedButNotEmailed, submit, reset } = useFormSubmit("feedback");
  // Read the site key in an effect: this page is prerendered, so touching `window`
  // during render would break the static build.
  const [turnstileConfigured, setTurnstileConfigured] = useState(false);
  useEffect(() => setTurnstileConfigured(turnstileIsConfigured()), []);

  /**
   * Pick up ?about=<organization>, which the directory attaches to the "No website
   * found" link. The visitor should not have to retype which listing they mean.
   *
   * Done in an effect rather than a state initialiser because this page is
   * prerendered: reading `window` during render would break the static build.
   */
  useEffect(() => {
    const about = new URLSearchParams(window.location.search).get("about");
    if (!about) return;
    setForm((f) => ({
      ...f,
      type: "Recommend a Service/Pantry to List",
      // Only fill an untouched message, so we never overwrite what they have typed.
      message: f.message.trim() ? f.message : `Website for ${about}: `,
    }));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // If Turnstile is configured, a visitor who has not solved it should be told
    // before we send, rather than after the Worker rejects them with a 403.
    if (turnstileConfigured && !turnstileToken()) {
      setVerifyHint(true);
      return;
    }
    setVerifyHint(false);

    await submit({
      identity: form.role,
      topic: form.type,
      note: form.message,
      name: form.name,
      email: form.email,
      hp,
    });
  };

  const mailtoHref = `mailto:hello@baseimpact.org?subject=${encodeURIComponent(
    `Base Impact feedback: ${form.type}`,
  )}&body=${encodeURIComponent(
    `Name: ${form.name || "(not given)"}\nEmail: ${form.email || "(not given)"}\nI am: ${form.role}\nCategory: ${form.type}\n\n${form.message}`,
  )}`;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageMeta
        title="Send feedback"
        description="Tell Base Impact what's missing, share a story, or suggest a new resource."
        path="/feedback"
      />
      <JsonLd data={FEEDBACK_SCHEMA} />
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Tell us what’s missing</h1>
        <p className="text-muted">
          A pantry we should list, a class that would help, or a note on how this site works on your
          phone.
        </p>
      </header>

      {status === "sent" ? (
        <div
          className="rounded-2xl bg-tint-positive px-5 py-8 text-center text-positive"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="mx-auto size-10" aria-hidden />
          <h2 className="mt-3 font-display text-2xl font-semibold text-body">Message sent</h2>
          <p className="mt-2 text-muted">{message}</p>
          {storedButNotEmailed && (
            // Honest state: the message IS saved in our system, but the notification
            // email did not go out. Saying so beats a confident "we'll be in touch".
            <p className="mt-2 text-sm text-caution">
              Your message was saved, but our email notification did not send. If we don’t reply
              within a few days, write hello@baseimpact.org so we know it arrived.
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button
              variant="pine"
              onClick={() => {
                reset();
                setHp("");
                setVerifyHint(false);
                setForm({ name: "", email: "", role: "Local Resident / Neighbor", type: "General Suggestion", message: "" });
              }}
            >
              Write another
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = mailtoHref)}>
              Also email it directly
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="name">Name (optional)</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <FieldLabel htmlFor="email">Email (optional)</FieldLabel>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="role">I am a</FieldLabel>
              <SelectField
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option>Local Resident / Neighbor</option>
                <option>Nonprofit / Church Staff</option>
                <option>Prospective Volunteer</option>
                <option>Prospective Board Director</option>
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="type">About</FieldLabel>
              <SelectField
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>General Suggestion</option>
                <option>Recommend a Service/Pantry to List</option>
                <option>Request a Digital/Job Class</option>
                <option>Governance / Board Feedback</option>
                <option>Website / Phone Layout</option>
                <option>Share a Story</option>
              </SelectField>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="message">Your note</FieldLabel>
            <Textarea
              id="message"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What should we add or fix?"
            />
          </div>

          {/* Honeypot – hidden from users, visible to bots */}
          <input
            type="text"
            name="_hp"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              opacity: 0,
            }}
            aria-hidden="true"
          />

          <TurnstileWidget fallbackHref="mailto:hello@baseimpact.org" />

          {verifyHint && (
            <p className="text-sm text-caution" role="alert">
              Please complete the verification step above before sending.
            </p>
          )}

          {status === "error" && message && (
            <div className="rounded-xl bg-tint-caution px-4 py-3" role="alert">
              <p className="text-sm text-caution">{message}</p>
              <a
                href={mailtoHref}
                className="mt-1 inline-block text-sm font-semibold text-accent underline"
              >
                Send it by email instead
              </a>
            </div>
          )}

          <p className="text-xs text-muted">
            Sent straight to our inbox. Prefer your own email app?{" "}
            <a href={mailtoHref} className="font-semibold text-accent underline">
              Write to hello@baseimpact.org
            </a>
            .
          </p>

          <Button type="submit" variant="pine" size="lg" className="w-full" disabled={status === "submitting"}>
            <Send className="size-4" aria-hidden />
            {status === "submitting" ? "Sending…" : "Send feedback"}
          </Button>
        </form>
      )}
    </div>
  );
}
