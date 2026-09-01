import { Link } from "@/lib/nav";
import type { Path } from "@/lib/nav";
import { Button } from "@/components/ui/button";

const ROUTES: Array<{ label: string; desc: string; to: Path; cta: string }> = [
  {
    label: "I want to volunteer",
    desc: "See what volunteering looks like and sign up.",
    to: "/volunteer",
    cta: "See volunteer opportunities →",
  },
  {
    label: "I want to partner as an organization",
    desc: "Pantries, shelters, churches, CPR/first-aid trainers, small teams: register.",
    to: "/partners",
    cta: "Register your organization →",
  },
  {
    label: "I want to give",
    desc: "Money, goods, or time — pick what you can.",
    to: "/give",
    cta: "Ways to give →",
  },
  {
    label: "I want to join the board",
    desc: "Founding board members — people who care about this community and are willing to show up.",
    to: "/about",
    cta: "Learn about board service →",
  },
  {
    label: "I just want to stay informed",
    desc: "Drop your email and we'll let you know when we have updates worth sharing.",
    to: "/feedback",
    cta: "Stay informed →",
  },
  {
    label: "Not sure which fits",
    desc: "Tell us a little about yourself and we'll point you the right direction.",
    to: "/feedback",
    cta: "Send feedback →",
  },
];

export function JoinPage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-pine px-5 py-8 text-paper-raised sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Be part of Base Impact.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper-sunken sm:text-lg">
          We&apos;re a small, growing nonprofit in North Brevard. There&apos;s room for more hands,
          more partners, and more board members. Pick what fits you.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROUTES.map((r) => (
            <div key={r.label} className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-xl font-semibold">{r.label}</h2>
              <p className="mt-2 text-sm text-ink-soft">{r.desc}</p>
              <Link to={r.to} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sea hover:underline">
                {r.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-paper-sunken px-5 py-8 sm:p-8 space-y-3">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Prefer to talk first?</h2>
        <p className="text-ink-soft">
          Call or email us — we&apos;re happy to answer questions before you commit.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="tel:211">211 for immediate help</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
