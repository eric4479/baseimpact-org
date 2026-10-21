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
    "Florida nonprofit corporation in North Brevard County helping people get devices, internet, and digital skills — and providing free technology services to small local nonprofits.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@baseimpact.org",
    telephone: "+1-321-323-0999",
  },
};

const PILLARS = [
  {
    icon: Laptop,
    title: "Technology access",
    body: "Helping neighbors get a working device and internet service — and learn to use them.",
  },
  {
    icon: Heart,
    title: "Digital skills & job help",
    body: "Walk-throughs for housing portals, job applications, benefits, and staying safe online.",
  },
  {
    icon: Building2,
    title: "Tech for small nonprofits",
    body: "Free setup, security, and support for churches, pantries, and 1–5 person community groups.",
  },
  {
    icon: Leaf,
    title: "Local resource guide",
    body: "A simpler, local starting point that works alongside 211 — food, shelter, showers, and more.",
  },
];

export function HomePage() {
  const openTriage = useUiStore((s) => s.openTriage);

  return (
    <div className="space-y-10">
      <PageMeta
        title="Base Impact — neighborhood help in Brevard County"
        description="Tech help, food, shelter, and community support in North Brevard. Built for phones."
        path="/"
      />
      <JsonLd data={ORG_SCHEMA} />

      <section className="overflow-hidden rounded-3xl bg-band px-5 py-8 text-on-fill sm:px-10 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-faint">
          Scottsmoor · Titusville · Brevard County
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Technology help for North Brevard — devices, internet, and the skills to use them.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-faint sm:text-lg">
          Base Impact helps neighbors get connected and helps small local nonprofits keep their
          technology working. Plus a local resource guide that works alongside 211.
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
          Need help?
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="tel:211"
          className="flex min-h-16 items-center justify-between rounded-2xl bg-card px-4 shadow-[var(--shadow-border)]"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-wide text-accent">
              24/7 local help
            </span>
            <span className="font-display text-xl font-semibold">Call 211</span>
          </span>
          <Phone className="size-5 text-accent" aria-hidden />
        </a>
        <a
          href="tel:+13213230999"
          className="flex min-h-16 items-center justify-between rounded-2xl bg-card px-4 shadow-[var(--shadow-border)]"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-wide text-accent">
              Base Impact · by appointment
            </span>
            <span className="font-display text-xl font-semibold">(321) 323-0999</span>
          </span>
          <Phone className="size-5 text-accent" aria-hidden />
        </a>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">What we focus on</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Immediate needs first. Then the skills and tools that keep people housed, employed, and
          connected.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
                <span className="flex size-11 items-center justify-center rounded-xl bg-inset text-accent">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-muted">{pillar.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
