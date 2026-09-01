import { useEffect, useState, type ReactNode } from "react";
import { Building2, Compass, Heart, MessageSquare, Search, Shield, Zap, Sun, Moon } from "lucide-react";
import { Link, useNav, type Path } from "@/lib/nav";
import { useSavedStore, useUiStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TriageSheet } from "@/components/triage-sheet";

const NAV: Array<{ to: Path; label: string; icon: typeof Heart }> = [
  { to: "/", label: "Home", icon: Heart },
  { to: "/directory", label: "Find help", icon: Search },
  { to: "/partners", label: "Partners", icon: Building2 },
  { to: "/about", label: "About", icon: Shield },
  { to: "/guide", label: "Guide", icon: Compass },
  { to: "/give", label: "Give", icon: Heart },
  { to: "/volunteer", label: "Volunteer", icon: Zap },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const path = useNav((s) => s.path);
  const syncFromWindow = useNav((s) => s.syncFromWindow);
  const openTriage = useUiStore((s) => s.openTriage);
  const hydrate = useSavedStore((s) => s.hydrate);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("baseimpact_theme");
      if (stored === "dark" || stored === "light") return stored === "dark";
      return true;
    }
    return true;
  });

  useEffect(() => {
    hydrate();
    syncFromWindow();
    const onPop = () => syncFromWindow();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [hydrate, syncFromWindow]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("baseimpact_theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink dark:bg-black dark:text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-paper-raised focus:px-3 focus:py-2 dark:focus:bg-neutral-900"
      >
        Skip to content
      </a>

      <div className="bg-paper-sunken px-4 py-2 text-center text-xs font-medium text-ink-soft pt-[max(0.5rem,env(safe-area-inset-top))] sm:text-sm dark:bg-neutral-900 dark:text-neutral-400">
        Base Impact Inc. · Pre-filing nonprofit in Scottsmoor, FL · Preparing Sunbiz & 501(c)(3)
      </div>

      <header className="sticky top-0 z-40 border-b border-line/80 bg-pine text-paper-raised dark:border-neutral-800 dark:bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sea text-paper-raised dark:bg-sea dark:text-white">
              <Shield className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold leading-none tracking-tight">
                Base Impact
              </span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-widest text-paper-sunken dark:text-neutral-400">
                Brevard County, FL
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
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
                          ? "bg-sea text-paper-raised dark:bg-sea dark:text-white"
                          : "text-paper-sunken hover:bg-pine-deep hover:text-paper-raised dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  to="/feedback"
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold",
                    path === "/feedback"
                      ? "bg-sea text-paper-raised dark:bg-sea dark:text-white"
                      : "text-paper-sunken hover:bg-pine-deep hover:text-paper-raised dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
                  )}
                >
                  <MessageSquare className="size-4" aria-hidden />
                  Feedback
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDark((prev) => !prev)}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-paper-sunken hover:bg-pine-deep hover:text-paper-raised dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
                  <span className="hidden xl:inline">{isDark ? "Light mode" : "Dark mode"}</span>
                </button>
              </nav>

          <div className="flex items-center gap-2">
            <Button variant="emergency" size="sm" onClick={openTriage} className="shrink-0">
              <Zap className="size-4" aria-hidden />
              <span className="hidden sm:inline">Need help now</span>
              <span className="sm:hidden">Help now</span>
            </Button>
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="flex size-9 items-center justify-center rounded-lg text-paper-sunken hover:bg-pine-deep hover:text-paper-raised lg:hidden dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-8 pb-nav lg:pb-12">
        {children}
      </main>

      <footer className="hidden border-t border-line bg-pine px-4 py-8 text-sm text-paper-sunken lg:block dark:border-neutral-800 dark:bg-black dark:text-neutral-400">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6">
          <div>
            <p className="font-display text-lg font-semibold text-paper-raised dark:text-white">Base Impact Inc.</p>
            <p className="mt-1">Scottsmoor, FL 32775 · Brevard County</p>
            <p className="mt-2">
              <a href="tel:211" className="font-semibold text-paper-raised underline-offset-2 hover:underline dark:text-white">
                Call 211
              </a>
              {" "}for 24/7 local help ·{" "}
              <a href="tel:911" className="font-semibold text-paper-raised underline-offset-2 hover:underline dark:text-white">
                911
              </a>
              {" "}in an emergency
            </p>
          </div>
          <div className="text-right">
            <p>© {new Date().getFullYear()} Base Impact Inc.</p>
            <Link to="/privacy" className="mt-1 inline-block text-paper-raised underline-offset-2 hover:underline dark:text-white">
              Privacy policy
            </Link>
            <Link to="/feedback" className="mt-1 inline-block text-paper-raised underline-offset-2 hover:underline dark:text-white">
              Share feedback
            </Link>
          </div>
        </div>
      </footer>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper-raised pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="chip-row gap-1 px-2 py-2">
          {NAV.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[10px] font-bold",
                  active
                    ? "bg-sea text-paper-raised dark:bg-sea dark:text-white"
                    : "bg-paper-sunken text-ink-soft dark:bg-neutral-800 dark:text-neutral-300",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <TriageSheet />
    </div>
  );
}
