/**
 * Статический prerender для SPA на TanStack Router.
 * Поднимает локальный сервер из dist/, обходит все маршруты через headless Chromium,
 * сохраняет полный HTML с гидратированными <title>/meta/JSON-LD в dist/<route>/index.html.
 *
 * Запуск (требуется установленный chromium):
 *   PRERENDER=1 CHROMIUM_PATH=/usr/bin/chromium npx tsx scripts/prerender.ts
 *
 * PRERENDER=0 — пропускает шаг (для CI без браузера).
 *
 * ----------------------------------------------------------------
 * React minified error #29: "Accumulated items must be not be null or undefined."
 * Источник: https://react.dev/errors/29
 * Ловится в аккумуляторе React (head/Children API), когда в массиве оказался
 * null/undefined. Типовые причины в TanStack Start:
 *   - scripts[].children или meta[].content === undefined в head() роута;
 *   - JSX вида {cond && <X/>} где cond === undefined внутри списка children.
 * Для читаемого стека в проде включены esbuild.keepNames + sourcemap
 * (см. vite.config.ts), а ниже логируется e.stack целиком.
 * ----------------------------------------------------------------
 */
import {
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import sirv from "sirv";
import puppeteer, { type Browser } from "puppeteer-core";

import { getAllRoutes } from "../src/lib/route-config";
import { SITE_URL } from "../src/lib/site";

/**
 * Удаляет stale prerender-артефакты предыдущих прогонов:
 *   - dist/<route>/index.html (любой вложенности)
 *   - dist/404.html
 * Оставляет нетронутыми dist/index.html (свежий SPA-шаблон от vite build)
 * и все ассеты.
 */
function cleanStaleHtml(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      cleanStaleHtml(full);
      try {
        if (!readdirSync(full).length) rmSync(full, { recursive: true });
      } catch {}
    } else if (entry === "index.html" && dir !== DIST) {
      rmSync(full);
    } else if (entry === "404.html" && dir === DIST) {
      rmSync(full);
    }
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? 2);
const WAIT_SELECTOR = process.env.PRERENDER_WAIT_SELECTOR ?? "#main";
const TIMEOUT = Number(process.env.PRERENDER_TIMEOUT ?? 60_000);

const BLOCKED_HOSTS = [
  "mc.yandex.ru",
  "mc.webvisor.com",
  "googletagmanager.com",
  "google-analytics.com",
  "top-fwz1.mail.ru",
];

if (process.env.PRERENDER === "0") {
  console.log("[prerender] PRERENDER=0 — пропускаю.");
  process.exit(0);
}

