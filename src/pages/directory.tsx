import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Globe, MapPin, Navigation, Phone, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";
import { calculateDistanceMiles, PRESET_TOWNS, type Coordinates } from "@/lib/resources";
import { ALL_RESOURCES, type Resource, type Availability, getNextAvailableInfo, telHref } from "@/lib/resources";

const DIRECTORY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Base Impact Directory",
  url: "https://baseimpact.org/directory",
  description:
    "Find food, shelter, showers, and help near you in Central Florida. Within 100 miles of Titusville.",
};

/**
 * The location a visitor chose last time, remembered so they do not have to re-enter
 * a zip code on every visit. Previously the choice was discarded on reload and the
 * page silently fell back to Titusville.
 */
type SavedLocation = {
  coords: Coordinates;
  label: string;
  source: "gps" | "zip" | "town";
  zip?: string;
};

const LOCATION_KEY = "baseimpact_location";

function readSavedLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedLocation>;
    const lat = parsed?.coords?.lat;
    const lng = parsed?.coords?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      coords: { lat, lng },
      label: typeof parsed.label === "string" && parsed.label ? parsed.label : "your area",
      source: parsed.source === "gps" || parsed.source === "town" ? parsed.source : "zip",
      zip: typeof parsed.zip === "string" ? parsed.zip : undefined,
    };
  } catch {
    return null; // corrupt or unavailable storage
  }
}

function writeSavedLocation(value: SavedLocation) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(value));
  } catch {
    /* private mode — the session still works, it just will not be remembered */
  }
}

const NEED_CATEGORIES = [
  { key: "food", label: "Food", icon: "🍽️", desc: "Food banks, pantries, hot meals" },
  { key: "shelter", label: "Shelter", icon: "🏠", desc: "Shelters, housing help, cold weather" },
  { key: "bills", label: "Bills & Help", icon: "💰", desc: "Rent, utilities, financial help" },
  { key: "jobs", label: "Jobs & Work", icon: "💼", desc: "Job search, applications, IDs" },
  { key: "hygiene", label: "Showers & Hygiene", icon: "🚿", desc: "Showers, laundry, hygiene kits" },
  { key: "other", label: "Other Help", icon: "🤝", desc: "Anything else you might need" },
];

function getCategoryForResource(res: Resource): string {
  // `triageCategory` is set deliberately on every entry, so it is the reliable signal.
  // Matching on tag strings alone sent anything without one of the exact tags below —
  // legal aid, veterans' services, coordinated entry — to "Other Help".
  switch (res.triageCategory) {
    case "food":
      return "food";
    case "shelter":
      return "shelter";
    case "id_tech":
      return "jobs";
    case "travel":
      return "bills";
  }

  // Fallback for entries that predate the field.
  if (res.tags.some(t => ["Groceries", "Food", "Hot Meals", "Food Pantry"].includes(t))) return "food";
  if (res.tags.some(t => ["Shelter", "Housing", "Beds"].includes(t))) return "shelter";
  if (res.tags.some(t => ["Rent Help", "Utilities", "Financial"].includes(t))) return "bills";
  if (res.tags.some(t => ["Employment", "Job", "IDs", "Documents", "Tech Assistance"].includes(t))) return "jobs";
  if (res.tags.some(t => ["Showers", "Hygiene", "Laundry"].includes(t))) return "hygiene";
  return "other";
}

