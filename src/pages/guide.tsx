import { JsonLd } from "@/components/json-ld";
import { PageMeta } from "@/components/page-meta";
import { Link } from "@/lib/nav";
import type { Path } from "@/lib/nav";
import { Button } from "@/components/ui/button";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I find food or shelter right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the directory or call 211 for immediate help. 911 is for emergencies.",
      },
    },
    {
      "@type": "Question",
      name: "How do I volunteer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Visit the volunteer page or contact us directly. No nonprofit experience required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I donate goods or money?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cash donations are directed to partner organizations until our 501(c)(3) is approved. Goods can be coordinated through the give page.",
      },
    },
  ],
};

const SITUATIONS: Array<{
  title: string;
  links: Array<{ label: string; to: Path | string; detail: string }>;
}> = [
  {
    title: "I need food now",
    links: [
      { label: "North Brevard Food Pantry & Outreach", to: "/directory", detail: "Mon–Fri 9 AM–12 PM, no ID required" },
      { label: "Mims Community Garden", to: "/directory", detail: "Saturday 8–11 AM, fresh produce" },
      { label: "Call 211", to: "tel:211", detail: "for other food resources near you" },
    ],
  },
  {
    title: "I need a place to stay tonight",
    links: [
      { label: "Call 211", to: "tel:211", detail: "they have the current shelter bed list" },
      { label: "St. Gabriel Episcopal Hope Center", to: "/directory", detail: "Tue & Thu 10 AM–1:30 PM, meals, showers, travel help" },
      { label: "Call 911", to: "tel:911", detail: "if you're in immediate danger" },
    ],
  },
  {
    title: "I'm traveling and stranded",
    links: [
      { label: "St. Gabriel Hope Center", to: "/directory", detail: "shower vouchers and emergency gas cards for travelers" },
      { label: "Call 211", to: "tel:211", detail: "for transit and traveler resources" },
      { label: "Base Impact station", to: "/contact", detail: "we can help with a phone, a map, and a call" },
    ],
  },
  {
    title: "I need a computer or help with a job application",
    links: [
      { label: "Scottsmoor Community Care Hub", to: "/directory", detail: "Mon/Wed/Fri 1–5 PM — free computer access, housing portal walk-throughs, job application help" },
    ],
  },
  {
    title: "I'm part of a church or small nonprofit and want to partner",
    links: [
      { label: "Register your organization", to: "/partners", detail: "pantries, shelters, churches, trainers, tiny teams" },
    ],
  },
  {
    title: "I'm looking for care packages, clothing, or hygiene kits",
    links: [
      { label: "Check our directory", to: "/directory", detail: "for current locations offering these — hours change, so call first" },
      { label: "Contact us", to: "/contact", detail: "we're working on a regular care-package distribution" },
    ],
  },
  {
    title: "I need mental health or disability support",
    links: [
      { label: "Call or text 988", to: "tel:988", detail: "Suicide & Crisis Lifeline, 24/7" },
      { label: "Call 211", to: "tel:211", detail: "they can route you to county and community resources" },
      { label: "Contact us", to: "/contact", detail: "we can help you make the calls and understand what you're being offered" },
    ],
  },
  {
    title: "I don't see my situation here",
    links: [
      { label: "Contact us", to: "/contact", detail: "we'll point you the right direction, even if it's outside Central Florida" },
      { label: "Call 211", to: "tel:211", detail: "24/7 local resource helpline" },
    ],
  },
];

const EXTERNAL_DIRECTORIES = [
  { label: "Find 211", url: "https://www.211.org", desc: "National resource helpline directory" },
  { label: "SAMHSA Treatment Locator", url: "https://findtreatment.samhsa.gov", desc: "Mental health and substance use resources" },
  { label: "Florida DCF", url: "https://www.myflorida.com/accessflorida/", desc: "SNAP, TANF, and state assistance programs" },
  { label: "Brevard County", url: "https://www.brevardcounty.us", desc: "County services and programs" },
  { label: "Feeding Florida", url: "https://feedingflorida.org", desc: "State food bank network" },
];

export function GuidePage() {
  return (
    <div className="space-y-10">
      <PageMeta
        title="Resource guide"
        description="Pick your situation and we'll point you to food, shelter, and help across Central Florida."
        path="/guide"
      />
      <JsonLd data={ORG_SCHEMA} />

      <section className="overflow-hidden rounded-3xl bg-pine px-5 py-8 text-paper-raised sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Not sure where to start? Pick your situation.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper-sunken sm:text-lg">
          No sign-up. No judgment. Pick what fits and we&apos;ll point you to the right place.
          If you need help right now, skip this and{" "}
          <a href="tel:211" className="font-semibold text-paper-raised underline-offset-2 hover:underline">
            call 211
          </a>{" "}
          or{" "}
          <a href="tel:911" className="font-semibold text-paper-raised underline-offset-2 hover:underline">
            call 911
          </a>
          .
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SITUATIONS.map((s) => (
            <div key={s.title} className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-xl font-semibold">{s.title}</h2>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.label}>
                    {l.to.startsWith("tel:") ? (
                      <a href={l.to} className="text-sm font-semibold text-sea hover:underline">
                        {l.label} →
                      </a>
                    ) : l.to.startsWith("http") ? (
                      <a href={l.to} target="_blank" rel="noreferrer" className="text-sm font-semibold text-sea hover:underline">
                        {l.label} →
                      </a>
                    ) : (
                      <Link to={l.to as Path} className="text-sm font-semibold text-sea hover:underline">
                        {l.label} →
                      </Link>
                    )}
                    <p className="text-xs text-ink-soft">{l.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-paper-sunken px-5 py-8 sm:p-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Phone always works.</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          If this is a lot to read on a screen,{" "}
          <a href="tel:211" className="font-semibold text-sea underline-offset-2 hover:underline">
            call 211
          </a>
          . They&apos;re open 24/7 and they know the current list of who&apos;s open, who has beds,
          and who has food. We&apos;re not replacing 211 — we&apos;re making it easier to know who
          to call.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="call">
            <a href="tel:211">Call 211</a>
          </Button>
          <Button asChild variant="emergency">
            <a href="tel:911">Call 911</a>
          </Button>
          <Button asChild variant="pine">
            <a href="tel:988">Call or text 988</a>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Other resource directories worth knowing</h2>
        <p className="text-ink-soft">
          These national and state directories cover broader areas — useful if our local directory
          doesn&apos;t have what you need:
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EXTERNAL_DIRECTORIES.map((d) => (
            <li key={d.label}>
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-paper-raised px-4 py-3 text-sm font-semibold text-sea shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] block"
              >
                {d.label} →
                <span className="block text-xs font-normal text-ink-soft">{d.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
