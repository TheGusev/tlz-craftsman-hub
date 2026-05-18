## Миграция: TanStack Start → Vite SPA + prerender + Apache (Beget)

Цель: уйти от SSR на Cloudflare Worker, оставить TanStack Router и file-based роуты, сохранить SEO через статический prerender, переключить лид-форму на Telegram, деплоить как статику на Apache.

---

### 1. Чистка серверной части

Удалить файлы:
- `src/server.ts`, `src/start.ts`, `src/lib/error-capture.ts`, `src/lib/error-page.ts`
- `src/routes/api.leads.ts`
- `src/routes/sitemap[.]xml.tsx` (будет генериться скриптом в `dist/`)
- `wrangler.jsonc`

Удалить зависимости: `@tanstack/react-start`, `@cloudflare/vite-plugin`, `@lovable.dev/vite-tanstack-config`.

Добавить: `@tanstack/router-plugin`, `puppeteer-core`, `sirv` (или `serve-handler`) — для prerender; `@types/node` уже есть.

### 2. Новый `vite.config.ts`

Чистый Vite + React + Tailwind v4 + TanStack Router plugin:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "src/routes", generatedRouteTree: "src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: { host: "::", port: 8080 },
});
```

### 3. Точка входа SPA

Создать `index.html` в корне (Vite SPA-формат) и `src/main.tsx`:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode><RouterProvider router={getRouter()} /></StrictMode>
);
```

`index.html` содержит общий шаблон `<head>` (favicon, viewport, шрифты, Я.Метрика, og-default) и `<div id="root">`. Per-route `<title>`/meta/JSON-LD проставляет TanStack Router через `head()` в run-time, а prerender замораживает их в физический HTML.

### 4. Переделка `__root.tsx`

- Убрать `shellComponent`/`<html>`/`<head>`/`<HeadContent />`/`<Scripts />` — это теперь делает `index.html`.
- Заменить `createRootRouteWithContext` → продолжать использовать, но без `Scripts`.
- `head()` остаётся (TanStack Router умеет управлять `document.head` на клиенте; prerender заберёт результат после гидратации).
- Импорт `appCss from "../styles.css?url"` убрать — стили подключаются через `main.tsx`.

### 5. Router

`src/router.tsx` уже почти готов — оставляем `createRouter({ routeTree, ... })`. Убрать SSR-специфику если есть. `routeTree.gen.ts` продолжит автогенериться плагином.

### 6. Лид-форма → Telegram

`src/components/site/LeadForm.tsx`:
- Заменить `fetch("/api/leads", ...)` на отправку в Telegram Bot API.
- Токен/chat_id из `import.meta.env.VITE_TG_BOT_TOKEN` и `VITE_TG_CHAT_ID`.
- Сформировать читаемый текст заявки (имя, телефон, город, услуга, проблема, urgency, UTM, landing).
- Защита: honeypot-поле `website` (скрытое, если заполнено — silent success), rate-limit через `localStorage` (1 заявка / 30 сек по timestamp).
- Сохранить редирект на `/thank-you` и `trackGoal`.

То же самое для `MobileQuickLead.tsx` (если шлёт на `/api/leads`).

Добавить пример `.env.example` с `VITE_TG_BOT_TOKEN`, `VITE_TG_CHAT_ID`.

### 7. Prerender + sitemap

`scripts/generate-seo.mjs`:
- Импортирует `src/data/{services,cities,serviceInCity,blog,cases}.ts` (через `tsx`/`bun` или скомпилированный JSON).
- Генерирует `dist/sitemap.xml` и `dist/robots.txt` из массива маршрутов (тот же `getAllRoutes()` из `src/lib/route-config.ts`).
- Флаг `--verify`: проверяет, что для каждого URL есть `dist/<path>/index.html`.

`scripts/prerender.mjs`:
- Поднимает локальный статический сервер на `dist/` (sirv).
- Запускает puppeteer-core (`executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium"`).
- Для каждого маршрута: `goto`, ждёт `networkidle0` + селектор `#main`, забирает `document.documentElement.outerHTML`, пишет в `dist/<route>/index.html`.
- Concurrency 4. `PRERENDER=0` пропускает шаг.
- Список маршрутов — общий с sitemap (один источник правды).

Обновить `package.json scripts`:
```
"build": "vite build && node scripts/generate-seo.mjs && node scripts/prerender.mjs && node scripts/generate-seo.mjs --verify"
```

### 8. Apache / Beget

`public/.htaccess`:
- `Options -MultiViews`, `RewriteEngine On`
- Если запрошенный путь — реальный файл/директория → отдать его (prerender уже создал `<path>/index.html`).
- Иначе → `RewriteRule . /index.html [L]` (SPA-fallback).
- `Cache-Control: no-cache` для `*.html`, `immutable, max-age=31536000` для `assets/*`.
- Gzip/Brotli через `mod_deflate`/`mod_brotli`.

`public/_redirects` — на будущее (Netlify/CF): `/* /index.html 200`.

### 9. Что остаётся как есть

- Все роуты `src/routes/*.tsx` (страницы) — без изменений, `head()` работает в SPA.
- Данные (`src/data/*`), компоненты, стили (`src/styles.css`), `jsonld.ts`, `seo.ts`, `route-config.ts`.
- `useAnalytics`, Яндекс.Метрика (через snippet в `index.html`).

### 10. Технические нюансы

- **Beget не имеет Chromium** → prerender запускается локально/в GitHub Actions, в репозиторий деплоится уже готовый `dist/`. Деплой = `rsync dist/ → /var/www/.../release-<ts>/` + переключение симлинка `current`.
- **Trailing slash**: в `ROUTES` все URL с `/` на конце (кроме `/`), prerender пишет `dist/path/index.html`, canonical в `head()` совпадает.
- **JSON-LD per-route**: prerender гарантированно сохранит `<script type="application/ld+json">` из `head()` — проверим на одной странице.
- **404**: `__root.tsx` `notFoundComponent` остаётся; для прямого захода на несуществующий URL Apache отдаст `index.html` → клиент покажет 404-страницу. Для «настоящего» 404-статуса (важно для SEO) можно дополнительно прописать `ErrorDocument 404 /404.html` и сгенерировать `dist/404.html` в prerender.
- **og:image fallback**: положить `public/og-default.jpg` (1200×630).

### 11. План работ (порядок коммитов)

1. Добавить `index.html` + `src/main.tsx`, переписать `__root.tsx` и `vite.config.ts`, удалить server-файлы и зависимости. Проверить, что dev/build работает как SPA.
2. Переписать `LeadForm` и `MobileQuickLead` на Telegram.
3. Добавить `scripts/generate-seo.mjs` и `scripts/prerender.mjs`, обновить `build`-цепочку.
4. Добавить `public/.htaccess`, `public/_redirects`, `public/og-default.jpg`.
5. Проверить локально: `npm run build` → `dist/` содержит уникальные `<title>`/meta для нескольких роутов + sitemap + 404.

---

### Открытые вопросы перед стартом

1. **Telegram-форма**: на сайте есть `LeadForm` и `MobileQuickLead`. Обе шлют одно и то же в один чат, или нужны разные чаты/теги? Файлов-вложений в форме нет — подтверждаешь?
2. **404 как реальный HTTP-статус**: генерировать `dist/404.html` и прописать `ErrorDocument 404 /404.html`? (Рекомендую да — иначе все «не найдено» отдаются как 200, что плохо для индексации.)
3. **Деплой**: настраиваем GitHub Actions сейчас (нужны SSH-креды Beget как secrets) или ты сам соберёшь локально и зальёшь по FTP/SSH первый раз?
