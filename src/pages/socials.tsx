import { ExternalLink, AtSign, Facebook, Instagram, Youtube, Linkedin, Github, Music2 } from "lucide-react";
import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";
import { SOCIALS, PENDING, type Social } from "@/lib/socials";

/**
 * The X logo is drawn inline because lucide 0.510 ships a Twitter bird and no X mark,
 * and the bird is the wrong logo for the name being linked. The other platforms use
 * their lucide icon and are added when they go in SOCIALS.
 */
function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * lucide has no TikTok mark, so that one borrows Music2. Everything else maps to its
 * own brand icon.
 */
function SocialIcon({ icon, className }: { icon: Social["icon"]; className?: string }) {
  if (icon === "x") return <XMark className={className} />;
  if (icon === "facebook") return <Facebook className={className} />;
  if (icon === "instagram") return <Instagram className={className} />;
  if (icon === "youtube") return <Youtube className={className} />;
  if (icon === "linkedin") return <Linkedin className={className} />;
  if (icon === "github") return <Github className={className} />;
  return <Music2 className={className} />;
}

const SOCIALS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
  sameAs: SOCIALS.map((s) => s.url),
};

export function SocialsPage() {
  return (
    <div className="space-y-10">
      <PageMeta
        title="Follow Base Impact"
        description="Where to find Base Impact online. Our handle is baseimpactorg across every platform."
        path="/socials"
      />
      <JsonLd data={SOCIALS_SCHEMA} />

      <section className="overflow-hidden rounded-3xl bg-band px-5 py-8 text-on-fill sm:px-10 sm:py-12">
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Follow Base Impact.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-faint sm:text-lg">
          One handle everywhere: <strong className="font-semibold text-on-fill">baseimpactorg</strong>.
          If an account does not match that exactly, it is not us — tell us using the link below.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Our accounts</h2>
        {SOCIALS.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            We are not posting anywhere yet. When we are, the accounts will be listed here.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SOCIALS.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="flex h-full items-start gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]"
                >
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-inset text-body">
                    <SocialIcon icon={s.icon} className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-display text-lg font-semibold">
                      {s.name}
                      <ExternalLink className="size-4 text-muted" aria-hidden />
                    </span>
                    <span className="block text-sm font-semibold text-accent">{s.handle}</span>
                    <span className="mt-1 block text-sm text-muted">{s.blurb}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {PENDING.length > 0 && (
        <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-xl font-semibold">Not set up yet</h2>
          <p className="mt-3 text-sm text-muted">
            These are being set up. There is nothing to link to until they are live, so they are
            listed here as plain text rather than as links that would go nowhere.
          </p>
          <p className="mt-3 text-sm font-semibold text-body">{PENDING.join(" · ")}</p>
        </section>
      )}

      <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">Found an account using our name?</h2>
        <p className="mt-3 text-sm text-muted">
          We are a pre-filing nonprofit, and our name is used by unrelated organisations in other
          states and countries. If you find a page that looks like us but is not on the handle
          above, it is not affiliated with us.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/feedback">
              <AtSign className="size-4" aria-hidden />
              Tell us about it
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-3xl bg-inset px-5 py-8 sm:p-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Need help right now?</h2>
        <p className="mt-2 text-sm text-muted">
          Social pages are not monitored around the clock. For anything urgent, use the
          directory or call 211 — both are reachable at any hour.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/directory">Find help near you →</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact us →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
