import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

const IMPACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function ImpactPage() {
  return (
    <div className="space-y-10">
      <PageMeta
        title="Impact stories"
        description="Real stories from Base Impact: travelers, veterans, new residents, and church partnerships."
        path="/impact"
      />
      <JsonLd data={IMPACT_SCHEMA} />
      <section className="overflow-hidden rounded-3xl bg-pine px-5 py-8 text-paper-raised sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Recent things that happened because people showed up.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper-sunken sm:text-lg">
          Small stories, real people. Names changed to protect privacy. We add new ones when they
          happen — this page grows as we do.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Two travelers on the bike path</h2>
        <p className="max-w-2xl text-ink-soft">
          Two people walking from Mims toward South Carolina, living out of a tent, stopped on the
          bike path and asked for food and water. We were able to provide both, plus a little cash
          for the next leg, and we prayed with them for safe travels. They kept moving. We keep
          hoping they made it.
        </p>
        <p className="text-sm text-ink-soft">
          <strong>What this points to:</strong> Travelers and unsheltered people pass through Brevard
          more than most people realize. St. Gabriel Hope Center in Titusville is one of the few
          places offering shower vouchers and emergency gas cards for travelers. We&apos;re working to
          make sure people know it&apos;s there and how to get there.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Food and water for two travelers on the bike path</li>
          <li>Emergency cash for the next leg of their journey</li>
          <li>Prayer and blessing for safe travels</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" size="sm">
            <Link to="/directory">Find traveler resources →</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="tel:211">Call 211 for traveler help</a>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">A veteran with PTSD got his laptop working again</h2>
        <p className="max-w-2xl text-ink-soft">
          A veteran in our community was dealing with PTSD and the daily frustrations that come with
          it. His laptop — the one his family of five depends on — had stopped working correctly, and
          the security updates had lapsed, leaving them exposed. We fixed it, reinstalled what he
          needed, and set up a way to keep security updates going automatically so his family could
          use it safely.
        </p>
        <p className="text-sm text-ink-soft">
          <strong>What this points to:</strong> A working, safe computer isn&apos;t a luxury for a lot
          of people — it&apos;s how they apply for jobs, reach their kids&apos; school, and stay
          connected. We do this kind of work regularly, and we&apos;d like to do more of it.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Fixed a non-working laptop for a veteran with PTSD</li>
          <li>Reinstalled needed software</li>
          <li>Set up automatic security updates for safe family use</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" size="sm">
            <Link to="/directory">Find tech help →</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/volunteer">Volunteer to help with tech →</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">A new Brevard resident got help finding work</h2>
        <p className="max-w-2xl text-ink-soft">
          A newly arrived resident needed help with resume edits and one-on-one help navigating job
          applications. We sat down together, worked through multiple applications, and built a
          process they could keep using on their own. Personalized help — sitting next to someone,
          not just sending a link — makes the difference here.
        </p>
        <p className="text-sm text-ink-soft">
          <strong>What this points to:</strong> Digital navigation help is one of the most-requested
          things at our Scottsmoor station. People don&apos;t need more websites — they need someone
          to walk through the one they&apos;re on with them.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Resume edits for a new Brevard resident</li>
          <li>One-on-one personalized tutorials for job applications</li>
          <li>A repeatable process they can keep using on their own</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" size="sm">
            <Link to="/directory">Find job help →</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/volunteer">Volunteer to help with job prep →</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-3xl bg-paper-sunken px-5 py-8 sm:p-8 space-y-6">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">From our church partnerships</h2>

        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold">LifePointe Ministries</h3>
          <p className="text-ink-soft">
            We volunteered at a recent rummage sale and fundraising activities to help fund their
            efforts providing clothing, food, and shelter to people in our community. Events like
            that are how small churches keep their pantry shelves and ministry going — and they
            always need more hands.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/partners">Partner with us →</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/volunteer">Volunteer →</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">If you have a story to share</h2>
        <p className="text-ink-soft">
          If Base Impact or one of our partner organizations has helped you or someone you know,
          we&apos;d like to hear about it — especially if sharing it helps someone else find help.
          Names are optional and will be respected.
        </p>
        <Button asChild variant="primary">
          <Link to="/feedback">Share a story →</Link>
        </Button>
      </section>
    </div>
  );
}
