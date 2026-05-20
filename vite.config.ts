import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "src/routes",
      generatedRouteTree: "src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    outDir: "dist",
    // sourcemap + keepNames (esbuild ниже) дают читаемый стек React-ошибок
    // в логах prerender'а (puppeteer автоматически разворачивает по .map).
    sourcemap: true,
    target: "es2020",
  },
  esbuild: {
    // Сохраняем имена функций/компонентов в production-бандле,
    // иначе минифицированные React ошибки (#29 и пр.) непригодны для отладки.
    keepNames: true,
  },
});
