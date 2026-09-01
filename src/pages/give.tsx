import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";

const PARTNERS = [
  {
    name: "St. Gabriel Episcopal Hope Center",
    note: "Hot meals, shower vouchers, emergency gas cards for travelers",
    hours: "Tue & Thu 10 AM–1:30 PM",
    addr: "414 Pine St, Titusville, FL 32796",
    phone: "(321) 267-2545",
  },
  {
    name: "North Brevard Food Pantry & Outreach",
    note: "Emergency grocery boxes, hot lunch program",
    hours: "Mon–Fri 9 AM–12 PM",
    addr: "4475 S Hopkins Ave, Titusville, FL 32780",
    phone: "(321) 269-6655",
  },
  {
    name: "Mims Community Garden & Produce Pantry",
    note: "Fresh produce, nutrition education",
    hours: "Saturday 8–11 AM",
    addr: "2470 Kelly Rd, Mims, FL 32754",
    phone: "(321) 555-0144",
  },
  {
    name: "LifePointe Ministries",
    note: "Clothing, food, shelter outreach — fundraising events support pantry shelves",
    hours: "Call for hours",
    addr: "Brevard County, FL",
    phone: "",
  },
];

const HIGH_PRIORITY = [
  "Hygiene kits (toothbrush, toothpaste, soap, deodorant, feminine products)",
  "Backpacks with school supplies for K–12",
  "Non-perishable protein-rich food (peanut butter, canned meat, beans)",
  "Working laptops in good condition for families in need",
  "Professional clothing suitable for job interviews",
  "Blankets, sleeping bags, tents for people without shelter",
];

export function GivePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-pine px-5 py-8 text-paper-raised sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Help neighbors in North Brevard find food, shelter, and a way forward.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper-sunken sm:text-lg">
          Base Impact Inc. is a pre-filing nonprofit in Scottsmoor, FL. We&apos;re building a
          neighborhood navigation desk — big buttons, real hours, built for phones. We&apos;re not
          501(c)(3) approved yet. Here&apos;s how you can help in the meantime.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
            <a href="#give-directly">Give to a partner</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="#give-goods">Give goods</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="#give-time">Give time</a>
          </Button>
        </div>
      </section>

      <section id="give-directly" className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          1. Give directly to the partners we work with
        </h2>
        <p className="max-w-2xl text-ink-soft">
          We don&apos;t take cash deposits yet — we connect you to the food pantries, shelters,
          and churches doing the work on the ground. If you want your dollars to buy groceries,
          fill a care package, or keep a shower trailer running, we&apos;ll point you to the group
          best positioned to use it well.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PARTNERS.map((p) => (
            <article key={p.name} className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">{p.note}</p>
              <p className="mt-2 text-sm font-semibold">{p.hours}</p>
              {p.phone && (
                <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-sea">
                  Call {p.phone}
                </a>
              )}
              <p className="mt-1 text-xs text-ink-soft">{p.addr}</p>
            </article>
          ))}
        </div>
        <p>
          <Link to="/directory" className="font-semibold text-sea underline-offset-2 hover:underline">
            See full directory →
          </Link>
        </p>
      </section>

      <section id="give-goods" className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">2. Give goods</h2>
        <p className="max-w-2xl text-ink-soft">
          Hygiene kits, backpacks, school supplies, non-perishable food, working laptops, and
          gently used professional clothing all move through our network.
        </p>
        <p className="text-sm font-semibold text-amber">
          Call or email before dropping things off so we don&apos;t turn away a donation we can&apos;t
          store. We coordinate timing and location through our partners — what we can accept changes
          week to week.
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HIGH_PRIORITY.map((item) => (
            <li key={item} className="rounded-xl bg-paper-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]">
              {item}
            </li>
          ))}
        </ul>
        <p>
          <Link to="/contact" className="font-semibold text-sea underline-offset-2 hover:underline">
            Contact us to coordinate a drop-off →
          </Link>
        </p>
      </section>

      <section id="give-time" className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">3. Give time</h2>
        <p className="max-w-2xl text-ink-soft">
          You don&apos;t need a nonprofit background to help. If you can show up, listen, and help
          someone fill out a form or carry a bag — you&apos;re qualified for most of what we do.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Scottsmoor Community Care Hub</h3>
            <p className="mt-1 text-sm font-semibold text-sea">Mon, Wed, Fri 1–5 PM</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Sit with someone while they fill out a housing application</li>
              <li>Help a neighbor write or update a resume</li>
              <li>Show someone how to stay safe online and keep their device updated</li>
              <li>Hand out hygiene kits and listen if someone wants to talk</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Care package and backpack days</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Pack bags with essential items — socks, hygiene supplies, water, snacks</li>
              <li>Help sort donated clothing and supplies</li>
              <li>Hand packages out at scheduled distribution times</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Community garden days</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Help at the Mims Community Garden — planting, weeding, harvest</li>
              <li>Assist with nutrition education workshops</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Tech help for small nonprofits</h3>
            <p className="mt-2 text-sm text-ink-soft">
              If you know IT, help a local church or pantry with Wi-Fi, backups, printer setup,
              basic security. If you don&apos;t — we can train you on the basics we actually use.
            </p>
          </article>
          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Fundraising events</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Help organize and run rummage sales, food drives, and community fundraisers. We
              recently partnered with LifePointe Ministries on a rummage sale — that model works
              and we want to do more of it.
            </p>
          </article>
          <article className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
            <h3 className="font-display text-lg font-semibold">Behind the scenes</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Research and verify local resources for the directory</li>
              <li>Call partners and confirm their hours</li>
              <li>Help update this site and keep information current</li>
            </ul>
          </article>
        </div>
        <div>
          <Button asChild variant="primary" size="lg">
            <Link to="/volunteer">Sign up to volunteer →</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-3xl bg-paper-sunken px-5 py-8 sm:p-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">When we have our 501(c)(3)</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Donations will be tax-deductible. We&apos;ll post our EIN and donation portal here.
          Until then, any cash you want to direct to a specific cause — meals, showers, garden
          supplies, tech for a family — we&apos;ll route it to the partner doing that work and
          confirm where it went. We&apos;re building in the open. You can follow our status on the{" "}
          <Link to="/about" className="font-semibold text-sea underline-offset-2 hover:underline">
            about page
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Questions before you give?</h2>
        <p className="text-ink-soft">We&apos;d rather you ask first. No pressure.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="tel:211">Call 211 for immediate help</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
