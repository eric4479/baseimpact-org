import { Link } from "@/lib/nav";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

const TERMS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
};

export function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageMeta
        title="Terms of Use & Directory Disclaimer"
        description="Terms of use, resource directory disclaimer, accuracy limits, and liability terms for baseimpact.org."
        path="/terms"
      />
      <JsonLd data={TERMS_SCHEMA} />

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Terms of Use &amp; Directory Disclaimer</h1>
        <p className="text-muted">Last updated: September 25, 2026</p>
      </header>

      <div className="rounded-2xl bg-inset p-5 text-sm text-body sm:p-6">
        <p className="font-semibold">Please read this page before you travel to any listing.</p>
        <p className="mt-2 text-muted">
          We publish information about organizations that are not ours and that we do not control.
          Hours, addresses, phone numbers, and eligibility rules change without notice to us. Always
          call ahead before you go.
        </p>
      </div>

      <section className="space-y-5 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
        <div>
          <h2 className="font-display text-xl font-semibold">1. Who we are</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Base Impact Inc. (&quot;Base Impact,&quot; &quot;we,&quot; &quot;us&quot;) is a
            pre-filing nonprofit organization based in Scottsmoor, Florida. We are preparing our
            Florida Sunbiz registration and our application for recognition of exemption under
            Section 501(c)(3) of the Internal Revenue Code. We are not yet a registered or
            tax-exempt organization. Nothing on this site should be read to claim otherwise.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">2. Acceptance of these terms</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            By using baseimpact.org, you agree to these Terms of Use. If you do not agree, please do
            not use the site.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">3. The resource directory is third-party information</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The directory lists food pantries, shelters, churches, government offices, and other
            organizations that are independent of Base Impact. A listing is a pointer to
            information we found and recorded on a given date. It is not a promise that the
            organization will serve you, that it is open when we say it is, or that it still
            operates at that address or under that phone number.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>We do not control any listed organization and cannot guarantee its hours, capacity, or eligibility rules.</li>
            <li>We do not verify an organization&apos;s internal policies, licensing, or insurance.</li>
            <li>Some listings change seasonally, especially cold-weather shelters and mobile pantries.</li>
            <li>
              <strong>Call before you travel.</strong> This is the single most important instruction on
              this page.
            </li>
            <li>
              If you find something wrong, please{" "}
              <Link to="/feedback" className="font-semibold text-accent underline-offset-2 hover:underline">
                tell us
              </Link>{" "}
              so we can correct it.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">4. No endorsement or affiliation</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Listing an organization is not an endorsement, certification, sponsorship, or
            recommendation by Base Impact, and creates no partnership, agency, employment, or
            joint-venture relationship. Names, logos, and trademarks of listed organizations belong
            to their respective owners and are used only to identify them.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">5. This site is not a crisis service</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            baseimpact.org is not monitored around the clock and is not an emergency or crisis
            service. Do not use this site to report an emergency. If you are in danger, call 911. If
            you are in a mental-health crisis or having thoughts of suicide, call or text 988. For
            local assistance, call 211.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">6. No professional advice</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Content on this site is general information for navigation and educational purposes. It
            is not legal, medical, mental-health, tax, accounting, or financial advice, and it is not
            a substitute for advice from a qualified professional. Eligibility rules for public
            benefits are set by government agencies, not by us.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">7. No warranty</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The site and all directory content are provided &quot;as is&quot; and &quot;as
            available,&quot; without warranties of any kind, express or implied, including
            merchantability, fitness for a particular purpose, accuracy, and non-infringement. We do
            not warrant that the site will be uninterrupted, secure, or free of errors, or that any
            listing is accurate, current, or complete.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">8. Limitation of liability</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            To the fullest extent permitted by law, Base Impact Inc. and its founders, officers,
            board members, volunteers, and agents will not be liable for any indirect, incidental,
            special, consequential, exemplary, or punitive damages, or for any loss of time, money,
            opportunity, or data, arising from or relating to your use of this site or your reliance
            on any listing — including traveling to a location that was closed, relocated, at
            capacity, or that declined to serve you.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Some jurisdictions do not allow certain limitations, so parts of this section may not
            apply to you. Nothing here limits any liability that cannot be limited under applicable
            law.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">9. Donations</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Base Impact Inc. is not yet recognized as tax-exempt under Section 501(c)(3).{" "}
            <strong>Contributions are not tax-deductible at this time.</strong> Where we point you to
            a partner organization, your donation is made to that organization, is governed by their
            terms and policies, and any receipt or deductibility question is between you and them. We
            do not process payments on this site and do not collect card or bank information.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">10. What you send us</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            When you submit a form, you confirm the information is yours to share and is not
            unlawful, misleading, or harmful. Do not submit another person&apos;s private information
            without their permission. Do not use our forms to send threats, harassment, spam, or
            content that infringes someone else&apos;s rights. We may ignore or delete submissions
            that do. Withdrawing a form submission does not affect anything we did before you
            withdrew it.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">11. Intellectual property and corrections</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The site&apos;s design, text, and compiled directory are owned by Base Impact Inc. You
            may share links and quote short excerpts with attribution. You may not scrape or
            republish the directory in bulk without written permission.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            If you represent a listed organization and want your listing corrected, updated, or
            removed, contact us and we will act on a reasonable request. If you believe content on
            this site infringes your copyright, contact us with the details and we will review and
            remove material as appropriate.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">12. External links</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Links to other websites are provided for convenience. We do not control those sites and
            are not responsible for their content, availability, or privacy practices. Visiting them
            is at your own risk and subject to their terms.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">13. Accessibility</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We are building this site to be usable on a phone, on slow connections, and by people
            using screen readers or large text. If you cannot access something you need, contact us
            and we will give you the information directly — in person, by phone, or in another
            format.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">14. Changes and governing law</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We may update these terms as the organization grows. The version posted here is the
            current one, and the date at the top will change when it does. These terms are governed
            by the laws of the State of Florida, without regard to conflict-of-law rules. If any
            provision is found unenforceable, the rest remains in effect.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">15. Contact</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Questions, corrections, and removal requests:{" "}
            <a href="mailto:hello@baseimpact.org" className="font-semibold text-accent hover:underline">
              hello@baseimpact.org
            </a>{" "}
            or{" "}
            <a href="tel:+13213230999" className="font-semibold text-accent hover:underline">
              (321) 323-0999
            </a>
            , or use our{" "}
            <Link to="/feedback" className="font-semibold text-accent underline-offset-2 hover:underline">
              contact form
            </Link>
            .
          </p>
        </div>
      </section>

      <p className="text-xs text-muted">
        This page is written to be clear and honest about our limits. It is not a substitute for
        review by a licensed Florida attorney. Before we publish partner agreements, accept
        donations, or sign a lease, a lawyer should review our terms, bylaws, and filings.
      </p>
    </div>
  );
}