import { create } from "zustand";
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
  | "/donate"
  | "/privacy";

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
  "/donate",
  "/privacy",
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

export const useNav = create<NavState>((set) => ({
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
