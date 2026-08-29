# Base Impact

Mobile-first community resource directory for Scottsmoor, Titusville, and Brevard County, Florida.

Live site: [baseimpact.org](https://baseimpact.org)

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Output is static files in `dist/`.

## Cloudflare Pages

This repo is set up so a push to `main` can deploy to Cloudflare Pages.

**Build settings** (Cloudflare dashboard → Pages project → Settings):

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` (also in `NODE_VERSION` and `.nvmrc`) |
| Production branch | `main` |

SPA routes are handled by `public/_redirects` (`/* → /index.html`).

### If Git integration is already connected

A successful `npm run build` on `main` is enough. The previous deploy failed because:

1. `tsc -b` ran as part of `build` and TypeScript errors aborted the job (`build-error.txt`).
2. Tailwind was never installed, so utility classes in the UI did not generate CSS.
3. `#root { width: 1126px }` in the Vite template CSS broke phones.

Those are fixed in this tree.

### Optional GitHub Action deploy

[`.github/workflows/cloudflare-pages.yml`](.github/workflows/cloudflare-pages.yml) builds on every push. To also deploy from Actions, add repository secrets:

- `CLOUDFLARE_API_TOKEN` — token with **Cloudflare Pages: Edit**
- `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard URL / Workers & Pages overview

If those secrets are missing, the Action still **builds** (so you can see a red X if the site would fail to compile) and skips deploy. Native Cloudflare Git integration can remain the deployer.

## Stack

Vite + React + TypeScript + Tailwind CSS v4. No server required at runtime.
