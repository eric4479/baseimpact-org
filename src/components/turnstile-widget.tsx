"use client";

import { useEffect, useId, useRef, useState } from "react";

const SCRIPT_ID = "turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let globalLoad: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (globalLoad) return globalLoad;

  globalLoad = new Promise((resolve, reject) => {
    if (document.getElementById(SCRIPT_ID)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      globalLoad = null;
      reject(new Error("Failed to load Turnstile script"));
    };
    document.head.appendChild(script);
  });

  return globalLoad;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Turnstile = any;

function waitForTurnstile(timeout = 5000): Promise<Turnstile> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = setInterval(() => {
      const ts = (window as unknown as { turnstile?: Turnstile }).turnstile;
      if (ts) {
        clearInterval(check);
        resolve(ts);
      } else if (Date.now() - start > timeout) {
        clearInterval(check);
        reject(new Error("timeout"));
      }
    }, 100);
  });
}

export default function TurnstileWidget({ fallbackHref }: { fallbackHref?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [error, setError] = useState(false);
  const instanceId = useId();

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        await loadTurnstileScript();
        if (cancelled || !containerRef.current) return;

        const ts = await waitForTurnstile();
        if (cancelled || !containerRef.current) return;

        widgetIdRef.current = ts.render(containerRef.current, {
          sitekey: (window as unknown as { __TURNSTILE_SITE_KEY?: string }).__TURNSTILE_SITE_KEY || "",
          theme: "auto",
          size: "normal",
          retry: "auto",
          "refresh-expired": "auto",
          callback: () => setError(false),
          "error-callback": () => setError(true),
          "expired-callback": () => setError(true),
        });
      } catch {
        if (!cancelled) setError(true);
      }
    }

    mount();

    return () => {
      cancelled = true;
      const ts = (window as unknown as { turnstile?: { reset: (id: string) => void } }).turnstile;
      if (widgetIdRef.current && ts) {
        try { ts.reset(widgetIdRef.current); } catch { /* ignore */ }
      }
    };
  }, []);

  return (
    <>
      <div
        id={`turnstile-${instanceId.replace(/:/g, "")}`}
        ref={containerRef}
        style={{ minHeight: "65px", margin: "1rem 0" }}
      />
      {error && (
        <p className="text-xs text-amber">
          Verification failed or expired. {fallbackHref ? <a href={fallbackHref}>Email us instead</a> : "Please try again or email us directly."}
        </p>
      )}
    </>
  );
}
