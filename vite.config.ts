import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode, isSsrBuild }) => {
  const isProd = mode === "production";

  // The SSR bundle runs once, in Node, during prerender. Chunk splitting and
  // down-levelling are meaningless there, so the build tuning below is client-only.
  if (isSsrBuild) {
    return {
      plugins: [react()],
      resolve: { alias: { "@": resolve(root, "src") } },
      build: { ssr: true, outDir: "dist-ssr", emptyOutDir: true, sourcemap: false },
    };
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(root, "src"),
      },
    },

    build: {
      // Browsers that support ES2020 modules. Everything this app uses (optional
      // chaining, nullish coalescing, dynamic import) is ES2020, and anything older
      // cannot run the app anyway, so there is no reason to ship down-levelled
      // output and its helper bloat.
      target: "es2020",

      // One stylesheet for the whole app. Splitting CSS per route would cost an
      // extra round trip on every navigation for a sheet that is ~7 KB gzipped.
      cssCodeSplit: false,

      // Inline anything under 4 KB as a data URI rather than spending a request on it.
      assetsInlineLimit: 4096,

      // No source maps in production - they expose source and add weight.
      sourcemap: false,

      reportCompressedSize: true,

      rollupOptions: {
        output: {
          // Split dependencies out of the app bundle. Vite hashes each chunk
          // independently, so when only application code changes a returning visitor
          // re-downloads the app chunk and reuses the cached framework chunk instead
          // of re-fetching everything.
          //
          // Matched by resolved path rather than by package name: the object form
          // does not catch subpath entries like "react-dom/client", which left
          // react-dom - by far the largest dependency - inside the volatile app
          // chunk and defeated the split.
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return "react";
            }
            if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return "icons";
            return "vendor";
          },
        },
      },
    },

    esbuild: {
      // Strip console output and debugger statements from production builds.
      drop: isProd ? ["console", "debugger"] : [],
    },
  };
});
