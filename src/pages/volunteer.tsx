import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

const VOLUNTEER_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function VolunteerPage() {
  return (
    <div className="space-y-10">
      <PageMeta
        title="Volunteer with Base Impact"
        description="Give a few hours at our Scottsmoor station, care-package days, or community garden."
        path="/volunteer"
      />
      <JsonLd data={VOLUNTEER_SCHEMA} />
      <section className="overflow-hidden rounded-3xl bg-pine px-5 py-8 text-paper-raised sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Give a few hours. Change someone&apos;s week.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper-sunken sm:text-lg">
          You don&apos;t need a nonprofit background to help. If you can show up, listen, and help
          someone fill out a form or carry a bag — you&apos;re qualified for most of what we do.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
            <Link to="/join">Sign up to volunteer →</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/contact">Contact us first</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">What volunteering looks like</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Scottsmoor Community Care Hub</h3>
            <p className="mt-1 text-sm font-semibold text-sea">Mon, Wed, Fri 1–5 PM</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Sit with someone while they fill out a housing application</li>
              <li>Help a neighbor write or update a resume</li>
              <li>Show someone how to stay safe online and keep their device updated</li>
              <li>Hand out hygiene kits and listen if someone wants to talk</li>
              <li>Keep the space tidy and welcoming</li>
            </ul>
          </article>

          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Care package and backpack days</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Pack bags with essential items — socks, hygiene supplies, water, snacks, resource list</li>
              <li>Help sort donated clothing and supplies</li>
              <li>Hand packages out at scheduled distribution times</li>
            </ul>
          </article>

          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Community garden days</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Help at the Mims Community Garden — planting, weeding, harvest, distribution</li>
              <li>Assist with nutrition education workshops</li>
            </ul>
          </article>

          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Tech help for small nonprofits</h3>
            <p className="mt-2 text-sm text-ink-soft">
              If you know IT, help a local church or pantry with Wi-Fi, backups, printer setup, basic
              security. If you don&apos;t — we can train you on the basics we actually use.
            </p>
          </article>

          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Behind the scenes</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Research and verify local resources for the directory</li>
              <li>Call partners and confirm their hours</li>
              <li>Help update this site and keep information current</li>
              <li>Help with fundraising events</li>
            </ul>
          </article>

          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Fundraising events</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Help organize and run rummage sales, food drives, and community fundraisers. We
              recently partnered with LifePointe Ministries on a rummage sale — that model works and
              we want to do more of it.
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">What we ask</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Show up when you say you will</li>
          <li>Treat everyone with the same respect you&apos;d want for yourself or your family</li>
          <li>Keep what people share with you private — their story isn&apos;t public material</li>
          <li>If you don&apos;t know the answer, say so — then help them find someone who does</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-paper-sunken px-5 py-8 sm:p-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">What we can&apos;t do (yet)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
          <li>We can&apos;t provide housing directly — we connect people to those who can</li>
          <li>We can&apos;t give cash assistance — we connect people to programs that can</li>
          <li>We can&apos;t do everything — but we can help you take the next step</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to help?</h2>
        <p className="text-ink-soft">Tell us what you&apos;re interested in and what times work. We&apos;ll follow up by phone or email.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/join">Sign up →</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact us →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
