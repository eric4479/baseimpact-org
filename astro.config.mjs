import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://baseimpact.org',

  // Content pages are prerendered (fast + cheap). The one on-demand route is
  // src/pages/api/suggest.ts, which opts out with `export const prerender = false`.
  output: 'static',

  adapter: cloudflare(),

  // Astro 7 defaults to compressHTML: 'jsx', which strips whitespace between text
  // and inline elements using JSX rules (e.g. "accepts <strong>no compensation</strong>"
  // renders as "acceptsno compensation"). Keep the v6 HTML-aware behaviour.
  compressHTML: true,

  integrations: [
    // Emits /sitemap-index.xml + /sitemap-0.xml (referenced by public/robots.txt).
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },
});
