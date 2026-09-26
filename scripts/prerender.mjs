/**
 * Bakes a real HTML file per route into `dist/`.
 *
 * Why this exists: the site is a client-rendered React app, so `dist/index.html`
 * ships an empty `<div id="root">`. That means (a) nothing paints until the JS
 * bundle has downloaded and executed, and (b) every social scraper — Facebook,
 * LinkedIn, Slack, iMessage, WhatsApp — which does not run JavaScript, sees the
 * same generic title and description no matter which page was shared.
 *
 * This script runs after `vite build`:
 *   1. builds an SSR bundle of the app,
 *   2. renders every route in `ROUTE_META` to static markup,
 *   3. writes `dist/<route>/index.html` with that markup plus route-specific
 *      title, description, canonical, and Open Graph tags.
 *
 * The client still mounts over the top on load, so the static markup is a fast
 * first paint and crawler food, not a second implementation.
 *
 * It fails the build if `ROUTE_META`, the router's PATHS list, and the `_redirects`
 * rewrites disagree — drift between those three would otherwise show up as pages
 * that 404 or get indexed with the wrong title.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const ssrEntry = join(root, "dist-ssr", "entry-server.js");

if (!existsSync(ssrEntry)) {
  console.error(`prerender: SSR bundle missing at ${ssrEntry}. Run the SSR build first.`);
  process.exit(1);
}

const { renderRoute, ROUTE_META, SITE_URL, SITE_NAME } = await import(
  pathToFileURL(ssrEntry).href
);

// ---------------------------------------------------------------- drift checks

const navSrc = readFileSync(join(root, "src", "lib", "nav.tsx"), "utf8");
const navPaths = [
  ...(navSrc.split("const PATHS")[1] ?? "").split("];")[0].matchAll(/"(\/[a-z-]*)"/g),
].map((m) => m[1]);

const redirectsSrc = readFileSync(join(root, "public", "_redirects"), "utf8");
const redirectPaths = [...redirectsSrc.matchAll(/^(\/[a-z-]*)\s+\/[a-z-]+\.html\s+200/gm)].map(
  (m) => m[1],
);

const metaPaths = ROUTE_META.map((r) => r.path);
const sorted = (a) => [...a].sort();

const problems = [];
if (sorted(navPaths).join() !== sorted(metaPaths).join()) {
  problems.push(
    `ROUTE_META and nav.tsx PATHS differ.\n  only in nav.tsx: ${navPaths.filter((p) => !metaPaths.includes(p)).join(", ") || "—"}\n  only in ROUTE_META: ${metaPaths.filter((p) => !navPaths.includes(p)).join(", ") || "—"}`,
  );
}
if (sorted(redirectPaths).join() !== sorted(metaPaths).join()) {
  problems.push(
    `ROUTE_META and public/_redirects differ.\n  only in _redirects: ${redirectPaths.filter((p) => !metaPaths.includes(p)).join(", ") || "—"}\n  only in ROUTE_META: ${metaPaths.filter((p) => !redirectPaths.includes(p)).join(", ") || "—"}`,
  );
}
if (problems.length) {
  console.error("prerender: route manifest drift detected.\n\n" + problems.join("\n\n") + "\n");
  process.exit(1);
}

// ------------------------------------------------------------------- rendering

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const template = readFileSync(join(distDir, "index.html"), "utf8");

function applyMeta(html, route) {
  const title = `${route.title} | ${SITE_NAME}`;
  const url = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  const t = esc(title);
  const d = esc(route.description);

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="description" content="${d}" />`,
    )
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${t}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta property="og:description" content="${d}" />`,
    )
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${t}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="twitter:description" content="${d}" />`,
    )
    .replace(
      /<meta name="robots" content="[^"]*"\s*\/>/,
      `<meta name="robots" content="${route.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}" />`,
    );
}

let written = 0;
for (const route of ROUTE_META) {
  let markup;
  try {
    markup = renderRoute(route.path);
  } catch (err) {
    console.error(`prerender: rendering ${route.path} failed.\n`, err);
    process.exit(1);
  }

  const html = applyMeta(template, route).replace(
    /<div id="root"><\/div>/,
    `<div id="root">${markup}</div>`,
  );

  // Emit `directory.html`, not `directory/index.html`.
  //
  // Cloudflare Pages normalises directory-style output: with `directory/index.html`
  // on disk, a request for `/directory` (no trailing slash) is answered with a 308
  // to `/directory/`. That redirect then collided with the `_redirects` rewrite for
  // the same path and sent visitors to `/` — the path was silently discarded, so
  // every deep link landed on the homepage. Flat `.html` files are served directly
  // for the extension-less URL, so the request and the canonical tag agree and no
  // redirect is needed.
  const outFile =
    route.path === "/"
      ? join(distDir, "index.html")
      : join(distDir, `${route.path.slice(1)}.html`);

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html, "utf8");
  written += 1;
}

console.log(`prerender: wrote ${written} static route(s) — ${ROUTE_META.map((r) => r.path).join(", ")}`);