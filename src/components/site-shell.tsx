import { useEffect, useState, type ReactNode } from "react";
import { Building2, Compass, Heart, Menu, Search, Shield, X, Zap } from "lucide-react";
import { Link, useNav, type Path } from "@/lib/nav";
import { useSavedStore, useUiStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TriageSheet } from "@/components/triage-sheet";

const NAV: Array<{ to: Path; label: string; icon: typeof Heart }> = [
  { to: "/", label: "Home", icon: Heart },
  { to: "/directory", label: "Help", icon: Search },
  { to: "/partners", label: "Partners", icon: Building2 },
  { to: "/about", label: "About", icon: Shield },
  { to: "/guide", label: "Guide", icon: Compass },
  { to: "/volunteer", label: "Volunteer", icon: Zap },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const path = useNav((s) => s.path);
  const syncFromWindow = useNav((s) => s.syncFromWindow);
  const openTriage = useUiStore((s) => s.openTriage);
  const hydrate = useSavedStore((s) => s.hydrate);

  const [menuOpen, setMenuOpen] = useState(false);
  const [hc, setHc] = useState(false);

  useEffect(() => {
    hydrate();
    syncFromWindow();
    const onPop = () => syncFromWindow();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [hydrate, syncFromWindow]);

  // Restore high-contrast preference
  useEffect(() => {
    const saved = localStorage.getItem("bi-hc");
    if (saved === "1") {
      setHc(true);
      document.documentElement.classList.add("hc");
    }
  }, []);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const toggleHc = () => {
    setHc((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("hc");
      else document.documentElement.classList.remove("hc");
      localStorage.setItem("bi-hc", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-page text-body">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <aside
        aria-label="Organisation status"
        className="bg-inset px-4 py-2 text-center text-xs font-medium text-muted pt-[max(0.5rem,env(safe-area-inset-top))] sm:text-sm"
      >
        Base Impact Inc. · Florida nonprofit corporation · 501(c)(3) application pending board completion
      </aside>

      <header className="sticky top-0 z-40 border-b border-line/80 bg-band text-on-fill">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fill text-on-fill">
              <Shield className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold leading-none tracking-tight">
                Base Impact
              </span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-widest text-faint">
                Brevard County, FL
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
                {NAV.map((item) => {
                  const active = path === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold",
                        active
                          ? "bg-fill text-on-fill"
                          : "text-on-fill/70 hover:bg-band-deep hover:text-on-fill",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://translate.google.com/translate?sl=en&tl=es&u=https://baseimpact.org"
              target="_blank"
              rel="noreferrer"
              aria-label="View this page in Spanish via Google Translate"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line/60 bg-card/40 px-2 text-xs font-bold text-on-fill hover:bg-card/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-fill"
              onClick={(e) => {
                e.preventDefault();
                const url = `https://translate.google.com/translate?sl=en&tl=es&u=${encodeURIComponent(window.location.href)}`;
                window.open(url, "_blank", "noopener");
              }}
            >
              ES
            </a>
            <button
              type="button"
              onClick={toggleHc}
              aria-pressed={hc}
              aria-label={hc ? "Turn off high contrast" : "Turn on high contrast"}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line/60 bg-card/40 px-2 text-xs font-bold text-on-fill hover:bg-card/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-fill"
            >
              {hc ? "Standard" : "Contrast"}
            </button>
            <Button variant="emergency" size="sm" onClick={openTriage} className="shrink-0">
              <Zap className="size-4" aria-hidden />
              <span className="hidden sm:inline">Need help now</span>
              <span className="sm:hidden">Help now</span>
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line/60 bg-card/40 text-on-fill hover:bg-card/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-fill xl:hidden"
            >
              {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="xl:hidden border-b border-line bg-card shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav aria-label="Mobile full menu" className="mx-auto max-w-6xl px-4 py-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
              Navigate
            </p>
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = path === item.to;
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold",
                        active
                          ? "bg-fill text-on-fill"
                          : "text-body hover:bg-inset",
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden />
                      {item.label}
                      {active && <span className="sr-only">(current page)</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-muted">
              More
            </p>
            <ul className="flex flex-col gap-1">
              {[
                { to: "/how-to-help" as Path, label: "How to help" },
                { to: "/purpose" as Path, label: "Our purpose" },
                { to: "/impact" as Path, label: "Impact" },
                { to: "/join" as Path, label: "Join us" },
                { to: "/contact" as Path, label: "Contact" },
                { to: "/feedback" as Path, label: "Feedback" },
                { to: "/connect" as Path, label: "Connect" },
                { to: "/log" as Path, label: "Messages" },
                { to: "/socials" as Path, label: "Socials" },
                { to: "/privacy" as Path, label: "Privacy" },
                { to: "/terms" as Path, label: "Terms" },
              ].map((item) => {
                const active = path === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center rounded-xl px-3 text-base font-semibold",
                        active
                          ? "bg-fill text-on-fill"
                          : "text-body hover:bg-inset",
                      )}
                    >
                      {item.label}
                      {active && <span className="sr-only">(current page)</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-8 xl:pb-12">
         {children}
      </main>

      <footer className="border-t border-line bg-band px-4 pt-8 pb-nav xl:pb-8 text-sm text-faint">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="font-display text-lg font-semibold text-on-fill">Base Impact Inc.</p>
            <p className="mt-1">Scottsmoor, FL 32775 · Brevard County</p>
            <p className="mt-1">
              <a href="tel:+13213230999" className="font-semibold text-on-fill underline-offset-2 hover:underline">
                (321) 323-0999
              </a>
              {" "}· call or text · by appointment only
            </p>
            <p className="mt-2">
              <a href="tel:211" className="font-semibold text-on-fill underline-offset-2 hover:underline">
                Call 211
              </a>
              {" "}for 24/7 local help ·{" "}
              <a href="tel:988" className="font-semibold text-on-fill underline-offset-2 hover:underline">
                988
              </a>
              {" "}for crisis support
            </p>
          </div>
          <div className="sm:text-right">
            <p>© {new Date().getFullYear()} Base Impact Inc.</p>
            <Link to="/privacy" className="mt-1 block text-on-fill underline-offset-2 hover:underline">
              Privacy policy
            </Link>
            <Link to="/terms" className="mt-1 block text-on-fill underline-offset-2 hover:underline">
              Terms &amp; disclaimer
            </Link>
            <Link to="/socials" className="mt-1 block text-on-fill underline-offset-2 hover:underline">
              Follow us
            </Link>
            <Link to="/feedback" className="mt-1 block text-on-fill underline-offset-2 hover:underline">
              Share feedback
            </Link>
          </div>
        </div>
      </footer>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] xl:hidden"
      >
        {/*
                Seven tabs across a 390px phone is ~55px each, so this row deliberately does
                NOT use .chip-row: that helper scrolls horizontally and hides its scrollbar,
                which left "Volunteer" sitting off-screen with no hint that it existed. Equal
                flex shares instead keep every tab on screen at once.
              */}
              <div className="flex w-full items-stretch gap-0.5 px-1 py-2">
                {NAV.map((item) => {
                  const active = path === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[9px] font-bold min-[375px]:text-[10px]",
                        active
                          ? "bg-fill text-on-fill"
                          : "bg-inset text-muted",
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden />
                      <span className="w-full truncate text-center leading-none">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
      </nav>

      <TriageSheet />
    </div>
  );
}
