import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";

export function ContactPage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-pine px-5 py-8 text-paper-raised sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Reach Base Impact.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper-sunken sm:text-lg">
          We&apos;re a small, pre-filing nonprofit. We read every message. Response times vary — if
          you need help now, call 211 or 911.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl font-semibold">By phone</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <strong>Emergency:</strong>{" "}
              <a href="tel:911" className="font-semibold text-danger hover:underline">Call 911</a>
            </li>
            <li>
              <strong>24/7 local help:</strong>{" "}
              <a href="tel:211" className="font-semibold text-sea hover:underline">Call 211</a>
            </li>
            <li>
              <strong>Base Impact station (Scottsmoor Community Care Hub):</strong>{" "}
              <a href="tel:3215550199" className="font-semibold text-sea hover:underline">
                Call 321-555-0199
              </a>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl font-semibold">By email</h2>
          <p className="mt-3">
            <a href="mailto:hello@baseimpact.org" className="font-semibold text-sea hover:underline">
              hello@baseimpact.org
            </a>
          </p>
        </div>

        <div className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl font-semibold">By mail</h2>
          <address className="mt-3 text-sm not-italic text-ink-soft">
            Base Impact Inc.<br />
            3750 Magoon Ave<br />
            Scottsmoor, FL 32775
          </address>
        </div>

        <div className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl font-semibold">In person</h2>
          <p className="mt-3 text-sm text-ink-soft">
            <strong>Scottsmoor Community Care Hub</strong><br />
            3750 Magoon Ave, Scottsmoor, FL 32775<br />
            Mon / Wed / Fri, 1:00 PM – 5:00 PM
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">When you write to us</h2>
        <p className="mt-3 text-sm text-ink-soft">
          Tell us what you need and what&apos;s most urgent. If we can help directly, we will. If
          we can&apos;t, we&apos;ll point you to the place that can — and we&apos;ll tell you what to
          say when you get there.
        </p>

        <h3 className="mt-4 font-display text-lg font-semibold">Response expectations</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>
            <strong>Immediate needs</strong> (food, shelter, safety): we try same-day, but we&apos;re
            a small team — if it&apos;s urgent, call 211 or 911 first
          </li>
          <li>
            <strong>Volunteer and partnership inquiries:</strong> we aim to respond within a few days
          </li>
          <li>
            <strong>General questions:</strong> we read everything, even if the reply takes a little
            time
          </li>
        </ul>
      </section>

      <section className="rounded-3xl bg-paper-sunken px-5 py-8 sm:p-8 space-y-3">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Urgent needs reminder</h2>
        <p className="text-ink-soft">This site is not a crisis service.</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>
            <strong>911</strong> — immediate danger
          </li>
          <li>
            <strong>211</strong> — 24/7 local resource helpline
          </li>
          <li>
            <strong>988</strong> — Suicide &amp; Crisis Lifeline (call or text), 24/7
          </li>
        </ul>
      </section>

      <section>
        <Button asChild variant="primary">
          <Link to="/feedback">Send a message →</Link>
        </Button>
      </section>
    </div>
  );
}
