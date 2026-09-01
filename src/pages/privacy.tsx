import { Link } from "@/lib/nav";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

const PRIVACY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageMeta
        title="Privacy Policy"
        description="Base Impact privacy policy — what we collect, how we use it, and how to request deletion."
        path="/privacy"
      />
      <JsonLd data={PRIVACY_SCHEMA} />
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-ink-soft">Last updated: September 1, 2026</p>
      </header>

      <section className="space-y-4 rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-semibold">What we collect</h2>
        <p className="text-ink-soft">
          Base Impact Inc. collects only the information you voluntarily provide through our
          contact and feedback forms — typically your name, email address, and the message you
          send. We do not use tracking cookies, analytics scripts, or advertising pixels.
        </p>

        <h2 className="font-display text-xl font-semibold">How we use it</h2>
        <p className="text-ink-soft">
          We use your information solely to respond to your message. We do not sell, rent, or
          share your personal information with third parties for marketing purposes.
        </p>

        <h2 className="font-display text-xl font-semibold">Data storage</h2>
        <p className="text-ink-soft">
          Form submissions are sent directly to our email inbox. We do not maintain a separate
          customer database or CRM. Messages are retained only as long as needed to complete
          the requested response.
        </p>

        <h2 className="font-display text-xl font-semibold">Third-party services</h2>
        <p className="text-ink-soft">
          This site loads fonts from Google Fonts and uses Cloudflare for hosting and security.
          Those services may collect standard server logs (IP address, browser type, timestamps)
          as part of their normal operations. We do not control their data practices.
        </p>

        <h2 className="font-display text-xl font-semibold">Children&apos;s privacy</h2>
        <p className="text-ink-soft">
          We do not knowingly collect information from children under 13. If you believe a child
          has provided us with personal information, contact us and we will remove it.
        </p>

        <h2 className="font-display text-xl font-semibold">Your rights</h2>
        <p className="text-ink-soft">
          You can request that we delete any information you have submitted by emailing
          hello@baseimpact.org. We will comply within a reasonable timeframe.
        </p>

        <h2 className="font-display text-xl font-semibold">Changes</h2>
        <p className="text-ink-soft">
          We may update this policy as our organization grows. Changes will be posted on this
          page with an updated date.
        </p>

        <h2 className="font-display text-xl font-semibold">Contact</h2>
        <p className="text-ink-soft">
          Questions about this policy:{" "}
          <Link to="/contact" className="font-semibold text-sea underline-offset-2 hover:underline">
            Contact Base Impact
          </Link>
          .
        </p>
      </section>

      <p className="text-xs text-ink-soft">
        Base Impact Inc. is a pre-filing nonprofit in Scottsmoor, FL. This site does not collect
        payment information. All donations are directed to partner organizations.
      </p>
    </div>
  );
}
