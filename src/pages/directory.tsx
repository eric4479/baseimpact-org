import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, Globe, MapPin, Navigation, Phone, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageMeta } from "@/components/page-meta";
import { JsonLd } from "@/components/json-ld";
import { calculateDistanceMiles, PRESET_TOWNS, type Coordinates } from "@/lib/resources";
import { ALL_RESOURCES, type Resource, type Availability, getNextAvailableInfo } from "@/lib/resources";

const DIRECTORY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Base Impact Directory",
  url: "https://baseimpact.org/directory",
  description:
    "Find food, shelter, showers, and help near you in Central Florida. Within 100 miles of Titusville.",
};

const NEED_CATEGORIES = [
  { key: "food", label: "Food", icon: "🍽️", desc: "Food banks, pantries, hot meals" },
  { key: "shelter", label: "Shelter", icon: "🏠", desc: "Shelters, housing help, cold weather" },
  { key: "bills", label: "Bills & Help", icon: "💰", desc: "Rent, utilities, financial help" },
  { key: "jobs", label: "Jobs & Work", icon: "💼", desc: "Job search, applications, IDs" },
  { key: "hygiene", label: "Showers & Hygiene", icon: "🚿", desc: "Showers, laundry, hygiene kits" },
  { key: "other", label: "Other Help", icon: "🤝", desc: "Anything else you might need" },
];

