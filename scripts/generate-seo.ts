/**
 * Генерация sitemap.xml, robots.txt и (с флагом --verify) проверка,
 * что prerender создал dist/<route>/index.html для каждого маршрута.
 *
 * Запуск:
 *   npx tsx scripts/generate-seo.ts            # генерация
 *   npx tsx scripts/generate-seo.ts --verify   # верификация
 */
import { writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getAllRoutes } from "../src/lib/route-config";
import { SITE_URL } from "../src/lib/site";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

function routeToFsPath(route: string): string {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

function buildSitemap(): string {
  const entries = getAllRoutes();
  const body = entries
    .map((e) => {
      const parts = [
        `    <loc>${SITE_URL}${e.path}</loc>`,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
      ].filter(Boolean);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function buildRobots(): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /thank-you",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function generate() {
  ensureDir(DIST);
  writeFileSync(join(DIST, "sitemap.xml"), buildSitemap(), "utf8");
  writeFileSync(join(DIST, "robots.txt"), buildRobots(), "utf8");
  console.log(`[seo] sitemap.xml (${getAllRoutes().length} URLs) и robots.txt записаны в dist/`);
}

function verify() {
  const routes = getAllRoutes();
  const missing: string[] = [];
  const empty: string[] = [];
  for (const r of routes) {
    const fp = routeToFsPath(r.path);
    if (!existsSync(fp)) {
      missing.push(r.path);
      continue;
    }
    const size = statSync(fp).size;
    if (size < 500) empty.push(`${r.path} (${size}b)`);
  }
  console.log(`[verify] всего маршрутов: ${routes.length}`);
  if (missing.length) {
    console.error(`[verify] ОТСУТСТВУЮТ HTML-файлы (${missing.length}):`);
    missing.forEach((m) => console.error(`  - ${m}`));
  }
  if (empty.length) {
    console.warn(`[verify] подозрительно маленькие HTML (${empty.length}):`);
    empty.forEach((m) => console.warn(`  - ${m}`));
  }
  if (missing.length) {
    process.exit(1);
  }
  console.log("[verify] OK — все маршруты имеют HTML.");
}

const mode = process.argv.includes("--verify") ? "verify" : "generate";
if (mode === "verify") verify();
else generate();
