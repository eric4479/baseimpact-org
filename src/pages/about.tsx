import { Link } from "@/lib/nav";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { PageMeta } from "@/components/page-meta";

const ABOUT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function AboutPage() {
  return (
    <div className="space-y-8">
      <PageMeta
        title="About Base Impact"
        description="Founder Eric Douglas's story, board duties, partner list, and pre-filing nonprofit status."
        path="/about"
      />
      <JsonLd data={ABOUT_SCHEMA} />
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sea">Mission & governance</p>
        <h1 className="font-display text-3xl font-semibold">How Base Impact is built</h1>
        <p className="max-w-2xl text-ink-soft">
          I&apos;m Eric Douglas. I&apos;ve spent my life working with computers and technology, running
          Douglas PC tech support in Mims, FL. Base Impact is the nonprofit I&apos;m building to take
          that same instinct — show up, fix what&apos;s broken, help the person in front of you — and
          apply it to the bigger need I see in our community.
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
              body: "Show up, read the numbers before a vote, and treat other people's money like it is not ours.",
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
        <h2 className="font-display text-xl font-semibold">Why I started this</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          I&apos;ve spent years helping people one-on-one — fixing laptops, setting up Wi-Fi for
          churches, walking someone through a job application. Lately some of those conversations
          turned into something bigger. Two people on a bike path, living in a tent, walking from
          Mims to South Carolina, asking for food and water. A veteran with PTSD whose family
          depends on a laptop that stopped working. A new resident who needed someone to sit with
          them through job applications. A church whose Wi-Fi, copiers, and security systems needed
          someone who&apos;d show up every week and keep them running. A rummage sale at LifePointe
          Ministries raising money for clothing, food, and shelter.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Every one of those moments had the same gap: people who need help don&apos;t have a single
          place to go to find out who&apos;s open, who has what, and how to get there. They&apos;re
          hunting through ten different websites or making calls that go nowhere. Base Impact is my
          attempt to build that neighborhood navigation desk.
        </p>
      </section>

      <section className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">Our partners</h2>
        <p className="mt-3 text-sm text-ink-soft">
          We work with and through local organizations — churches, food pantries, shelters,
          community gardens, CPR and first-aid trainers, and tiny teams doing big work. We don&apos;t
          replace any of them. We try to make it easier for people to find them and for them to be
          found.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Current partners include St. Gabriel Episcopal Hope Center, North Brevard Food Pantry &
          Outreach, Mims Community Garden & Produce Pantry, The Rock Church of Mims, and LifePointe
          Ministries. This list is growing.
        </p>
      </section>

      <section className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">Our status</h2>
        <p className="mt-3 text-sm text-ink-soft">
          Base Impact Inc. is a pre-filing nonprofit in Scottsmoor, FL. We&apos;re preparing our
          Florida Sunbiz filing and our 501(c)(3) application. We&apos;re not there yet. We&apos;re
          building in the open about that — because if we&apos;re asking for your trust, you should
          know exactly where we stand.
        </p>
      </section>

      <section className="rounded-2xl bg-paper-sunken px-5 py-8 sm:p-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Our board</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          We&apos;re looking for founding board members — people who care about this community and are
          willing to show up, read the numbers before a vote, and treat other people&apos;s money like
          it&apos;s not theirs. If that&apos;s you, we&apos;d like to talk.
        </p>
        <div className="mt-4">
          <Button asChild variant="primary">
            <Link to="/feedback">Join the board conversation →</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">Draft IRS purpose clause</h2>
        <p className="mt-3 rounded-xl bg-paper-sunken p-4 font-mono text-sm leading-relaxed text-ink">
          Base Impact Inc. is organized exclusively for charitable and educational purposes under
          Section 501(c)(3) of the Internal Revenue Code. Specifically, the organization delivers
          technical literacy instruction, digital navigation assistance for housing and employment,
          direct resource referrals for under-resourced populations, environmental stewardship
          support for community gardens, and free technology assistance to grassroots charitable and
          faith-based entities.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Note: &quot;scientific purposes&quot; was removed from an earlier draft — it doesn&apos;t fit
          what we do and could complicate the filing. Have a tax professional or attorney review
          this before you submit.
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

