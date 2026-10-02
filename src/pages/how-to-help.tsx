import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

/**
 * How to help — deliberately without asking for money.
 *
 * Base Impact is not yet registered with FDACS under Chapter 496, F.S., the Florida
 * statute that governs charitable solicitation. Until FDACS approves a registration the
 * organisation must not solicit contributions, so this page carries no request for money
 * and no request for goods to be dropped off.
 *
 * That rules out more than it sounds like:
 *
 *   - asking for money, in any wording
 *   - asking for goods to be brought to us, because that is a contribution to us
 *   - pointing readers at named charities to donate to, because Ch. 496 defines
 *     solicitation to include requests made ON BEHALF OF a charitable organisation,
 *     which is exactly what "give to these pantries" is
 *   - organising or promoting fundraising events
 *
 * What is left is everything that genuinely helps and asks for nothing: volunteering,
 * partnering, keeping the directory honest, and telling someone who needs it.
 *
 * THIS PAGE IS TEMPORARY BY DESIGN. Once FDACS approves the registration and the
 * 501(c)(3) is recognised, a giving section can come back and the /give path restored.
 * The 301s from /give and /donate point here in the meantime.
 */

const HOW_TO_HELP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

const WAYS = [
  {
    title: "Volunteer your hours",
    body:
      "Sit with someone while they fill out a housing application, help a neighbour update a " +
      "resume, pack care packages, or help a small church with its Wi-Fi and backups. You do " +
      "not need a nonprofit background — if you can show up and be kind, that is most of it.",
    to: "/volunteer" as const,
    cta: "See volunteer opportunities →",
  },
  {
    title: "Register your organization",
    body:
      "If you run a pantry, a shelter, a church outreach, or a small community group, list " +
      "yourself in the directory. It is free, and it is the most useful thing a local " +
      "organization can do for the people we point your way.",
    to: "/partners" as const,
    cta: "Register your organization →",
  },
  {
    title: "Tell us when a listing is wrong",
    body:
      "The directory is only as good as it is current. If you travelled somewhere and it was " +
      "closed, moved, or out of food, say so — that is how the next person avoids the same " +
      "wasted trip. This is the single most valuable thing anyone can do for this project.",
    to: "/feedback" as const,
    cta: "Report a listing →",
  },
  {
    title: "Send it to someone who needs it",
    body:
      "If you know someone who is new to the area, between jobs, or just does not know where " +
      "to start, send them the directory. Big buttons, real hours, built for a phone. No " +
      "account, nothing to sign up for.",
    to: "/directory" as const,
    cta: "Open the directory →",
  },
  {
    title: "Serve on the board",
    body:
      "We are assembling a founding board — people who care about North Brevard and are " +
      "willing to show up. Governance experience is welcome but not required; showing up is.",
    to: "/about" as const,
    cta: "Learn about board service →",
  },
];

export function HowToHelpPage() {
  return (
    <div className="space-y-10">
      <PageMeta
        title="How to help"
        description="Volunteer, partner, or keep the directory accurate. Base Impact is a pre-filing nonprofit and is not asking for money."
        path="/how-to-help"
      />
      <JsonLd data={HOW_TO_HELP_SCHEMA} />

      <section className="overflow-hidden rounded-3xl bg-band px-5 py-8 text-on-fill sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Help without giving money.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-faint sm:text-lg">
          Base Impact Inc. is a pre-filing nonprofit. We are not yet registered to solicit
          contributions in Florida and we are not 501(c)(3) approved, so{" "}
          <strong className="font-semibold text-on-fill">
            we are not asking anyone for money or goods right now
          </strong>
          . Here is what actually helps in the meantime.
        </p>
      </section>

      <section className="space-y-4">
        {WAYS.map((w) => (
          <div key={w.title} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-xl font-semibold">{w.title}</h2>
            <p className="mt-2 text-sm text-muted">{w.body}</p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to={w.to}>{w.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-inset px-5 py-8 sm:p-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Where we are</h2>
        <p className="mt-3 text-sm text-muted">
          Base Impact Inc. is a pre-filing nonprofit in Scottsmoor, Florida. We are preparing
          our Florida Sunbiz registration and our application for recognition of exemption
          under Section 501(c)(3) of the Internal Revenue Code. We are not yet a registered
          or tax-exempt organization, and nothing on this page should be read to claim
          otherwise.
        </p>
        <p className="mt-3 text-sm text-muted">
          When that changes, this page will say so, and giving will be possible then.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/contact">Contact us →</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/about">About Base Impact →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