export function DirectoryPage() {
  // Location state - zip code OR GPS
  const [zipCode, setZipCode] = useState("");
  const [usingGps, setUsingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Titusville");

  // Current location for calculations (starts as Titusville default)
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(PRESET_TOWNS.Titusville);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeed, setSelectedNeed] = useState<string>("all");
  const [radius, setRadius] = useState(100); // Default 100 miles

  const applyLocation = useCallback(
    (coords: Coordinates, label: string, source: SavedLocation["source"], zip?: string) => {
      setCurrentLocation(coords);
      setLocationLabel(label);
      setUsingGps(source === "gps");
      writeSavedLocation({ coords, label, source, zip });
    },
    [],
  );

  const requestPosition = useCallback(
    (silent = false) => {
      if (!navigator.geolocation) {
        if (!silent) setGpsError("This browser cannot share a location. Enter a zip code instead.");
        return;
      }
      setGpsBusy(true);
      if (!silent) setGpsError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsBusy(false);
          setGpsError(null);
          applyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }, "your location", "gps");
        },
        (err) => {
          setGpsBusy(false);
          // A silent attempt was not something the visitor asked for, so do not
          // interrupt them with an error they did not cause.
          if (silent) return;
          setGpsError(
            err.code === err.PERMISSION_DENIED
              ? "Location is blocked for this site. Enter a zip code instead, or allow location in your browser's site settings."
              : err.code === err.POSITION_UNAVAILABLE
                ? "Your device could not work out a location just now. Try again, or enter a zip code."
                : "Finding your location took too long. Try again, or enter a zip code.",
          );
        },
        {
          // Network and Wi-Fi positioning rather than the GPS chip. That is the right
          // trade for this job: it answers in a second or two instead of waiting on
          // satellites, it works indoors where a lot of this audience is, and it uses
          // less battery. Its accuracy is roughly a city block, which is far finer
          // than we need to rank services that are miles apart.
          enableHighAccuracy: false,
          timeout: 12000,
          // Reuse a recent fix rather than re-acquiring on every page view.
          maximumAge: 5 * 60 * 1000,
        },
      );
    },
    [applyLocation],
  );

  // Restore the location the visitor chose last time. Only fall back to GPS when the
  // browser has ALREADY granted permission for this site.
  //
  // Prompting for location on first paint is how a site gets permanently blocked — a
  // denial is remembered, so the visitor is never asked again and the feature is gone
  // for them. Anyone who has not decided yet sees a "Use my location" button instead
  // and can opt in deliberately.
  useEffect(() => {
    const saved = readSavedLocation();
    if (saved) {
      setCurrentLocation(saved.coords);
      setLocationLabel(saved.label);
      setUsingGps(saved.source === "gps");
      if (saved.zip) setZipCode(saved.zip);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
        if (!perms?.query) return;
        const status = await perms.query({ name: "geolocation" as PermissionName });
        if (cancelled || status.state !== "granted") return;
        requestPosition(true);
      } catch {
        /* Permissions API unavailable — leave the choice to the button */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestPosition]);

  const handleZipCodeSearch = async () => {
    const zip = zipCode.trim();
    if (!/^\d{5}$/.test(zip)) {
      setGpsError("Enter a five-digit zip code, for example 32780.");
      return;
    }

    setZipBusy(true);
    setGpsError(null);
    try {
      // The ZIP table is about 24 KB, so it lives in its own chunk and is fetched the
      // first time somebody actually searches by ZIP. Most visitors use their phone's
      // location or a preset town and never download it at all.
      const { lookupZip } = await import("@/lib/fl-zips");
      const hit = lookupZip(zip);
      if (!hit) {
        // Say so plainly rather than guessing. The old code answered every unmatched
        // 327xx/321xx/328xx ZIP with one statewide point, which produced distances
        // that were wrong by up to 48 miles while looking perfectly confident.
        setGpsError(
          `We do not have a location for ${zip}. Check the digits, try a nearby zip code, or use your phone's location.`,
        );
        return;
      }
      applyLocation(hit, zip, "zip", zip);
    } catch {
      setGpsError("Could not load the zip code list. Check your connection, or use your phone's location.");
    } finally {
      setZipBusy(false);
    }
  };

  // Filter resources based on needs, search, and location
  const filteredResources = useMemo(() => {
    const now = new Date();
    const results: Array<Resource & { distance: number; availability: Availability }> = [];

    for (const res of ALL_RESOURCES) {
      // Skip if no valid location (like Base Impact with lat:0,lng:0)
      if (res.lat === 0 && res.lng === 0 && !res.address) continue;

      const distance = calculateDistanceMiles(currentLocation.lat, currentLocation.lng, res.lat, res.lng);
      // Phone-based and mobile services have no meaningful distance — their coordinate
      // is a nominal anchor so the sort does not break. Filtering them out by radius
      // would hide the helplines and mobile units that serve the area regardless.
      if (!res.mobileOnly && distance > radius) continue;

      const category = getCategoryForResource(res);
      if (category !== selectedNeed && selectedNeed !== "all") continue;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = res.name.toLowerCase().includes(q) ||
                       res.description.toLowerCase().includes(q) ||
                       res.address.toLowerCase().includes(q) ||
                       res.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) continue;
      }

      const availability = getNextAvailableInfo(res, now);
      results.push({ ...res, distance, availability });
    }

    // Sort by distance
    results.sort((a, b) => a.distance - b.distance);
    return results;
  }, [currentLocation, radius, selectedNeed, searchQuery]);

  const totalResources = filteredResources.length;

  return (
    <div className="space-y-6">
      <PageMeta
        title="Find Help Near You"
        description="Find food, shelter, showers, and help within 100 miles of Titusville, FL. Search by zip code or use your phone's location."
        path="/directory"
      />
      <JsonLd data={DIRECTORY_SCHEMA} />

      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold">Find Help Near You</h1>
        <p className="mt-2 text-muted">
          Food, shelter, showers, and other help within {radius} miles.{" "}
          {usingGps
            ? "Sorted by your phone's location."
            : `Sorted by distance from ${locationLabel}.`}
        </p>
      </div>

      {/* Location Input */}
      <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-sm font-semibold text-muted mb-3">Where are you?</p>

        <div className="flex flex-col gap-3">
          {/* GPS Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => requestPosition(false)}
            disabled={gpsBusy}
          >
            <Navigation className="size-5" aria-hidden />
            {gpsBusy ? "Finding you…" : "Use My Location"}
          </Button>

          {/* Zip Code Input */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter zip code (e.g. 32780)"
              className="flex-1"
              maxLength={5}
              inputMode="numeric"
              aria-label="Enter zip code"
            />
            <Button
              variant="outline"
              size="lg"
              onClick={handleZipCodeSearch}
              disabled={!zipCode.trim() || zipBusy}
            >
              {zipBusy ? "…" : "Search"}
            </Button>
          </div>

          {gpsError && (
            <p className="text-sm text-caution">{gpsError}</p>
          )}

          <p className="text-xs text-muted">
            Your location is only used to find nearby resources. We don't store it.
          </p>
        </div>
      </div>

      {/* Radius Slider */}
      <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-muted">Search radius</p>
          <span className="text-sm font-semibold text-body">{radius} miles</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          step={10}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-sea"
          aria-label="Search radius in miles"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>10 miles</span>
          <span>100 miles</span>
        </div>
      </div>

      {/* Need Category Selection */}
      <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-sm font-semibold text-muted mb-3">What do you need?</p>
        <div className="flex flex-wrap gap-2">
          {NEED_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedNeed(cat.key)}
              className={`
                flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-center transition-all
                ${selectedNeed === cat.key
                  ? "bg-fill text-on-fill shadow-[var(--shadow-border)]"
                  : "bg-inset text-body hover:bg-card"
                }
              `}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="font-semibold text-sm">{cat.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedNeed("all")}
            className={`
              flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-center transition-all
              ${selectedNeed === "all"
                ? "bg-fill text-on-fill shadow-[var(--shadow-border)]"
                : "bg-inset text-body hover:bg-card"
              }
            `}
          >
            <span className="text-xl">🔍</span>
            <span className="font-semibold text-sm">All Needs</span>
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for food, shelter, help..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-inset text-body placeholder:text-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Search resources"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            <strong className="text-body">{totalResources}</strong> resources found
          </p>
          {selectedNeed !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedNeed("all")}
              className="text-sm text-accent hover:underline"
            >
              Show all needs
            </button>
          )}
        </div>

        {totalResources === 0 ? (
          <div className="rounded-2xl bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]">
            <AlertTriangle className="mx-auto size-8 text-caution" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-semibold">No results found</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Try a larger search radius or a different type of help.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setRadius(100);
                setSelectedNeed("all");
                setSearchQuery("");
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map((res) => {
              const categoryInfo = NEED_CATEGORIES.find(c => c.key === getCategoryForResource(res));
              return (
                <div
                  key={res.id}
                  className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-body">{res.name}</h3>
                        {categoryInfo && (
                          <span className="rounded-full bg-inset px-2 py-0.5 text-xs font-semibold text-muted">
                            {categoryInfo.icon} {categoryInfo.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted">{res.description}</p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {res.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-inset px-2 py-1 text-xs font-semibold text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-body">
                        {res.hoursText}
                      </p>

                      <div className="mt-2 flex items-start gap-2 text-sm text-muted">
                      {res.mobileOnly ? (
                        <>
                          <Users className="mt-0.5 size-4 shrink-0" aria-hidden />
                          <span>{res.address}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                          <span>{res.address}</span>
                        </>
                      )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                      {res.phone && (
                        <a
                          href={telHref(res.phone)}
                          className="inline-flex items-center gap-2 rounded-xl bg-fill px-4 py-3 text-sm font-semibold text-on-fill hover:bg-fill-hover transition-colors"
                        >
                          <Phone className="size-4" aria-hidden />
                          Call {res.phone}
                        </a>
                      )}
                      {!res.mobileOnly && res.address && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(res.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-inset px-4 py-3 text-sm font-semibold text-body hover:bg-card transition-colors"
                        >
                          <Navigation className="size-4" aria-hidden />
                          Directions
                        </a>
                      )}
                      {res.website && (
                        <a
                          href={res.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-inset px-4 py-3 text-sm font-semibold text-body hover:bg-card transition-colors"
                        >
                          <Globe className="size-4" aria-hidden />
                          Website
                        </a>
                      )}
                      </div>

                      {!res.mobileOnly && (
                      <p className="mt-3 rounded-lg bg-inset px-3 py-2 text-xs text-muted">
                        Hours and availability change without notice. Call before you travel.
                      </p>
                      )}

                      {!res.mobileOnly && res.distance < 999 && (
                        <p className="mt-2 text-xs text-muted">
                          {res.distance.toFixed(1)} miles away
                        </p>
                      )}
                    </div>

                    {/* Availability Badge */}
                    <div className="shrink-0">
                      <span
                        className={`
                          rounded-full px-3 py-1 text-xs font-bold
                          ${res.availability.status === "OPEN"
                            ? "bg-tint-positive text-positive"
                            : res.availability.status === "SOON"
                            ? "bg-tint-caution text-caution"
                            : res.availability.status === "CLOSED"
                            ? "bg-tint-inactive text-inactive"
                            : "bg-inset text-muted"
                          }
                        `}
                      >
                        {res.availability.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-muted pt-4 border-t border-line/40">
        <p>
          Base Impact Inc. is a pre-filing nonprofit in Scottsmoor, FL.{" "}
          We're building a directory to help neighbors find resources.{" "}
          If something looks wrong,{" "}
          <a href="/feedback" className="text-accent hover:underline">
            let us know
          </a>
          .
        </p>
      </div>
    </div>
  );
}
