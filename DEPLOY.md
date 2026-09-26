# Deploying baseimpact.org

## Branch → environment

| Branch | Builds to | Indexed by search engines |
| --- | --- | --- |
| `main` | https://baseimpact.org (production) | yes |
| any other branch, e.g. `staging` | https://staging.baseimpact-org.pages.dev | **no** |

Cloudflare Pages builds and deploys automatically on every push. There is no manual
deploy step, which is exactly why the branch matters.

## The rule

**Never push to `main` first.** Production is one push away at all times, so a mistake
reaches real people immediately.

1. Make the change on a branch (`staging`).
2. Push that branch. Cloudflare builds it to the preview URL within about a minute.
3. Open the preview URL and confirm the change looks and behaves correctly.
4. Only then merge into `main`, which promotes it to baseimpact.org.

Ask before step 4. The person who owns the site confirms the preview; the preview is
the approval step, not a formality to skip when the change seems obvious.

## Preview builds are noindex

`scripts/prerender.mjs` reads `CF_PAGES_BRANCH`, which Cloudflare Pages sets during the
build. When it is anything other than `main`, every prerendered page gets
`<meta name="robots" content="noindex, nofollow">`.

This matters: a staging copy that gets indexed competes with production in search
results and can surface stale or wrong resource information to people searching for
help. Preview deployments are also reachable at a public `*.pages.dev` URL, so
"nobody will find it" is not a safe assumption.

Local builds have no `CF_PAGES_BRANCH`, so they default to production behaviour
(indexable). This only affects Cloudflare's preview builds.

## Verifying a preview before promoting

Check the routes, not just the home page — the site is a prerendered SPA, and a
routing mistake can take down every deep link while `/` still looks fine:

- every route returns 200 with real content (view source: `<div id="root">` should not
  be empty)
- a legacy path such as `/donate` returns 301
- an unknown path such as `/xyz` returns a real 404
- the page reads correctly on a phone

That last failure mode is not hypothetical. A `_redirects` rule once sent every deep
link to `/`; the home page was fine, so it looked healthy until a `/directory` link
was tried.

## Rolling back

Deployments are immutable and each one is a commit. To undo a production change:

```
git revert <commit>
git push origin main
```

Cloudflare rebuilds from the revert within about a minute. Prefer `git revert` over
force-pushing: it keeps the history honest about what was live and when.

## Build configuration

Cloudflare Pages runs `npm run build` for this project, which chains:

```
tsc -b                                   type check, fails the build on error
vite build                               client bundle -> dist/
vite build --ssr src/entry-server.tsx    SSR bundle   -> dist-ssr/
node scripts/prerender.mjs               one HTML file per route -> dist/
```

Output directory is `dist`. `dist-ssr` is build scratch and is gitignored.

The prerender step also fails the build on route drift — if `src/lib/routes.ts`, the
router's `PATHS` list, and `public/_redirects` disagree, or if a `_redirects` rule
would reintroduce the redirect loop, the build stops rather than shipping it.