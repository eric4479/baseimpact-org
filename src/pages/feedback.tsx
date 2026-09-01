import { useState, type FormEvent } from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input, SelectField, Textarea } from "@/components/ui/input";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

const FEEDBACK_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Neighbor",
    type: "General Suggestion",
    message: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = (window as unknown as { turnstile?: { getResponse: () => string } }).turnstile
      ?.getResponse?.() || "";

    // If Turnstile isn't configured (no site key), just open the mail client
    const turnstileConfigured = !!(window as unknown as { __TURNSTILE_SITE_KEY?: string }).__TURNSTILE_SITE_KEY;
    if (turnstileConfigured && !token) {
      alert("Please complete the verification step.");
      return;
    }

    const subject = encodeURIComponent(`Base Impact feedback: ${form.type}`);
    const body = encodeURIComponent(
      `Name: ${form.name || "(not given)"}\nEmail: ${form.email || "(not given)"}\nI am: ${form.role}\nCategory: ${form.type}\n\n${form.message}`,
    );
    window.location.href = `mailto:hello@baseimpact.org?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

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
        <p className="text-ink-soft">
          A pantry we should list, a class that would help, or a note on how this site works on your
          phone.
        </p>
      </header>

      {submitted ? (
        <div className="rounded-2xl bg-ok-soft px-5 py-8 text-center text-ok">
          <CheckCircle className="mx-auto size-10" aria-hidden />
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink">Email draft opened</h2>
          <p className="mt-2 text-ink-soft">
            Send it from your mail app. If nothing opened, write hello@baseimpact.org.
          </p>
          <Button
            className="mt-4"
            variant="pine"
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", role: "Neighbor", type: "General Suggestion", message: "" });
            }}
          >
            Write another
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
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

          <p className="text-xs text-ink-soft">
            This form opens your email app with a pre-filled message. If nothing opens, write hello@baseimpact.org directly.
          </p>

          <Button type="submit" variant="pine" size="lg" className="w-full">
            <Send className="size-4" aria-hidden />
            Send feedback
          </Button>
        </form>
      )}
    </div>
  );
}