function getCategoryForResource(res: Resource): string {
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

  // Current location for calculations (starts as Titusville default)
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(PRESET_TOWNS.Titusville);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeed, setSelectedNeed] = useState<string>("food");
  const [radius, setRadius] = useState(100); // Default 100 miles

  // Load GPS on mount if possible
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(coords);
          setUsingGps(true);
          setGpsError(null);
        },
        () => {
          // GPS blocked - keep default Titusville
          setGpsError(null);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    }
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Location not available. Use zip code instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);
        setUsingGps(true);
        setGpsError(null);
      },
      () => {
        setGpsError("Could not get location. Try entering your zip code.");
        setUsingGps(false);
      },
      { timeout: 10000 }
    );
  };

  const handleZipCodeSearch = () => {
    if (!zipCode.trim()) return;
    // Simple zip to coords approximation for Florida
    const zip = zipCode.trim();
    // Approximate Florida zip codes (very rough)
    const floridaZips: Record<string, Coordinates> = {
      "32775": { lat: 28.7617, lng: -80.8625 }, // Scottsmoor
      "32754": { lat: 28.6653, lng: -80.8481 }, // Mims
      "32780": { lat: 28.6133, lng: -80.8091 }, // Titusville
      "32796": { lat: 28.5724, lng: -80.8038 }, // Titusville area
      "32922": { lat: 28.3582, lng: -80.7302 }, // Cocoa
      "32901": { lat: 28.0784, lng: -80.6026 }, // Melbourne
      "32940": { lat: 28.0881, lng: -80.6156 }, // Melbourne area
      "32750": { lat: 28.45, lng: -80.55 }, // Cocoa area
      "32776": { lat: 28.8, lng: -80.7 }, // Palm Bay area
      "32787": { lat: 28.9, lng: -80.85 }, // Port St. John
      "32101": { lat: 29.2108, lng: -81.0228 }, // Daytona Beach
      "32114": { lat: 29.2108, lng: -81.0228 }, // Daytona Beach
      "32720": { lat: 29.0343, lng: -81.3035 }, // DeLand
      "32724": { lat: 29.0343, lng: -81.3035 }, // DeLand area
      "32774": { lat: 29.1, lng: -81.1 }, // Deltona
      "32162": { lat: 29.0, lng: -80.95 }, // Edgewater
      "32169": { lat: 29.15, lng: -80.9 }, // New Smyrna Beach
      "32771": { lat: 28.9, lng: -80.85 }, // Oak Hill
      "32719": { lat: 28.55, lng: -80.85 }, // Orlando area
      "32801": { lat: 28.5383, lng: -81.3792 }, // Orlando
      "32805": { lat: 28.5273, lng: -81.3978 }, // Orlando
      "32809": { lat: 28.45, lng: -81.45 }, // Orlando area
      "32811": { lat: 28.5234, lng: -81.4478 }, // Orlando
      "32817": { lat: 28.5543, lng: -81.3456 }, // Orlando
      "32825": { lat: 28.65, lng: -81.5 }, // Orlando area
      "32835": { lat: 28.7, lng: -81.2 }, // Orlando area
      "32746": { lat: 28.5, lng: -81.1 }, // Christmas area
      "32749": { lat: 28.6, lng: -81.2 }, // Cocoa area
      "32786": { lat: 28.4, lng: -80.8 }, // Grant-Valkaria
    };

    // Try exact match first
    if (floridaZips[zip]) {
      setCurrentLocation(floridaZips[zip]);
      setUsingGps(false);
      return;
    }

    // Fallback: approximate by first 3 digits for Florida (321-328 range)
    const prefix = zip.substring(0, 3);
    if (["327", "321", "328"].includes(prefix)) {
      // Rough approximation
      const roughCoords: Record<string, Coordinates> = {
        "327": { lat: 28.5, lng: -80.8 },
        "321": { lat: 29.2, lng: -81.1 },
        "328": { lat: 28.5, lng: -81.4 },
      };
      setCurrentLocation(roughCoords[prefix]);
      setUsingGps(false);
      return;
    }

    setGpsError("Zip code not recognized. Try your town name or GPS instead.");
  };

  // Filter resources based on needs, search, and location
  const filteredResources = useMemo(() => {
    const now = new Date();
    const results: Array<Resource & { distance: number; availability: Availability }> = [];

    for (const res of ALL_RESOURCES) {
      // Skip if no valid location (like Base Impact with lat:0,lng:0)
      if (res.lat === 0 && res.lng === 0 && !res.address) continue;

      const distance = calculateDistanceMiles(currentLocation.lat, currentLocation.lng, res.lat, res.lng);
      if (distance > radius) continue;

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
        <p className="mt-2 text-ink-soft">
          Food, shelter, showers, and other help within {radius} miles.{" "}
          {usingGps ? "We found your location." : zipCode ? `Showing results near ${zipCode}.` : "Use your phone's location or enter a zip code."}
        </p>
      </div>

      {/* Location Input */}
      <div className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-sm font-semibold text-ink-soft mb-3">Where are you?</p>

        <div className="flex flex-col gap-3">
          {/* GPS Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={useMyLocation}
          >
            <Navigation className="size-5" aria-hidden />
            Use My Location (GPS)
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
              disabled={!zipCode.trim()}
            >
              Search
            </Button>
          </div>

          {gpsError && (
            <p className="text-sm text-amber">{gpsError}</p>
          )}

          <p className="text-xs text-ink-soft">
            Your location is only used to find nearby resources. We don't store it.
          </p>
        </div>
      </div>

      {/* Radius Slider */}
      <div className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-ink-soft">Search radius</p>
          <span className="text-sm font-semibold text-ink">{radius} miles</span>
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
        <div className="flex justify-between text-xs text-ink-soft mt-1">
          <span>10 miles</span>
          <span>100 miles</span>
        </div>
      </div>

      {/* Need Category Selection */}
      <div className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-sm font-semibold text-ink-soft mb-3">What do you need?</p>
        <div className="flex flex-wrap gap-2">
          {NEED_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedNeed(cat.key)}
              className={`
                flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-center transition-all
                ${selectedNeed === cat.key
                  ? "bg-sea text-paper-raised shadow-[var(--shadow-border)]"
                  : "bg-paper-sunken text-ink hover:bg-paper-raised"
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
                ? "bg-sea text-paper-raised shadow-[var(--shadow-border)]"
                : "bg-paper-sunken text-ink hover:bg-paper-raised"
              }
            `}
          >
            <span className="text-xl">🔍</span>
            <span className="font-semibold text-sm">All Needs</span>
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for food, shelter, help..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-paper-sunken text-ink placeholder:text-ink-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
            aria-label="Search resources"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">{totalResources}</strong> resources found
          </p>
          {selectedNeed !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedNeed("all")}
              className="text-sm text-sea hover:underline"
            >
              Show all needs
            </button>
          )}
        </div>

        {totalResources === 0 ? (
          <div className="rounded-2xl bg-paper-raised px-5 py-10 text-center shadow-[var(--shadow-border)]">
            <AlertTriangle className="mx-auto size-8 text-amber" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-semibold">No results found</h2>
            <p className="mx-auto mt-2 max-w-md text-ink-soft">
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
                  className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-ink">{res.name}</h3>
                        {categoryInfo && (
                          <span className="rounded-full bg-paper-sunken px-2 py-0.5 text-xs font-semibold text-ink-soft">
                            {categoryInfo.icon} {categoryInfo.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">{res.description}</p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {res.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-paper-sunken px-2 py-1 text-xs font-semibold text-ink-soft"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-ink">
                        {res.hoursText}
                      </p>

                      <div className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
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
                          href={`tel:${res.phone.replace(/[^\d+]/g, "")}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-sea px-4 py-3 text-sm font-semibold text-paper-raised hover:bg-sea-bright transition-colors"
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
                          className="inline-flex items-center gap-2 rounded-xl bg-paper-sunken px-4 py-3 text-sm font-semibold text-ink hover:bg-paper-raised transition-colors"
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
                          className="inline-flex items-center gap-2 rounded-xl bg-paper-sunken px-4 py-3 text-sm font-semibold text-ink hover:bg-paper-raised transition-colors"
                        >
                          <Globe className="size-4" aria-hidden />
                          Website
                        </a>
                      )}
                      </div>

                      {!res.mobileOnly && (
                      <p className="mt-3 rounded-lg bg-paper-sunken px-3 py-2 text-xs text-ink-soft">
                        Hours and availability change without notice. Call before you travel.
                      </p>
                      )}

                      {!res.mobileOnly && res.distance < 999 && (
                        <p className="mt-2 text-xs text-ink-soft">
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
                            ? "bg-ok-soft text-ok"
                            : res.availability.status === "SOON"
                            ? "bg-amber-soft text-amber"
                            : res.availability.status === "CLOSED"
                            ? "bg-closed-soft text-closed"
                            : "bg-paper-sunken text-ink-soft"
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
      <div className="text-center text-xs text-ink-soft pt-4 border-t border-line/40">
        <p>
          Base Impact Inc. is a pre-filing nonprofit in Scottsmoor, FL.{" "}
          We're building a directory to help neighbors find resources.{" "}
          If something looks wrong,{" "}
          <a href="/feedback" className="text-sea hover:underline">
            let us know
          </a>
          .
        </p>
      </div>
    </div>
  );
}
