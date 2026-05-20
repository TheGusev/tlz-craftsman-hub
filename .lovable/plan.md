## Диагноз

React #299 (`createRoot: Target container is not a DOM element`) на `/cases`, `/faq`, `/prices`, `/regions/krym` — Puppeteer грузит уже-prerendered `dist/<route>/index.html` от прошлого прогона. Там `<div id="root">` либо удалён React-гидрацией перед сериализацией, либо заменён готовым DOM-деревом без узла с `id="root"`, на который потом пытается смонтироваться `main.tsx`.

Почему именно эти роуты: `sirv(DIST, { single: true })` отдаёт `single: true`-fallback ТОЛЬКО когда файла нет. Если `dist/cases/index.html` существует с прошлого CI/локального прогона (а он существует — мы же его туда пишем), sirv отдаёт его как есть. `main.tsx` делает `document.getElementById("root")!` → null → `createRoot` бросает #299 → `pageerror` → таймаут на `#main` → fail.

Первые маршруты («которые работают») — это те, для которых в `dist/` нет stale-файла (новые роуты или после `vite build` без предыдущего prerender). Как только CI накопил историю — падает.

## План

Правка одного файла: `scripts/prerender.ts`.

### 1. Очистка stale HTML перед стартом

После проверки `existsSync(DIST)`, до `startServer()`:

```ts
import { readdirSync, statSync, rmSync } from "node:fs";

function cleanStaleHtml(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      cleanStaleHtml(full);
      // удалить пустую папку, если осталась только index.html и её снесли
      try { if (!readdirSync(full).length) rmSync(full, { recursive: true }); } catch {}
    } else if (entry === "index.html" && dir !== DIST) {
      rmSync(full);
    } else if (entry === "404.html" && dir === DIST) {
      rmSync(full);
    }
  }
}
cleanStaleHtml(DIST);
```

Оставляем `dist/index.html` (свежий SPA-шаблон от vite build) и все ассеты. Удаляем `dist/<route>/index.html` и `dist/404.html`.

### 2. Принудительный SPA-fallback в сервере

Заменить `sirv` на собственный handler, который:
- для запросов с расширением (`.js`, `.css`, `.png`, `.svg`, `.ico`, `.json`, `.txt`, `.xml`, `.webp`, `.woff2`, …) — отдаёт файл из `dist/` или 404;
- для всех остальных запросов (включая `/`, `/cases`, `/faq/anything`) — ВСЕГДА отдаёт содержимое `dist/index.html`, игнорируя возможные коллизии.

Можно оставить `sirv` для статики и добавить fallback сверху:

```ts
const staticHandler = sirv(DIST, { dev: false, etag: true, single: false });
const indexHtml = readFileSync(join(DIST, "index.html"));

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";
  const pathname = url.split("?")[0];
  const hasExt = /\.[a-zA-Z0-9]+$/.test(pathname);
  if (hasExt) {
    return staticHandler(req, res, () => {
      res.statusCode = 404; res.end("Not found");
    });
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(indexHtml);
});
```

Ключевое: `single: false` у sirv (мы сами рулим fallback), и для любого «страничного» пути — свежий `index.html`, никогда не stale.

### 3. Порядок выполнения остаётся прежним

`cleanStaleHtml(DIST)` → `startServer()` → `renderQueue()` пишет свежие `dist/<route>/index.html` → `render404()` пишет `dist/404.html`. Между прогонами CI лишних файлов нет.

## Файлы

- `scripts/prerender.ts` — `cleanStaleHtml`, замена обработчика http-сервера на explicit SPA-fallback из in-memory `dist/index.html`.

## Что НЕ делаем

- Не трогаем `vite.config.ts`, `src/main.tsx`, `__root.tsx` — корень в исходном `index.html` есть, проблема только в сервере prerender.
- Не меняем `WAIT_SELECTOR`, concurrency, таймауты.
- Не удаляем ассеты из `dist/` — только HTML-страницы роутов.
