import { useEffect, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input, SelectField, Textarea } from "@/components/ui/input";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";
import TurnstileWidget from "@/components/turnstile-widget";
import {
  useFormSubmit,
  turnstileToken,
  turnstileConfigured as turnstileIsConfigured,
} from "@/components/use-form-submit";

const PARTNERS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function PartnersPage() {
  const [hp, setHp] = useState("");
  const [verifyHint, setVerifyHint] = useState(false);
  const [turnstileConfigured, setTurnstileConfigured] = useState(false);
  useEffect(() => setTurnstileConfigured(turnstileIsConfigured()), []);
  const [form, setForm] = useState({
    orgName: "",
    contactPerson: "",
    email: "",
    phone: "",
    serviceType: "Food Pantry / Meal Provider",
    needs: "",
  });
  const { status, message, storedButNotEmailed, submit, reset } = useFormSubmit("partners");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (turnstileConfigured && !turnstileToken()) {
      setVerifyHint(true);
      return;
    }
    setVerifyHint(false);

    await submit({
      // identity = who is writing, topic = what kind of org. The Worker stores both
      // verbatim, so these labels are what we will see in the inbox.
      identity: `Organization — ${form.contactPerson || "contact person not given"}`,
      topic: form.serviceType,
      note: [
        `Organization: ${form.orgName}`,
        `Phone: ${form.phone || "(not given)"}`,
        "",
        form.needs || "(no details given)",
      ].join("\n"),
      name: form.contactPerson,
      email: form.email,
      hp,
    });
  };

  const mailtoHref = `mailto:hello@baseimpact.org?subject=${encodeURIComponent(
    `Partner request: ${form.orgName}`,
  )}&body=${encodeURIComponent(
    `Organization: ${form.orgName}\nContact: ${form.contactPerson}\nEmail: ${form.email}\nPhone: ${form.phone}\nType: ${form.serviceType}\n\n${form.needs}`,
  )}`;

  return (
    <div className="space-y-8">
      <PageMeta
        title="Partner with Base Impact"
        description="Register your church, pantry, shelter, or small nonprofit in the Brevard referral network."
        path="/partners"
      />
      <JsonLd data={PARTNERS_SCHEMA} />
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Partner hub</p>
        <h1 className="font-display text-3xl font-semibold">Work with Base Impact</h1>
        <p className="max-w-2xl text-muted">
          We share digital tools, help with grant paperwork, and send neighbors to partners who
          actually have capacity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            n: "1",
            title: "Pantries & shelters",
            body: "Post your hours and ask people to call first. Availability changes — a phone call beats a wasted trip.",
          },
          {
            n: "2",
            title: "Tiny teams (1–5 people)",
            body: "Help with free nonprofit software, email security, and getting a simple website online.",
          },
        ].map((card) => (
          <article key={card.n} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <span className="flex size-10 items-center justify-center rounded-lg bg-inset font-display text-lg font-semibold text-accent">
              {card.n}
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold">{card.title}</h2>
            <p className="mt-2 text-muted">{card.body}</p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl bg-band p-5 text-on-fill sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Register your organization</h2>
        <p className="mt-2 text-faint">
          Join the Brevard referral network. This goes straight to our inbox — no need to have an
          email app set up.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-2xl bg-band-deep p-5" role="status" aria-live="polite">
            <Check className="size-8 text-faint" aria-hidden />
            <h3 className="mt-2 font-display text-xl font-semibold text-on-fill">Registration received</h3>
            <p className="mt-1 text-faint">{message}</p>
            {storedButNotEmailed && (
              <p className="mt-2 text-sm text-caution">
                Your registration was saved, but our email notification did not send. If we don’t
                reply within a few days, write us at hello@baseimpact.org.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  setHp("");
                  setVerifyHint(false);
                }}
              >
                Edit and try again
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = mailtoHref)}>
                Also email it directly
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="org">Organization</FieldLabel>
              <Input
                id="org"
                required
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                placeholder="Ministry or pantry name"
                className="bg-band-deep text-on-fill placeholder:text-faint/80"
              />
            </div>
            <div>
              <FieldLabel htmlFor="person">Your name</FieldLabel>
              <Input
                id="person"
                required
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="Contact person"
                className="bg-band-deep text-on-fill placeholder:text-faint/80"
              />
            </div>
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@organization.org"
                className="bg-band-deep text-on-fill placeholder:text-faint/80"
              />
            </div>
            <div>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(321) 555-0100"
                className="bg-band-deep text-on-fill placeholder:text-faint/80"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="type">What you offer</FieldLabel>
              <SelectField
                id="type"
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="bg-band-deep text-on-fill"
              >
                <option>Food Pantry / Meal Provider</option>
                <option>Shelter & Housing Provider</option>
                <option>Small Business / Micro-Enterprise (1–5 staff)</option>
                <option>Church / Faith-Based Outreach</option>
              </SelectField>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="needs">How we can help</FieldLabel>
              <Textarea
                id="needs"
                value={form.needs}
                onChange={(e) => setForm({ ...form, needs: e.target.value })}
                placeholder="Hours, capacity, tech needs…"
                className="bg-band-deep text-on-fill placeholder:text-faint/80"
              />
            </div>

            {/* Honeypot */}
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

            <div className="sm:col-span-2">
              <TurnstileWidget fallbackHref="mailto:hello@baseimpact.org" />

              {verifyHint && (
                <p className="text-sm text-caution" role="alert">
                  Please complete the verification step above before submitting.
                </p>
              )}

              {status === "error" && message && (
                <div className="rounded-xl bg-band-deep px-4 py-3" role="alert">
                  <p className="text-sm text-faint">{message}</p>
                  <a
                    href={mailtoHref}
                    className="mt-1 inline-block text-sm font-semibold text-on-fill underline"
                  >
                    Send it by email instead
                  </a>
                </div>
              )}
            </div>

            <p className="sm:col-span-2 text-xs text-faint">
              Sent straight to our inbox. Prefer your own email app?{" "}
              <a href={mailtoHref} className="font-semibold text-on-fill underline">
                Write to hello@baseimpact.org
              </a>
              .
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="sm:col-span-2"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Submitting…" : "Submit registration"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
