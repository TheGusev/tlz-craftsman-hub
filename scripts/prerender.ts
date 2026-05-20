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
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? 4);
const WAIT_SELECTOR = process.env.PRERENDER_WAIT_SELECTOR ?? "#main";
const TIMEOUT = Number(process.env.PRERENDER_TIMEOUT ?? 30_000);

if (process.env.PRERENDER === "0") {
  console.log("[prerender] PRERENDER=0 — пропускаю.");
  process.exit(0);
}

function findChromium(): string {
  const env = process.env.CHROMIUM_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (env && existsSync(env)) return env;
  const candidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error(
    "Не найден Chromium. Установите его или задайте CHROMIUM_PATH=/path/to/chrome",
  );
}

function routeToFsPath(route: string): string {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

async function startServer(): Promise<{ url: string; close: () => void }> {
  const handler = sirv(DIST, {
    dev: false,
    single: true, // SPA fallback
    etag: true,
  });
  const server = http.createServer((req, res) => handler(req, res, () => {
    res.statusCode = 404;
    res.end("Not found");
  }));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("Не удалось поднять сервер");
  return {
    url: `http://127.0.0.1:${addr.port}`,
    close: () => server.close(),
  };
}

async function renderRoute(browser: Browser, baseUrl: string, route: string) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(`  [pageerror ${route}]`, e.stack ?? e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error(`  [console.error ${route}]`, m.text());
  });
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle0", timeout: TIMEOUT });
    const winner = await Promise.race([
      page.waitForSelector(WAIT_SELECTOR, { timeout: TIMEOUT }).then(() => "main" as const),
      page.waitForSelector("[data-error-boundary]", { timeout: TIMEOUT }).then(() => "error" as const),
    ]);
    if (winner === "error") {
      throw new Error(`route rendered ErrorComponent (see [pageerror ${route}] / [console.error ${route}] above)`);
    }
    // Дать TanStack Router время дописать head/JSON-LD
    await new Promise((r) => setTimeout(r, 300));
    const html = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);
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
    await page.goto(`${baseUrl}/__nonexistent_404__`, { waitUntil: "networkidle0", timeout: TIMEOUT });
    await new Promise((r) => setTimeout(r, 300));
    const html = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);
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
  const chromium = findChromium();
  console.log(`[prerender] Chromium: ${chromium}`);
  const routes = getAllRoutes().map((r) => r.path);
  console.log(`[prerender] маршрутов: ${routes.length}, concurrency=${CONCURRENCY}`);

  const server = await startServer();
  console.log(`[prerender] сервер: ${server.url}`);

  const browser = await puppeteer.launch({
    executablePath: chromium,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
