import { Link } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";

/**
 * The corporate purpose statement, published verbatim.
 *
 * This is a legal document — the purpose clause from the Articles of Incorporation —
 * so the text below is reproduced EXACTLY as written. It is not paraphrased, trimmed,
 * "improved", or reordered. The only thing changed is the hard line wrapping from the
 * source document, which is a formatting artifact and not part of the wording.
 *
 * Do not edit the paragraphs in PURPOSE_PARAGRAPHS to make them read better. If the
 * Articles are ever amended, replace the text with the amended text; do not merge the
 * two or smooth the language.
 *
 * This lives on its own page rather than inside /about because it is the clause the
 * IRS, FDACS, and any funder will want to read, and burying it halfway down a long
 * page makes it hard to find and hard to cite. /about links here.
 */

const PURPOSE_PARAGRAPHS: string[] = [
  "This corporation is organized exclusively for charitable and educational purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code, or the corresponding section of any future federal tax code.",
  "In furtherance of these purposes, the corporation may provide resource navigation; technology access and training; digital inclusion and digital literacy; technical support; cybersecurity, STEM, educational, and workforce-development programs; and the charitable acquisition, refurbishment, repair, loan, donation, or distribution of computers, laptops, tablets, mobile phones, assistive technology, software, internet and telecommunications services, and other technology equipment and resources. The corporation may also provide charitable food, clothing, and basic-needs assistance, capacity-building assistance for charitable organizations, community green spaces, agricultural food redistribution, and other programs that strengthen individuals, families, and communities.",
  "The corporation may also make grants or distributions to organizations that qualify as exempt organizations under Section 501(c)(3) of the Internal Revenue Code, or the corresponding section of any future federal tax code.",
];

const PURPOSE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Impact Inc.",
  url: "https://baseimpact.org",
  description: PURPOSE_PARAGRAPHS[0],
};

export function PurposePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageMeta
        title="Corporate purpose"
        description="The full purpose clause from the Articles of Incorporation of Base Impact Inc., a pre-filing Florida nonprofit."
        path="/purpose"
      />
      <JsonLd data={PURPOSE_SCHEMA} />

      <header className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Corporate purpose
        </h1>
        <p className="text-muted">
          This is the purpose clause from the Articles of Incorporation of Base Impact Inc.
          It is reproduced here in full and word for word. Anyone — a funder, a partner, a
          regulator, or a neighbour — should be able to read exactly what this corporation
          was organized to do without having to request a document.
        </p>
      </header>

      <section
        aria-labelledby="purpose-statement"
        className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-8"
      >
        <h2
          id="purpose-statement"
          className="font-display text-xs font-bold uppercase tracking-widest text-muted"
        >
          Purpose
        </h2>
        <div className="mt-4 space-y-4">
          {PURPOSE_PARAGRAPHS.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-body">
              {para}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-inset p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Where this comes from</h2>
        <p className="mt-2 text-sm text-muted">
          The clause above is taken from the Articles of Incorporation filed with the
          Florida Division of Corporations. Base Impact Inc. is a pre-filing nonprofit: we
          are preparing our Sunbiz registration and our application for recognition of
          exemption under Section 501(c)(3) of the Internal Revenue Code, and we are not
          yet a registered or tax-exempt organization.
        </p>
        <p className="mt-3 text-sm text-muted">
          If the Articles are ever amended, this page will be updated to match, and the
          change will be noted rather than made quietly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Related</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/about">About Base Impact →</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/terms">Terms &amp; disclaimer →</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/how-to-help">How to help →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
