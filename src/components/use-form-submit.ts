"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Submit a form to one of the /api/* form endpoints.
 *
 * WHY THIS EXISTS, and what it replaces:
 *
 * The feedback and partner forms used to build a `mailto:` URL and assign it to
 * window.location. That depends on the visitor having a working mail client, opens
 * a window they then have to send from, and loses the message if they close the tab.
 * It also meant the Worker endpoints -- and the D1 storage behind them -- were
 * never called at all. This posts to the endpoint instead.
 *
 * Three behaviours worth stating, because they are deliberate:
 *
 *   * The mailto: path is KEPT as an explicit, visible fallback. On a phone with no
 *     mail app, or if the network is down, `mailto:` still works and a person
 *     reaching out for help should never be left with nothing. We do not silently
 *     swallow that option.
 *   * Errors are shown to the visitor and the form stays editable. A failed send is
 *     recoverable by the person, which matters more than a tidy success message.
 *   * The honeypot field is included even though the Worker ignores it server-side
 *     for JSON posts; it is the cheapest bot filter available at zero user cost.
 */

export type FormEndpoint =
  | "feedback"
  | "contact"
  | "partners"
  | "volunteer"
  | "join";

export interface SubmitState {
  status: "idle" | "submitting" | "sent" | "error";
  /** Message safe to render to the visitor. */
  message?: string;
  /**
   * Set when the submission was stored but the notification email could not be
   * sent. The message is NOT lost -- it is in the operator inbox -- but we do say so
   * rather than pretending everything worked.
   */
  storedButNotEmailed?: boolean;
}

export interface SubmitPayload {
  /** Worker maps these onto the stored row; `identity` and `topic` are required. */
  identity: string;
  topic: string;
  note: string;
  name?: string;
  email?: string;
  /** Honeypot: must stay empty. If a bot fills it, the Worker short-circuits. */
  hp?: string;
}

/** Read the Turnstile response token if the widget is on the page. */
export function turnstileToken(): string {
  if (typeof window === "undefined") return "";
  const ts = (window as unknown as { turnstile?: { getResponse?: () => string } }).turnstile;
  return ts?.getResponse?.() || "";
}

/** True when a Turnstile site key was injected at runtime. */
export function turnstileConfigured(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { __TURNSTILE_SITE_KEY?: string }).__TURNSTILE_SITE_KEY;
}

/**
 * Reset the Turnstile widget after a failed attempt, so the next try is not blocked
 * by an already-consumed single-use token.
 */
function resetTurnstile() {
  try {
    const ts = (window as unknown as {
      turnstile?: { reset?: (id?: string) => void };
    }).turnstile;
    ts?.reset?.();
  } catch {
    /* the widget may already be gone; nothing to reset */
  }
}

export function useFormSubmit(endpoint: FormEndpoint) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  // Guards against a double-submit from an impatient double-tap, which would
  // create two rows for one message.
  const inFlight = useRef(false);

  const submit = useCallback(
    async (payload: SubmitPayload): Promise<boolean> => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setState({ status: "submitting" });

      const body = {
        name: payload.name || "",
        email: payload.email || "",
        identity: payload.identity,
        topic: payload.topic,
        note: payload.note,
        _hp: payload.hp || "",
        cfToken: turnstileToken(),
      };

      try {
        const resp = await fetch(`/api/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        let data: {
          ok?: boolean;
          message?: string;
          error?: string;
          fallbackNote?: string;
        } = {};
        try {
          data = await resp.json();
        } catch {
          // A non-JSON body means something upstream failed (proxy, worker crash).
          // We still show a recoverable error rather than a false success.
          throw new Error(`Server returned ${resp.status}`);
        }

        if (!resp.ok || !data.ok) {
          // Verification failures are the common case; reset so a retry can work.
          if (resp.status === 403) resetTurnstile();
          setState({
            status: "error",
            message:
              data.error ||
              (resp.status === 429
                ? "Too many submissions from this connection. Please try again later."
                : "Something went wrong sending your message."),
          });
          return false;
        }

        setState({
          status: "sent",
          message: data.message || "Thank you — we'll be in touch.",
          storedButNotEmailed: !!data.fallbackNote,
        });
        return true;
      } catch {
        setState({
          status: "error",
          message:
            "We could not reach the server. Check your connection, or email hello@baseimpact.org.",
        });
        return false;
      } finally {
        inFlight.current = false;
      }
    },
    [endpoint],
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
    resetTurnstile();
  }, []);

  useEffect(() => {
    // A completed submission means the token is spent; clear it for the next one.
    if (state.status === "sent") resetTurnstile();
  }, [state.status]);

  return { ...state, submit, reset, turnstileConfigured };
}