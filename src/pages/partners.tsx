import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input, SelectField, Textarea } from "@/components/ui/input";
import TurnstileWidget from "@/components/turnstile-widget";

export function PartnersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    orgName: "",
    contactPerson: "",
    email: "",
    phone: "",
    serviceType: "Food Pantry / Meal Provider",
    needs: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = (window as unknown as { turnstile?: { getResponse: () => string } }).turnstile
      ?.getResponse?.() || "";

    const turnstileConfigured = !!(window as unknown as { __TURNSTILE_SITE_KEY?: string }).__TURNSTILE_SITE_KEY;
    if (turnstileConfigured && !token) {
      alert("Please complete the verification step.");
      return;
    }

    const subject = encodeURIComponent(`Partner request: ${form.orgName}`);
    const body = encodeURIComponent(
      `Organization: ${form.orgName}\nContact: ${form.contactPerson}\nEmail: ${form.email}\nPhone: ${form.phone}\nType: ${form.serviceType}\n\n${form.needs}`,
    );
    window.location.href = `mailto:hello@baseimpact.org?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-sea">Partner hub</p>
        <h1 className="font-display text-3xl font-semibold">Work with Base Impact</h1>
        <p className="max-w-2xl text-ink-soft">
          We share digital tools, help with grant paperwork, and send neighbors to partners who
          actually have capacity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            n: "1",
            title: "Pantries & shelters",
            body: "Post hours, flag when food arrives, and keep the public schedule honest.",
          },
          {
            n: "2",
            title: "CPR & first-aid trainers",
            body: "Get referrals when someone needs a real certification for work or licensing.",
          },
          {
            n: "3",
            title: "Tiny teams (1–5 people)",
            body: "Help with free nonprofit software, email security, and basic bookkeeping paths.",
          },
        ].map((card) => (
          <article key={card.n} className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <span className="flex size-10 items-center justify-center rounded-lg bg-paper-sunken font-display text-lg font-semibold text-sea">
              {card.n}
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold">{card.title}</h2>
            <p className="mt-2 text-ink-soft">{card.body}</p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl bg-pine p-5 text-paper-raised sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Register your organization</h2>
        <p className="mt-2 text-paper-sunken">
          Join the Brevard referral network. This opens your email app so the note actually reaches
          us.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-2xl bg-pine-deep p-5">
            <Check className="size-8 text-paper-sunken" aria-hidden />
            <h3 className="mt-2 font-display text-xl font-semibold">Email draft opened</h3>
            <p className="mt-1 text-paper-sunken">
              Send it when you’re ready. If nothing opened, write us at hello@baseimpact.org.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setSubmitted(false)}>
              Edit and try again
            </Button>
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
                className="bg-pine-deep text-paper-raised placeholder:text-paper-sunken/80"
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
                className="bg-pine-deep text-paper-raised placeholder:text-paper-sunken/80"
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
                className="bg-pine-deep text-paper-raised placeholder:text-paper-sunken/80"
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
                className="bg-pine-deep text-paper-raised placeholder:text-paper-sunken/80"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="type">What you offer</FieldLabel>
              <SelectField
                id="type"
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="bg-pine-deep text-paper-raised"
              >
                <option>Food Pantry / Meal Provider</option>
                <option>Shelter & Housing Provider</option>
                <option>Certified CPR / First Aid Business Partner</option>
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
                className="bg-pine-deep text-paper-raised placeholder:text-paper-sunken/80"
              />
            </div>

            {/* Honeypot */}
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

            <TurnstileWidget fallbackHref="mailto:hello@baseimpact.org" />

            <p className="sm:col-span-2 text-xs text-paper-sunken">
              This form opens your email app with a pre-filled message. If nothing opens, write hello@baseimpact.org directly.
            </p>

            <Button type="submit" variant="primary" size="lg" className="sm:col-span-2">
              Submit registration
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
