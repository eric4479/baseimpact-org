import { Bookmark, MapPin, Navigation, Phone } from "lucide-react";
import type { ProcessedResource } from "@/lib/resources";
import { mapsHref, telHref } from "@/lib/resources";
import { useSavedStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export function ResourceCard({ resource }: { resource: ProcessedResource }) {
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggleSaved = useSavedStore((s) => s.toggleSaved);
  const isSaved = savedIds.includes(resource.id);

  return (
    <article className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="font-display text-xl font-semibold leading-snug text-ink">{resource.name}</h3>
            <button
              type="button"
              onClick={() => toggleSaved(resource.id)}
              className={cn(
                "relative mt-0.5 size-11 shrink-0 rounded-xl text-ink-soft after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
                isSaved && "text-amber",
              )}
              aria-pressed={isSaved}
              aria-label={isSaved ? "Remove from saved" : "Save for later"}
            >
              <Bookmark className={cn("mx-auto size-5", isSaved && "fill-amber")} />
            </button>
          </div>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            {resource.category}
            <span className="mx-1.5 text-line">·</span>
            {resource.partnerType}
          </p>
        </div>
        <StatusBadge avail={resource.nextAvail} className="max-w-full" />
      </div>

      <p className="mt-3 text-ink-soft">{resource.description}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{resource.hoursText}</p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {resource.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-md bg-paper-sunken px-2 py-1 text-xs font-semibold text-ink-soft"
          >
            {tag}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-start gap-2 text-sm text-ink-soft">
        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          {resource.address}
          <span className="mt-0.5 block font-semibold text-ink tabular-nums">
            {resource.distanceMiles} miles away
          </span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button asChild variant="call" size="lg" className="rounded-xl">
          <a href={telHref(resource.phone)}>
            <Phone className="size-4" aria-hidden />
            Call
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <a href={mapsHref(resource.address)} target="_blank" rel="noreferrer">
            <Navigation className="size-4" aria-hidden />
            Directions
          </a>
        </Button>
      </div>
    </article>
  );
}
