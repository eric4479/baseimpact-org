import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

const DONATE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

const STEPS = [
  {
    title: "Give directly to our partners",
    body: "We don't take cash deposits yet. The fastest way to help right now is to give directly to the food pantries, shelters, and churches already doing the work. We list them with contact info and what they need most.",
  },
  {
    title: "Give goods",
    body: "Hygiene kits, backpacks, school supplies, non-perishable food, working laptops, and professional clothing all move through our network. Call or email first so we coordinate timing and location.",
  },
  {
    title: "Give time",
    body: "Volunteer at our Scottsmoor station, help pack care packages, work the community garden, or help a small church with tech. You don't need a nonprofit background — just show up and listen.",
  },
  {
    title: "When we're 501(c)(3) approved",
    body: "We will post our EIN and a secure donation portal here. Until then, any cash directed to a specific cause goes straight to the partner doing that work, and we confirm where it went.",
  },
];

export function DonatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageMeta
        title="Ways to give"
        description="Pre-filing nonprofit giving guide: direct partner donations, goods, and time."
        path="/donate"
      />
      <JsonLd data={DONATE_SCHEMA} />
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Ways to give</h1>
        <p className="text-ink-soft">
          Base Impact Inc. is not yet a 501(c)(3) approved organization. Here&apos;s how you can help
          while we finish our Sunbiz filing and IRS application.
        </p>
      </header>

      <div className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <p className="text-sm font-semibold text-amber">
          Pre-filing status: donations are not yet tax-deductible. We&apos;re building in the open
          about that — because if we&apos;re asking for your trust, you should know exactly where we
          stand.
        </p>
      </div>

      <div className="space-y-4">
        {STEPS.map((step) => (
          <article
            key={step.title}
            className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]"
          >
            <h2 className="font-display text-xl font-semibold">{step.title}</h2>
            <p className="mt-2 text-ink-soft">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
          <Link to="/give">See full giving guide</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link to="/contact">Questions before giving</Link>
        </Button>
      </div>

      <p className="text-xs text-ink-soft">
        Have a correction or want to discuss how donations will be handled once we&apos;re
        approved?{" "}
        <Link to="/feedback" className="font-semibold text-sea underline-offset-2 hover:underline">
          Send feedback
        </Link>
        .
      </p>
    </div>
  );
}
