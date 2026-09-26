import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { ReactNode } from "react";

export type Path =
  | "/"
  | "/directory"
  | "/partners"
  | "/about"
  | "/feedback"
  | "/give"
  | "/guide"
  | "/volunteer"
  | "/impact"
  | "/join"
  | "/contact"
  | "/privacy"
  | "/terms";

const PATHS: Path[] = [
  "/",
  "/directory",
  "/partners",
  "/about",
  "/feedback",
  "/give",
  "/guide",
  "/volunteer",
  "/impact",
  "/join",
  "/contact",
  "/privacy",
  "/terms",
];

function readPath(): Path {
  if (typeof window === "undefined") return "/";
  const raw = window.location.pathname.replace(/\/+$/, "") || "/";
  return PATHS.includes(raw as Path) ? (raw as Path) : "/";
}

type NavState = {
  path: Path;
  navigate: (to: Path) => void;
  syncFromWindow: () => void;
};

/**
 * The store is created here rather than with zustand's `create()` so that this
 * module keeps a reference to the underlying store API object.
 *
 * `create()` builds the store internally and then does
 * `Object.assign(useBoundStore, api)` — copying the API methods onto the hook. That
 * copy is useless for prerendering: React's `getServerSnapshot` closure calls
 * `api.getInitialState()` on the *internal* object, so patching the copy on the
 * hook changes nothing. Holding the real store lets `setServerPath` below patch the
 * object React actually reads from.
 */
const navStore = createStore<NavState>((set) => ({
  path: "/",
  navigate: (to) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", to);
      window.scrollTo(0, 0);
    }
    set({ path: to });
  },
  syncFromWindow: () => set({ path: readPath() }),
}));

type NavHook = {
  <T>(selector: (state: NavState) => T): T;
  getState: typeof navStore.getState;
  setState: typeof navStore.setState;
  getInitialState: typeof navStore.getInitialState;
  subscribe: typeof navStore.subscribe;
};

/** Subscribe to router state. Mirrors the shape zustand's `create()` returns. */
export const useNav: NavHook = Object.assign(
  <T,>(selector: (state: NavState) => T): T => useStore(navStore, selector),
  navStore,
);

/**
 * Point the router at a specific route for the duration of a server render.
 *
 * Two separate things have to line up, which is why this touches the store twice:
 *
 *   - `getState()` — used by `useNav.getState()` and by the client-side subscription.
 *   - `getInitialState()` — zustand v5 hands *this* to React as `getServerSnapshot`,
 *     and React reads it, not the live store, during `renderToString`. Skipping this
 *     step is subtle: `setState` alone makes every route silently prerender the "/"
 *     page, because that is the state captured when the store was created.
 *
 * Returns a restore function. Browser builds never call this.
 */
export function setServerPath(path: Path): () => void {
  const original = navStore.getInitialState;
  navStore.setState({ path });
  navStore.getInitialState = () => ({ ...original(), path });
  return () => {
    navStore.getInitialState = original;
  };
}

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: Path;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const navigate = useNav((s) => s.navigate);
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
