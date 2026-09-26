import { JsonLd } from "@/components/json-ld";
import { PageMeta } from "@/components/page-meta";
import { Link } from "@/lib/nav";
import type { Path } from "@/lib/nav";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I find food or shelter right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Call 211 for the current list of food and shelter openings. 911 is for emergencies. The directory lists local pantries with their hours.",
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

/**
 * Services that apply to EVERY situation — the phone numbers that work no matter what
 * someone picked. Each one is rendered exactly once, in its own block.
 *
 * These used to be repeated inside most of the situation cards below, which turned the
 * page into the same three phone numbers listed over and over. A situation that has no
 * provider of its own now points back up here by name instead of listing the number
 * again.
 */
const HELPLINES: Array<{ label: string; to: string; handles: string; detail: string }> = [
  {
    label: "211",
    to: "tel:211",
    handles: "Food, shelter beds, utilities, transit, everything local",
    detail:
      "Open 24/7. They keep the current list of who is open, who has a bed tonight, and who has food.",
  },
  {
    label: "988",
    to: "tel:988",
    handles: "Mental health, crisis, and suicidal thoughts",
    detail: "Suicide & Crisis Lifeline. Call or text, 24/7. Free and confidential.",
  },
  {
    label: "911",
    to: "tel:911",
    handles: "Immediate danger or a medical emergency",
    detail: "Use this when someone is hurt or in danger right now.",
  },
  {
    label: "Base Impact",
    to: "/contact",
    handles: "Help making the calls and understanding what you're offered",
    detail: "By appointment — call or text first. We can help with a phone, a map, and a call.",
  },
];

/**
 * Situations, each listing ONLY the providers specific to it. Details and hours are
 * taken from the same verified records the directory uses, so nothing here can drift
 * out of step with the listings. Where a situation has no provider of its own, `note`
 * points back to HELPLINES rather than repeating a number.
 */
const SITUATIONS: Array<{
  title: string;
  providers: Array<{ label: string; to: Path | string; detail: string }>;
  note?: string;
}> = [
  {
    title: "I need food now",
    providers: [
      {
        label: "Mims United Methodist Church Food Pantry",
        to: "/directory",
        detail:
          "Tuesdays 10 AM–12 PM, or until food runs out — 3302 Green St, Mims. Closest pantry to Scottsmoor, no requirements.",
      },
      {
        label: "United North Brevard Food Pantry",
        to: "/directory",
        detail:
          "Tuesdays & Fridays 11 AM–3 PM — 412 Main St, Titusville. Choice pantry with fresh produce, no special requirements.",
      },
      {
        label: "No One Hungry — Pine St Pantry",
        to: "/directory",
        detail:
          "Tuesdays 10 AM–12 PM — 418 Pine St, Titusville. Bring ID or proof of Brevard County residency.",
      },
    ],
    note: "Need something today and these hours have passed? 211 knows who else is open.",
  },
  {
    title: "I need a place to stay tonight",
    providers: [],
    note: "Start with 211 — they hold the current shelter bed list, and it changes daily. If you are in immediate danger, use 911.",
  },
  {
    title: "I'm traveling and stranded",
    providers: [],
    note: "211 can point you to transit and traveler resources in whatever county you've stopped in.",
  },
  {
    title: "I need a computer or help with a job application",
    providers: [],
    note: "Base Impact can sit with you — housing portal walk-throughs and job applications, by appointment.",
  },
  {
    title: "I'm part of a church or small nonprofit and want to partner",
    providers: [
      {
        label: "Register your organization",
        to: "/partners",
        detail: "Pantries, shelters, churches, trainers, tiny teams — no nonprofit experience required.",
      },
    ],
  },
  {
    title: "I'm looking for care packages, clothing, or hygiene kits",
    providers: [
      {
        label: "Check the directory",
        to: "/directory",
        detail: "For current locations offering these. Hours change often, so call before you go.",
      },
    ],
  },
  {
    title: "I need mental health or disability support",
    providers: [],
    note: "988 is the fastest route for crisis support. For disability and benefits questions, 211 can route you to county and community programs.",
  },
  {
    title: "I don't see my situation here",
    providers: [],
    note: "Call 211 — they cover far more than we do. You can also contact us and we'll point you the right direction, even outside Central Florida.",
  },
];

const EXTERNAL_DIRECTORIES = [
  { label: "SAMHSA Treatment Locator", url: "https://findtreatment.samhsa.gov", desc: "Mental health and substance use resources" },
  { label: "Florida DCF", url: "https://www.myflorida.com/accessflorida/", desc: "SNAP, TANF, and state assistance programs" },
  { label: "Brevard County", url: "https://www.brevardcounty.us", desc: "County services and programs" },
  { label: "Feeding Florida", url: "https://feedingflorida.org", desc: "State food bank network" },
];

function ProviderLink({ label, to }: { label: string; to: Path | string }) {
  if (to.startsWith("tel:") || to.startsWith("http")) {
    return (
      <a
        href={to}
        {...(to.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
        className="text-sm font-semibold text-accent hover:underline"
      >
        {label} →
      </a>
    );
  }
  return (
    <Link to={to as Path} className="text-sm font-semibold text-accent hover:underline">
      {label} →
    </Link>
  );
}

export function GuidePage() {
  return (
    <div className="space-y-10">
      <PageMeta
        title="Resource guide"
        description="Pick your situation and we'll point you to food, shelter, and help across Central Florida."
        path="/guide"
      />
      <JsonLd data={ORG_SCHEMA} />

      <section className="overflow-hidden rounded-3xl bg-band px-5 py-8 text-on-fill sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Not sure where to start? Pick your situation.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-faint sm:text-lg">
          No sign-up. No judgment. Pick what fits and we&apos;ll point you to the right place.
        </p>
      </section>

      {/* Every cross-cutting number, listed once. Anything below that needs one of these
          names it rather than repeating it. */}
      <section aria-labelledby="numbers">
        <h2 id="numbers" className="font-display text-2xl font-semibold sm:text-3xl">
          Three numbers cover most of it.
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Whatever you picked below, these work. Each one is listed on this page once.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HELPLINES.map((h) => (
            <li
              key={h.label}
              className="flex flex-col rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
            >
              <ProviderLink label={h.label} to={h.to} />
              <p className="mt-2 text-sm font-medium text-body">{h.handles}</p>
              <p className="mt-1 text-xs text-muted">{h.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-2xl text-sm text-muted">
          If reading all this on a screen is too much, any of the numbers above works — that is
          what they are for. We&apos;re not replacing 211; we&apos;re making it easier to know who
          to call.
        </p>
      </section>

      <section aria-labelledby="situations" className="space-y-4">
        <h2 id="situations" className="font-display text-2xl font-semibold sm:text-3xl">
          What&apos;s going on right now?
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SITUATIONS.map((s) => (
            <div key={s.title} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-display text-xl font-semibold">{s.title}</h3>
              {s.providers.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {s.providers.map((p) => (
                    <li key={p.label}>
                      <ProviderLink label={p.label} to={p.to} />
                      <p className="text-xs text-muted">{p.detail}</p>
                    </li>
                  ))}
                </ul>
              )}
              {s.note && <p className="mt-3 text-sm text-faint">{s.note}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Other resource directories worth knowing
        </h2>
        <p className="text-muted">
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
                className="rounded-xl bg-card px-4 py-3 text-sm font-semibold text-accent shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] block"
              >
                {d.label} →
                <span className="block text-xs font-normal text-muted">{d.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}