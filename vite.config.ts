// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { services } from "./src/data/services";
import { cities } from "./src/data/cities";
import { serviceInCity } from "./src/data/serviceInCity";
import { blogPosts } from "./src/data/blog";

const dynamicPages = [
  ...services.map((s) => ({ path: `/services/${s.slug}` })),
  ...cities.map((c) => ({ path: `/cities/${c.slug}` })),
  ...serviceInCity
    .filter((sc) => sc.isReady !== false)
    .map((sc) => ({
      path: `/cities/${sc.citySlug}/${sc.serviceSlug}`,
    })),
  ...blogPosts.map((p) => ({ path: `/blog/${p.slug}` })),
  { path: "/regions/krym" },
];

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    pages: dynamicPages,
    prerender: {
      enabled: true,
      crawlLinks: true,
      autoStaticPathsDiscovery: true,
      failOnError: false,
      concurrency: 4,
    },
  },
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      },
    },
  },
});