function findInPuppeteerCache(): string | undefined {
  const base = join(process.env.HOME ?? "", ".cache/puppeteer/chrome");
  if (!existsSync(base)) return undefined;
  for (const rev of readdirSync(base)) {
    const linux = join(base, rev, "chrome-linux64/chrome");
    if (existsSync(linux)) return linux;
    const mac = join(
      base,
      rev,
      "chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    );
    if (existsSync(mac)) return mac;
  }
  return undefined;
}

function findChromium(): string {
  const env = process.env.CHROMIUM_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (env && existsSync(env)) return env;
  const cached = findInPuppeteerCache();
  if (cached) return cached;
  const candidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error(
    "Не найден Chromium. Установите его (npx puppeteer browsers install chrome) или задайте CHROMIUM_PATH=/path/to/chrome",
  );
}

function routeToFsPath(route: string): string {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

async function startServer(): Promise<{ url: string; close: () => void }> {
  // Статика — только для запросов с расширением. Никакого встроенного SPA-fallback:
  // мы хотим, чтобы любой "страничный" URL всегда отдавал свежий dist/index.html,
  // а не stale prerender-результат, если он вдруг остался в dist/.
  const staticHandler = sirv(DIST, { dev: false, etag: true, single: false });
  const indexHtml = readFileSync(join(DIST, "index.html"));

  const server = http.createServer((req, res) => {
    const url = req.url ?? "/";
    const pathname = url.split("?")[0];
    const hasExt = /\.[a-zA-Z0-9]+$/.test(pathname);
    if (hasExt) {
      return staticHandler(req, res, () => {
        res.statusCode = 404;
        res.end("Not found");
      });
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(indexHtml);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("Не удалось поднять сервер");
  return {
    url: `http://127.0.0.1:${addr.port}`,
    close: () => server.close(),
  };
}

/**
 * TanStack Router file-based routing склеивает `head()` родителя и ребёнка.
 * У `<meta name/property>` браузер дедуплицирует по атрибуту, а у `<link>` и
 * `<title>` — нет. Поэтому в prerendered HTML появляются два `<link
 * rel="canonical">` (родительский + детский) и два `<title>`. Оставляем
 * ПОСЛЕДНЕЕ вхождение — это тег дочернего роута.
 *
 * Также страхуемся для og:image/twitter:image (историчный дубль из index.html).
 */
/**
 * Убирает JSON-LD родительских маршрутов: при вложенных роутах TanStack
 * оставляет в графе WebPage/BreadcrumbList родителя (например /services),
 * что даёт на дочерней странице лишние узлы с чужим @id.
 */
function dropForeignJsonLd(html: string, route: string): string {
  const canonical = `${SITE_URL}${route === "/" ? "" : route}`;
  return html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>\s*/gi,
    (block, json: string) => {
      try {
        const parsed = JSON.parse(json) as { "@graph"?: { "@type"?: unknown; "@id"?: unknown }[] };
        const graph = Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [];
        const wp = graph.find((n) => n["@type"] === "WebPage");
        if (wp && typeof wp["@id"] === "string" && wp["@id"] !== `${canonical}#webpage`) {
          return "";
        }
      } catch {
        // не трогаем блоки, которые не удалось разобрать
      }
      return block;
    },
  );
}

function dedupeHead(html: string): string {
  const patterns: RegExp[] = [
    /<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/gi,
    /<meta\b[^>]*\bproperty=["']og:image["'][^>]*>\s*/gi,
    /<meta\b[^>]*\bname=["']twitter:image["'][^>]*>\s*/gi,
    /<title>[^<]*<\/title>\s*/gi,
  ];
  for (const re of patterns) {
    const matches = [...html.matchAll(re)];
    if (matches.length <= 1) continue;
    const keepIdx = matches.length - 1;
    let removed = 0;
    html = html.replace(re, (m) => {
      const i = removed++;
      return i === keepIdx ? m : "";
    });
  }
  return html;
}


async function renderRoute(browser: Browser, baseUrl: string, route: string) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(`  [pageerror ${route}]`, e.stack ?? e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error(`  [console.error ${route}]`, m.text());
  });
  try {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      if (BLOCKED_HOSTS.some((h) => url.includes(h))) {
        req.abort().catch(() => {});
      } else {
        req.continue().catch(() => {});
      }
    });
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector("main, #root > *", { timeout: 15_000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    const winner = await Promise.race([
      page.waitForSelector(WAIT_SELECTOR, { timeout: TIMEOUT }).then(() => "main" as const),
      page.waitForSelector("[data-error-boundary]", { timeout: TIMEOUT }).then(() => "error" as const),
    ]);
    if (winner === "error") {
      throw new Error(`route rendered ErrorComponent (see [pageerror ${route}] / [console.error ${route}] above)`);
    }
    // Дать TanStack Router время дописать head/JSON-LD
    await new Promise((r) => setTimeout(r, 300));
    const rawHtml = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);
    const html = dropForeignJsonLd(dedupeHead(rawHtml), route);
    const fp = routeToFsPath(route);
    mkdirSync(dirname(fp), { recursive: true });
    writeFileSync(fp, html, "utf8");
    console.log(`  ✓ ${route} → ${fp.replace(ROOT + "/", "")} (${(html.length / 1024).toFixed(1)}kb)`);
  } catch (err) {
    console.error(`  ✗ ${route}: ${(err as Error).message}`);
    throw err;
  } finally {
    await page.close();
  }
}

async function renderQueue(browser: Browser, baseUrl: string, routes: string[]) {
  const queue = [...routes];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const r = queue.shift();
      if (!r) break;
      await renderRoute(browser, baseUrl, r);
    }
  });
  await Promise.all(workers);
}

async function render404(browser: Browser, baseUrl: string) {
  const page = await browser.newPage();
  try {
    // Несуществующий путь → SPA отдаст index.html → React покажет NotFoundComponent
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      if (BLOCKED_HOSTS.some((h) => url.includes(h))) {
        req.abort().catch(() => {});
      } else {
        req.continue().catch(() => {});
      }
    });
    await page.goto(`${baseUrl}/__nonexistent_404__`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector("main, #root > *", { timeout: 15_000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    const rawHtml = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);
    const html = dedupeHead(rawHtml);
    writeFileSync(join(DIST, "404.html"), html, "utf8");
    console.log(`  ✓ 404 → dist/404.html (${(html.length / 1024).toFixed(1)}kb)`);
  } finally {
    await page.close();
  }
}

async function main() {
  if (!existsSync(DIST)) {
    console.error(`[prerender] нет ${DIST}. Сначала запустите vite build.`);
    process.exit(1);
  }
  cleanStaleHtml(DIST);
  console.log(`[prerender] stale HTML очищен в ${DIST}`);
  const chromium = findChromium();
  console.log(`[prerender] Chromium: ${chromium}`);
  const routes = getAllRoutes().map((r) => r.path);
  console.log(`[prerender] маршрутов: ${routes.length}, concurrency=${CONCURRENCY}`);

  const server = await startServer();
  console.log(`[prerender] сервер: ${server.url}`);

  const browser = await puppeteer.launch({
    executablePath: chromium,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
    ],
    timeout: 60_000,
  });

  try {
    await renderQueue(browser, server.url, routes);
    await render404(browser, server.url);
    console.log("[prerender] Готово.");
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
