/**
 * Server-render entry, used only by the build-time prerender step.
 *
 * Vite compiles this into a plain Node ESM bundle (`dist-ssr/entry-server.js`).
 * `scripts/prerender.mjs` then calls `renderRoute()` once per route and bakes the
 * returned markup into that route's HTML file.
 *
 * Nothing here ships to the browser.
 */

import { renderToString } from "react-dom/server";
import App from "./App";
import { setServerPath, type Path } from "./lib/nav";

export { ROUTE_META, SITE_URL, SITE_NAME, metaForPath } from "./lib/routes";

/**
 * Render a single route to static HTML.
 *
 * The router is a zustand store rather than real URL matching, so the route has to
 * be pushed into the store before rendering. `setServerPath` exists because
 * `setState` is not enough — see its comment in `src/lib/nav.tsx`.
 *
 * `src/lib/nav.tsx` guards its `window` accesses, so this runs unchanged under Node.
 */
export function renderRoute(path: string): string {
  const restore = setServerPath(path as Path);
  try {
    return renderToString(<App />);
  } finally {
    restore();
  }
}