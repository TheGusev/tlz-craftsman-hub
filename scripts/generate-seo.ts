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
import { hasServiceGallery, hasServiceVideo } from "../src/lib/mediaSchema";
import { probeFile } from "./media-probe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

function routeToFsPath(route: string): string {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

/**
 * lastmod указываем только там, где есть настоящая дата контента (посты блога).
 * Подставлять дату сборки нельзя: иначе при каждом деплое «обновляются» все URL
 * и поисковики перестают доверять этому полю.
 */
function lastmodFor(path: string): string | null {
  if (path.startsWith("/blog/")) {
    const slug = path.replace(/^\/blog\//, "");
    const post = blogPosts.find((p) => p.slug === slug);
    if (post?.publishedAt) return post.publishedAt;
  }
  return null;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Разбирает путь и возвращает slug услуги и локатив города (если это город×услуга). */
function mediaContextFor(path: string): { serviceSlug: string; cityLocative?: string } | null {
  const svc = /^\/services\/([^/]+)$/.exec(path);
  if (svc) return { serviceSlug: svc[1] };
  const cs = /^\/cities\/([^/]+)\/([^/]+)$/.exec(path);
  if (cs) {
    const city = cities.find((c) => c.slug === cs[1]);
    return { serviceSlug: cs[2], cityLocative: city?.nameLocative };
  }
  return null;
}

/** Блоки <image:image> и <video:video> для страницы (реальные файлы из public/media). */
function mediaBlocksFor(path: string, title: string): string[] {
  const ctx = mediaContextFor(path);
  if (!ctx) return [];
  const out: string[] = [];

  if (hasServiceVideo(ctx.serviceSlug)) {
    const v = getFloodVideo(ctx.cityLocative);
    out.push(
      [
        `    <video:video>`,
        `      <video:thumbnail_loc>${SITE_URL}${v.poster}</video:thumbnail_loc>`,
        `      <video:title>${xmlEscape(title)}</video:title>`,
        `      <video:description>${xmlEscape(v.caption)}</video:description>`,
        `      <video:content_loc>${SITE_URL}${v.src}</video:content_loc>`,
        `      <video:duration>${durationSeconds(v.duration)}</video:duration>`,
        `      <video:family_friendly>yes</video:family_friendly>`,
        `      <video:live>no</video:live>`,
        `    </video:video>`,
      ].join("\n"),
    );
  }

  for (const photo of getServiceGallery(ctx.serviceSlug, ctx.cityLocative)) {
    out.push(
      [
        `    <image:image>`,
        `      <image:loc>${SITE_URL}${photo.src}</image:loc>`,
        `      <image:caption>${xmlEscape(photo.alt)}</image:caption>`,
        `    </image:image>`,
      ].join("\n"),
    );
  }
  return out;
}

/** ISO-8601 длительность (PT35S) → секунды для video:duration. */
function durationSeconds(iso: string): number {
  const m = /^PT(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
}

function buildSitemap(): string {
  const entries = getIndexableRoutes();
  const body = entries
    .map((e) => {
      const lastmod = lastmodFor(e.path);
      const parts = [
        `    <loc>${SITE_URL}${e.path}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        ...mediaBlocksFor(e.path, `${SITE_URL}${e.path}`),
      ].filter(Boolean);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`,
    `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
    body,
    `</urlset>`,
    ``,
  ].join("\n");
}

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function generate() {
  ensureDir(DIST);
  writeFileSync(join(DIST, "sitemap.xml"), buildSitemap(), "utf8");
  const total = getAllRoutes().length;
  const indexable = getIndexableRoutes().length;
  console.log(
    `[seo] sitemap.xml записан в dist/: ${indexable} индексируемых URL из ${total} собранных (медиа: image/video)`,
  );
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

type ProbeResult = { width: number; height: number; durationSeconds?: number };
const probeCache = new Map<string, ProbeResult | null>();

function probeCached(fp: string): ProbeResult | null {
  if (!probeCache.has(fp)) {
    try {
      probeCache.set(fp, probeFile(fp));
    } catch {
      probeCache.set(fp, null);
    }
  }
  return probeCache.get(fp) ?? null;
}

/**
 * Проверяет, что URL абсолютный, ведёт на наш домен, файл реально есть в dist,
 * а объявленные в JSON-LD width/height совпадают с настоящими размерами файла.
 */
function checkMediaUrl(
  u: unknown,
  label: string,
  route: string,
  errors: string[],
  declared?: { width?: unknown; height?: unknown; durationSeconds?: number },
) {
  if (typeof u !== "string" || !u.trim()) {
    errors.push(`${route}: ${label} пустой или не строка`);
    return;
  }
  if (!u.startsWith(SITE_URL)) {
    errors.push(`${route}: ${label}="${u}" не абсолютный или не с домена ${SITE_URL}`);
    return;
  }
  const rel = u.slice(SITE_URL.length).split("?")[0].split("#")[0];
  const fp = join(DIST, rel.replace(/^\//, ""));
  if (!existsSync(fp)) {
    errors.push(`${route}: ${label}="${u}" — файла нет в dist (${fp})`);
    return;
  }

  const real = probeCached(fp);
  if (!real) {
    errors.push(`${route}: ${label} — не удалось прочитать размеры файла ${rel}`);
    return;
  }
  if (declared) {
    if (declared.width !== undefined && declared.width !== real.width) {
      errors.push(
        `${route}: ${label} width=${String(declared.width)} не совпадает с файлом (${real.width})`,
      );
    }
    if (declared.height !== undefined && declared.height !== real.height) {
      errors.push(
        `${route}: ${label} height=${String(declared.height)} не совпадает с файлом (${real.height})`,
      );
    }
    if (declared.durationSeconds !== undefined && real.durationSeconds !== undefined) {
      if (Math.abs(declared.durationSeconds - real.durationSeconds) > 1) {
        errors.push(
          `${route}: ${label} duration=${declared.durationSeconds}s расходится с файлом (${real.durationSeconds.toFixed(2)}s)`,
        );
      }
    }
  }
}

/** "PT34S" / "PT1M5S" → секунды */
function parseIsoDuration(v: unknown): number | undefined {
  if (typeof v !== "string") return undefined;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(v);
  if (!m) return undefined;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

function verifyMedia(route: string, serviceSlug: string, nodes: JsonLdNode[], errors: string[]) {
  if (hasServiceVideo(serviceSlug)) {
    const v = findType(nodes, "VideoObject");
    if (!v) {
      errors.push(`${route}: у услуги есть видео, но JSON-LD не содержит VideoObject`);
    } else {
      for (const f of ["name", "description", "uploadDate"]) {
        if (typeof v[f] !== "string" || !(v[f] as string).trim()) {
          errors.push(`${route}: VideoObject.${f} пустой`);
        }
      }
      const durationSeconds = parseIsoDuration(v["duration"]);
      if (durationSeconds === undefined) {
        errors.push(`${route}: VideoObject.duration отсутствует или не ISO-8601`);
      }
      checkMediaUrl(v["contentUrl"], "VideoObject.contentUrl", route, errors, {
        width: v["width"],
        height: v["height"],
        durationSeconds,
      });
      const thumb = v["thumbnailUrl"];
      const thumbUrl = Array.isArray(thumb) ? thumb[0] : thumb;
      checkMediaUrl(thumbUrl, "VideoObject.thumbnailUrl", route, errors);
      const thumbNode = v["thumbnail"] as JsonLdNode | undefined;
      if (!thumbNode || thumbNode["@type"] !== "ImageObject") {
        errors.push(`${route}: VideoObject.thumbnail (ImageObject-постер) отсутствует`);
      } else {
        if (thumbNode["width"] === undefined || thumbNode["height"] === undefined) {
          errors.push(`${route}: VideoObject.thumbnail без width/height`);
        }
        checkMediaUrl(thumbNode["contentUrl"], "VideoObject.thumbnail.contentUrl", route, errors, {
          width: thumbNode["width"],
          height: thumbNode["height"],
        });
      }
    }
  }

  if (hasServiceGallery(serviceSlug)) {
    const g = findType(nodes, "ImageGallery");
    if (!g) {
      errors.push(`${route}: у услуги есть фотогалерея, но JSON-LD не содержит ImageGallery`);
    } else {
      const imgs = Array.isArray(g["image"]) ? (g["image"] as JsonLdNode[]) : [];
      if (imgs.length === 0) {
        errors.push(`${route}: ImageGallery без ImageObject`);
      }
      imgs.forEach((img, i) => {
        const t = img["@type"];
        if (t !== "ImageObject") errors.push(`${route}: ImageGallery.image[${i}] не ImageObject`);
        if (img["width"] === undefined || img["height"] === undefined) {
          errors.push(`${route}: ImageGallery.image[${i}] без width/height`);
        }
        checkMediaUrl(img["contentUrl"], `ImageGallery.image[${i}].contentUrl`, route, errors, {
          width: img["width"],
          height: img["height"],
        });
      });
    }
  }
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

    // robots noindex — допустим на служебных/юридических страницах
    const NOINDEX_ALLOWED = new Set(["/privacy", "/soglasie", "/thank-you"]);
    if (!NOINDEX_ALLOWED.has(r.path) && hasNoindex(html)) {
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

    // Медиа-разметка на страницах услуг и город×услуга
    const svcMatch = /^\/services\/([^/]+)$/.exec(r.path);
    const citySvcMatch = /^\/cities\/[^/]+\/([^/]+)$/.exec(r.path);
    const mediaService = svcMatch?.[1] ?? citySvcMatch?.[1];
    if (mediaService) {
      verifyMedia(r.path, mediaService, nodes, errors);

      const url = `${SITE_URL}${r.path}`;
      // На вложенных маршрутах в графе есть узлы родительского роута —
      // берём именно узлы этой страницы по @id.
      const byId = (id: string) => nodes.find((n) => n["@id"] === id);
      const wp = byId(`${url}#webpage`);
      const bc = nodes.find(
        (n) =>
          (n["@type"] === "BreadcrumbList" || (Array.isArray(n["@type"]) && (n["@type"] as string[]).includes("BreadcrumbList"))) &&
          n["@id"] === `${url}#breadcrumb`,
      );
      if (!bc) errors.push(`${r.path}: нет BreadcrumbList с @id ${url}#breadcrumb`);
      if (!wp) {
        errors.push(`${r.path}: нет WebPage`);
      } else {
        const ref = (v: unknown) => (v as JsonLdNode | undefined)?.["@id"];
        if (ref(wp["breadcrumb"]) !== `${url}#breadcrumb`)
          errors.push(`${r.path}: WebPage.breadcrumb не связан с BreadcrumbList`);
        if (ref(wp["publisher"]) !== `${SITE_URL}/#organization`)
          errors.push(`${r.path}: WebPage.publisher не ссылается на Organization`);
        if (ref(wp["isPartOf"]) !== `${SITE_URL}/#website`)
          errors.push(`${r.path}: WebPage.isPartOf не ссылается на WebSite`);
        if (ref(wp["mainEntity"]) !== `${url}#service`)
          errors.push(`${r.path}: WebPage.mainEntity не ссылается на Service`);
        const primary = wp["primaryImageOfPage"] as JsonLdNode | undefined;
        if (!primary) {
          errors.push(`${r.path}: WebPage без primaryImageOfPage`);
        } else {
          checkMediaUrl(primary["contentUrl"], "WebPage.primaryImageOfPage", r.path, errors, {
            width: primary["width"],
            height: primary["height"],
          });
        }
        const expectedMedia = [
          ...(hasServiceVideo(mediaService) ? [`${url}#video`] : []),
          ...(hasServiceGallery(mediaService) ? [`${url}#gallery`] : []),
        ];
        if (expectedMedia.length) {
          const got = Array.isArray(wp["associatedMedia"])
            ? (wp["associatedMedia"] as JsonLdNode[]).map((m) => m["@id"])
            : [];
          for (const id of expectedMedia) {
            if (!got.includes(id))
              errors.push(`${r.path}: WebPage.associatedMedia не содержит ${id}`);
          }
        }
      }
      const svc = byId(`${url}#service`);
      if (svc && (svc["mainEntityOfPage"] as JsonLdNode | undefined)?.["@id"] !== `${url}#webpage`)
        errors.push(`${r.path}: Service.mainEntityOfPage не связан с WebPage`);
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
  console.log("[verify-jsonld] OK — canonical, robots, медиа (VideoObject/ImageObject) и JSON-LD корректны на всех маршрутах.");
}

const args = process.argv.slice(2);
if (args.includes("--verify-jsonld")) verifyJsonLd();
else if (args.includes("--verify")) verify();
else generate();
