import { Link } from "@/lib/nav";
import { Building2, Compass, Heart, Laptop, Leaf, Phone, Search } from "lucide-react";
import { useUiStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { PageMeta } from "@/components/page-meta";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
  description:
    "Pre-filing nonprofit in Scottsmoor, FL building a neighborhood navigation desk for Brevard, Volusia, and Orange Counties.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3750 Magoon Ave",
    addressLocality: "Scottsmoor",
    addressRegion: "FL",
    postalCode: "32775",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-321-323-0999",
    contactType: "customer service",
  },
};

const PILLARS = [
  {
    icon: Laptop,
    title: "Digital & job help",
    body: "Walk-throughs for housing portals, job applications, and staying safe online.",
  },
  {
    icon: Heart,
    title: "Direct referrals",
    body: "Food, shelter, showers, and first-aid training — pointed to partners who are open.",
  },
  {
    icon: Leaf,
    title: "Gardens & green space",
    body: "Grant support for community gardens and quiet outdoor places in North Brevard.",
  },
  {
    icon: Building2,
    title: "Tech for small nonprofits",
    body: "Free setup help for churches, pantries, and 1–5 person community groups.",
  },
];

export function HomePage() {
  const openTriage = useUiStore((s) => s.openTriage);

  return (
    <div className="space-y-10">
      <PageMeta
        title="Find food, shelter, and a computer"
        description="Base Impact is a neighborhood navigation desk built first for phones. Find help nearby in Brevard, Volusia, and Orange Counties."
        path="/"
      />
      <JsonLd data={ORG_SCHEMA} />

      <section className="overflow-hidden rounded-3xl bg-pine px-5 py-8 text-paper-raised sm:px-10 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-paper-sunken">
          Scottsmoor · Titusville · Brevard County
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Find food, shelter, and a computer — without hunting through ten websites.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper-sunken sm:text-lg">
          Base Impact is a neighborhood navigation desk. Big buttons. Real hours. Built first for
          phones, because that’s what people actually have in hand.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
            <Link to="/directory">
              <Search className="size-5" aria-hidden />
              Find help near me
            </Link>
          </Button>
          <Button variant="emergency" size="lg" className="w-full sm:w-auto" onClick={openTriage}>
            <Compass className="size-5" aria-hidden />
            I need help now
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/give">
              <Heart className="size-5" aria-hidden />
              Give
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="tel:911"
          className="flex min-h-16 items-center justify-between rounded-2xl bg-paper-raised px-4 shadow-[var(--shadow-border)]"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-wide text-danger">
              Emergency
            </span>
            <span className="font-display text-xl font-semibold">Call 911</span>
          </span>
          <Phone className="size-5 text-danger" aria-hidden />
        </a>
        <a
          href="tel:211"
          className="flex min-h-16 items-center justify-between rounded-2xl bg-paper-raised px-4 shadow-[var(--shadow-border)]"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-wide text-sea">
              24/7 local help
            </span>
            <span className="font-display text-xl font-semibold">Call 211</span>
          </span>
          <Phone className="size-5 text-sea" aria-hidden />
        </a>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">What we focus on</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Immediate needs first. Then the skills and tools that keep people housed, employed, and
          connected.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)]">
                <span className="flex size-11 items-center justify-center rounded-xl bg-paper-sunken text-sea">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-ink-soft">{pillar.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
