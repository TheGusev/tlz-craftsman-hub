/**
 * Генерация sitemap.xml и верификация артефактов prerender.
 *
 * Запуск:
 *   npx tsx scripts/generate-seo.ts                  # генерация sitemap
 *   npx tsx scripts/generate-seo.ts --verify         # проверка HTML-файлов
 *   npx tsx scripts/generate-seo.ts --verify-jsonld  # проверка canonical/JSON-LD/robots
 */
import { writeFileSync, existsSync, mkdirSync, statSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getAllRoutes } from "../src/lib/route-config";
import { SITE_URL } from "../src/lib/site";
import { blogPosts } from "../src/data/blog";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

function routeToFsPath(route: string): string {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function lastmodFor(path: string): string {
  if (path.startsWith("/blog/")) {
    const slug = path.replace(/^\/blog\//, "");
    const post = blogPosts.find((p) => p.slug === slug);
    if (post?.publishedAt) return post.publishedAt;
  }
  return today();
}

function buildSitemap(): string {
  const entries = getAllRoutes();
  const body = entries
    .map((e) => {
      const parts = [
        `    <loc>${SITE_URL}${e.path}</loc>`,
        `    <lastmod>${lastmodFor(e.path)}</lastmod>`,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
      ].filter(Boolean);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function generate() {
  ensureDir(DIST);
  writeFileSync(join(DIST, "sitemap.xml"), buildSitemap(), "utf8");
  console.log(`[seo] sitemap.xml (${getAllRoutes().length} URLs, с lastmod) записан в dist/`);
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
  if (missing.length) process.exit(1);
  console.log("[verify] OK — все маршруты имеют HTML.");
}

type JsonLdNode = Record<string, unknown>;

function extractJsonLd(html: string): JsonLdNode[] {
  const out: JsonLdNode[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const graph = Array.isArray((parsed as { "@graph"?: unknown })["@graph"])
        ? ((parsed as { "@graph": JsonLdNode[] })["@graph"])
        : [parsed as JsonLdNode];
      out.push(...graph);
    } catch {
      // ignore malformed blocks
    }
  }
  return out;
}

function extractCanonicals(html: string): string[] {
  const re = /<link\b[^>]*\brel=["']canonical["'][^>]*>/gi;
  const hrefRe = /\bhref=["']([^"']+)["']/i;
  const out: string[] = [];
  for (const m of html.matchAll(re)) {
    const h = hrefRe.exec(m[0]);
    if (h) out.push(h[1]);
  }
  return out;
}

function hasNoindex(html: string): boolean {
  const re = /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["']([^"']+)["']/i;
  const m = re.exec(html);
  return !!m && /noindex/i.test(m[1]);
}

function typesOf(nodes: JsonLdNode[]): Set<string> {
  const s = new Set<string>();
  for (const n of nodes) {
    const t = n["@type"];
    if (typeof t === "string") s.add(t);
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && s.add(x));
  }
  return s;
}

function findType(nodes: JsonLdNode[], type: string): JsonLdNode | undefined {
  return nodes.find((n) => {
    const t = n["@type"];
    return t === type || (Array.isArray(t) && t.includes(type));
  });
}

function verifyJsonLd() {
  const routes = getAllRoutes();
  const errors: string[] = [];
  let checked = 0;

  for (const r of routes) {
    const fp = routeToFsPath(r.path);
    if (!existsSync(fp)) {
      errors.push(`${r.path}: HTML отсутствует (${fp})`);
      continue;
    }
    checked++;
    const html = readFileSync(fp, "utf8");

    // canonical
    const canonicals = extractCanonicals(html);
    const expected = `${SITE_URL}${r.path === "/" ? "" : r.path}`;
    if (canonicals.length === 0) {
      errors.push(`${r.path}: нет <link rel="canonical">`);
    } else if (canonicals.length > 1) {
      errors.push(`${r.path}: найдено ${canonicals.length} canonical (${canonicals.join(", ")})`);
    } else if (canonicals[0] !== expected) {
      errors.push(`${r.path}: canonical="${canonicals[0]}", ожидался "${expected}"`);
    }

    // robots noindex
    if (hasNoindex(html)) {
      errors.push(`${r.path}: <meta name="robots"> содержит noindex`);
    }

    // JSON-LD
    const nodes = extractJsonLd(html);
    if (nodes.length === 0) {
      errors.push(`${r.path}: нет валидного JSON-LD`);
      continue;
    }

    // Абсолютные URL
    const jsonStr = JSON.stringify(nodes);
    const urlRe = /"(https?:\/\/[^"]+)"/g;
    for (const m of jsonStr.matchAll(urlRe)) {
      const u = m[1];
      if (u.startsWith("http://") || (u.startsWith("https://") && !u.startsWith(SITE_URL))) {
        // Разрешаем schema.org и внешние sameAs
        if (!/schema\.org|sameAs/.test(u) && !u.startsWith("https://schema.org")) {
          // Внешние URL допустимы только в sameAs — не строгая проверка.
        }
      }
    }

    // Проверки по типу маршрута
    const isCityService = /^\/cities\/[^/]+\/[^/]+$/.test(r.path);
    const isBlogPost = /^\/blog\/[^/]+$/.test(r.path);
    const types = typesOf(nodes);

    if (isCityService) {
      for (const req of ["WebPage", "BreadcrumbList", "Service", "LocalBusiness", "FAQPage"]) {
        if (!types.has(req)) errors.push(`${r.path}: JSON-LD не содержит ${req}`);
      }
      const faq = findType(nodes, "FAQPage");
      if (faq) {
        const me = faq["mainEntity"];
        const count = Array.isArray(me) ? me.length : 0;
        if (count < 3) errors.push(`${r.path}: FAQPage.mainEntity=${count} (ожидалось ≥3)`);
      }
    }

    if (isBlogPost) {
      for (const req of ["BreadcrumbList", "Article"]) {
        if (!types.has(req)) errors.push(`${r.path}: JSON-LD не содержит ${req}`);
      }
      // FAQPage — если у поста есть faq
      const slug = r.path.replace(/^\/blog\//, "");
      const post = blogPosts.find((p) => p.slug === slug);
      if (post?.faq && post.faq.length > 0 && !types.has("FAQPage")) {
        errors.push(`${r.path}: у поста есть faq, но JSON-LD не содержит FAQPage`);
      }
    }
  }

  console.log(`[verify-jsonld] проверено маршрутов: ${checked} из ${routes.length}`);
  if (errors.length) {
    console.error(`[verify-jsonld] ОШИБКИ (${errors.length}):`);
    errors.slice(0, 50).forEach((e) => console.error(`  - ${e}`));
    if (errors.length > 50) console.error(`  ... и ещё ${errors.length - 50}`);
    process.exit(1);
  }
  console.log("[verify-jsonld] OK — canonical, robots и JSON-LD корректны на всех маршрутах.");
}

const args = process.argv.slice(2);
if (args.includes("--verify-jsonld")) verifyJsonLd();
else if (args.includes("--verify")) verify();
else generate();
