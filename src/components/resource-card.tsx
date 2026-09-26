import { Bookmark, MapPin, Navigation, Phone } from "lucide-react";
import type { ProcessedResource } from "@/lib/resources";
import { directionsHref, telHref } from "@/lib/resources";
import { useSavedStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export function ResourceCard({ resource }: { resource: ProcessedResource }) {
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggleSaved = useSavedStore((s) => s.toggleSaved);
  const isSaved = savedIds.includes(resource.id);

  // Several entries have no published phone number. A tel: link built from an empty
  // string opens a dialer with nothing in it, so the button is left out entirely.
  const phone = resource.phone?.trim() ?? "";
  const hasPhone = phone.length > 0;

  // Mobile-only services such as outreach vans and phone lines have no fixed address
  // to navigate to, so directions would be meaningless for them.
  const canNavigate = !resource.mobileOnly && resource.address.trim().length > 0;

  const actionCount = (hasPhone ? 1 : 0) + (canNavigate ? 1 : 0);

  return (
    <article className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="font-display text-xl font-semibold leading-snug text-body">{resource.name}</h3>
            <button
              type="button"
              onClick={() => toggleSaved(resource.id)}
              className={cn(
                "relative mt-0.5 size-11 shrink-0 rounded-xl text-muted after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
                isSaved && "text-caution",
              )}
              aria-pressed={isSaved}
              aria-label={isSaved ? "Remove from saved" : "Save for later"}
            >
              <Bookmark className={cn("mx-auto size-5", isSaved && "fill-caution")} />
            </button>
          </div>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted">
            {resource.category}
            <span className="mx-1.5 text-faint">·</span>
            {resource.partnerType}
          </p>
        </div>
        <StatusBadge avail={resource.nextAvail} className="max-w-full" />
      </div>

      <p className="mt-3 text-muted">{resource.description}</p>
      <p className="mt-2 text-sm font-semibold text-body">{resource.hoursText}</p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {resource.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-md bg-inset px-2 py-1 text-xs font-semibold text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-start gap-2 text-sm text-muted">
        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          {resource.address}
          {/* Straight line, not a road route. Plain "miles away" implies driving
              distance, which we are not measuring — around Brevard the two can differ
              by half again because of the river and the causeways, so the label says
              which one it is. */}
          {canNavigate && (
            <span className="mt-0.5 block font-semibold text-body tabular-nums">
              {resource.distanceMiles} miles away (straight line)
            </span>
          )}
        </span>
      </div>

      {actionCount > 0 && (
        <div className={cn("mt-4 grid gap-2", actionCount === 2 && "grid-cols-2")}>
          {hasPhone && (
            <Button asChild variant="call" size="lg" className="rounded-xl">
              <a href={telHref(phone)}>
                <Phone className="size-4" aria-hidden />
                Call
              </a>
            </Button>
          )}
          {canNavigate && (
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              {/* Opens the phone's own map app, which already offers walking, driving,
                  and transit, so the travel mode is chosen there rather than here. */}
              <a
                href={directionsHref(resource.address)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open directions to ${resource.name} in your map app`}
              >
                <Navigation className="size-4" aria-hidden />
                Directions
              </a>
            </Button>
          )}
        </div>
      )}
    </article>
  );
}