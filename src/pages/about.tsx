import { Link } from "@/lib/nav";
import { Shield } from "lucide-react";

export function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sea">Mission & governance</p>
        <h1 className="font-display text-3xl font-semibold">How Base Impact is built</h1>
        <p className="max-w-2xl text-ink-soft">
          We publish the blueprint before Sunbiz filing so neighbors can see the work, not just a
          logo.
        </p>
      </header>

      <section className="rounded-3xl bg-pine p-5 text-paper-raised sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
          <Shield className="size-6 text-paper-sunken" aria-hidden />
          Board duties
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              title: "Duty of care",
              body: "Show up, read the numbers before a vote, and treat other people’s money like it is not ours.",
            },
            {
              title: "Duty of loyalty",
              body: "Organization first. Annual conflict-of-interest forms. No private inurement.",
            },
            {
              title: "Duty of obedience",
              body: "Stay inside 501(c)(3) rules, Florida filings, and the purpose of each grant.",
            },
          ].map((duty) => (
            <article key={duty.title} className="rounded-2xl bg-pine-deep p-4">
              <h3 className="font-display text-lg font-semibold">{duty.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-sunken">{duty.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">Draft IRS purpose clause</h2>
        <p className="mt-3 rounded-xl bg-paper-sunken p-4 font-mono text-sm leading-relaxed text-ink">
          Base Impact Inc. is organized exclusively for charitable, educational, and scientific
          purposes under Section 501(c)(3) of the Internal Revenue Code. Specifically, the
          organization delivers technical literacy instruction, digital navigation assistance for
          housing and employment, environmental stewardship grants for community gardens, and
          direct resource referrals for under-resourced populations and grassroots charitable
          entities.
        </p>
      </section>

      <p className="text-ink-soft">
        Have a correction or want to join the board conversation?{" "}
        <Link to="/feedback" className="font-semibold text-sea underline-offset-2 hover:underline">
          Send feedback
        </Link>
        .
      </p>
    </div>
  );
}
