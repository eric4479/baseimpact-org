export function telHref(phone: string): string {
  // A naive strip of every non-digit turns "(386) 734-8120 ext. 601" into the
  // 13-digit "3867348120601", which no phone can dial - the extension is not part of
  // the number. RFC 3966 carries it in the `;ext=` parameter instead. Phones ignore
  // that parameter rather than misdialing, so the entry stays usable either way.
  const ext = phone.match(/\b(?:ext\.?|extension|x)\s*(\d{1,6})\b/i);
  const base = (ext ? phone.slice(0, ext.index) : phone).replace(/[^\d+]/g, "");
  if (!base) return "";
  return ext ? `tel:${base};ext=${ext[1]}` : `tel:${base}`;
}

/**
 * A directions link that hands off to whatever map app the phone already has.
 *
 * The Google Maps URL scheme is the only one that works on both iOS and Android: it
 * opens the installed Google Maps app when there is one and falls back to the web
 * page when there is not. Apple Maps would only work on iOS, and the `geo:` scheme
 * only on Android, so neither can be the single link for everyone.
 *
 * No travel mode is passed. The map app already has walking, driving, and transit
 * built in and remembers what the person chose last time, so duplicating that choice
 * on our page would add buttons without adding any capability.
 */
export function directionsHref(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/**
 * The bare hostname of a URL, for labelling a link with where it actually goes.
 *
 * A full URL is too long for a button and the scheme is noise, but a button reading
 * only "Website" asks the visitor to trust that it goes somewhere sensible. The
 * hostname is the part they can check at a glance.
 */
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * A short, honest label for a service-specific page.
 *
 * A link that leaves the organization's own site is labelled with the domain, because
 * that is the thing worth warning about - a county or government page looks identical
 * to a homepage otherwise. On the organization's own site the last path segment names
 * the service ("/food-pantry" reads as "Food pantry"), which beats repeating the domain.
 *
 * The full URL always goes on `title`, so the destination is inspectable even when the
 * label is short.
 */
export function servicePageLabel(url: string, mainUrl?: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  let sameHost = false;
  if (mainUrl) {
    try {
      sameHost = new URL(mainUrl).hostname === parsed.hostname;
    } catch {
      sameHost = false;
    }
  }
  if (!sameHost) return domainOf(url);

  const segments = parsed.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "Their site";

  // Drop purely numeric segments rather than only a trailing one: CMS-generated paths
  // like "/about-4-1" leave "about 4" if you strip just the last, which reads as a
  // typo. Numbers in a slug are nearly always a CMS artefact, not part of the name.
  const words = last
    .replace(/\.(html?|php|aspx?)$/i, "")
    .split(/[-_]+/)
    .filter((w) => w.length > 0 && !/^\d+$/.test(w))
    .join(" ")
    .trim();

  // "/about-4-1" reduces to just "about", which describes nothing. Fall back to a label
  // that is vague but true rather than one that is specific and wrong.
  if (words.length < 4 || /^(about|page|index|home|more|info)$/i.test(words)) {
    return "Service page";
  }
  return words.charAt(0).toUpperCase() + words.slice(1);
}
