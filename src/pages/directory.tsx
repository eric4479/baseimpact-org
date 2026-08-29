import { useMemo, useState } from "react";
import { AlertTriangle, Bookmark, MapPin, Navigation, Search, SlidersHorizontal } from "lucide-react";
import {
  CATEGORIES,
  FILTER_TAGS,
  PRESET_TOWNS,
  TOWN_NAMES,
  processResources,
} from "@/lib/resources";
import { useLocationStore, useSavedStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { ResourceCard } from "@/components/resource-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DirectoryPage() {
  const town = useLocationStore((s) => s.town);
  const coords = useLocationStore((s) => s.coords);
  const setTown = useLocationStore((s) => s.setTown);
  const setGps = useLocationStore((s) => s.setGps);
  const savedIds = useSavedStore((s) => s.savedIds);

  const [query, setQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState(25);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [tag, setTag] = useState<(typeof FILTER_TAGS)[number]>("All");
  const [onlySaved, setOnlySaved] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const results = useMemo(
    () =>
      processResources(coords, maxDistance, {
        category,
        tag,
        query,
        onlySaved,
        savedIds,
        openNow,
      }),
    [coords, maxDistance, category, tag, query, onlySaved, savedIds, openNow],
  );

  const useGps = () => {
    if (!navigator.geolocation) {
      setGpsError("This browser cannot share location. Pick a town instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
      },
      () => setGpsError("Location was blocked. Choose a town below — it still works."),
    );
  };

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Find help nearby</h1>
        <p className="text-ink-soft">
          Sorted by who’s open, then by distance. Call or get directions with one tap.
        </p>
      </header>

      <section className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Food, showers, housing, city…"
            className="pl-11"
            type="search"
            enterKeyHint="search"
            aria-label="Search resources"
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <MapPin className="size-4" aria-hidden />
            Starting from
          </p>
          <div className="chip-row">
            {TOWN_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setTown(name);
                  setGpsError(null);
                }}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold",
                  town === name ? "bg-pine text-paper-raised" : "bg-paper-sunken text-ink",
                )}
              >
                {name}
              </button>
            ))}
            <button
              type="button"
              onClick={useGps}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold",
                town === "Current GPS" ? "bg-pine text-paper-raised" : "bg-paper-sunken text-ink",
              )}
            >
              <Navigation className="size-4" aria-hidden />
              Use my location
            </button>
          </div>
          {gpsError ? <p className="mt-2 text-sm text-amber">{gpsError}</p> : null}
        </div>

        <div className="mt-4 rounded-xl bg-paper-sunken px-3 py-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-ink">
              <SlidersHorizontal className="size-4" aria-hidden />
              Within
            </span>
            <span className="rounded-full bg-pine px-2.5 py-0.5 font-mono text-xs font-bold text-paper-raised tabular-nums">
              {maxDistance} mi
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="mt-2 w-full accent-sea"
            aria-label="Distance in miles"
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-ink-soft">Need</p>
          <div className="chip-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-3.5 text-sm font-semibold",
                  category === cat ? "bg-ink text-paper-raised" : "bg-paper-sunken text-ink",
                )}
              >
                {cat === "All" ? "Anything" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTER_TAGS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTag(item)}
              className={cn(
                "min-h-10 rounded-full px-3 text-xs font-bold",
                tag === item ? "bg-sea text-paper-raised" : "bg-paper-sunken text-ink-soft",
              )}
            >
              {item === "All" ? "Any tag" : item}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpenNow((v) => !v)}
            className={cn(
              "min-h-10 rounded-full px-3 text-xs font-bold",
              openNow ? "bg-ok text-paper-raised" : "bg-paper-sunken text-ink-soft",
            )}
          >
            Open now
          </button>
          <button
            type="button"
            onClick={() => setOnlySaved((v) => !v)}
            className={cn(
              "inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-bold",
              onlySaved ? "bg-amber text-paper-raised" : "bg-paper-sunken text-ink-soft",
            )}
          >
            <Bookmark className="size-3.5" aria-hidden />
            Saved ({savedIds.length})
          </button>
        </div>
      </section>

      <p className="px-1 text-sm text-ink-soft">
        <strong className="text-ink tabular-nums">{results.length}</strong> places within{" "}
        <span className="tabular-nums">{maxDistance}</span> miles of {town}
        {town !== "Current GPS" && town in PRESET_TOWNS ? ", FL" : ""}
      </p>

      {results.length === 0 ? (
        <div className="rounded-2xl bg-paper-raised px-5 py-10 text-center shadow-[var(--shadow-border)]">
          <AlertTriangle className="mx-auto size-8 text-amber" aria-hidden />
          <h2 className="mt-3 font-display text-xl font-semibold">No matches in this radius</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            Widen the distance, turn off “Saved” or “Open now”, or choose Anything.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setCategory("All");
              setTag("All");
              setOnlySaved(false);
              setOpenNow(false);
              setMaxDistance(50);
              setQuery("");
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
}
