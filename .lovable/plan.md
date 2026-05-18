# Миграция TanStack Start → Vite SPA + Telegram + Apache (Beget)

Статус: **выполнено**.

## Что сделано

### Серверная часть удалена
- `src/server.ts`, `src/start.ts`, `src/lib/error-{capture,page}.ts`
- `src/routes/api.leads.ts`, `src/routes/sitemap[.]xml.tsx`
- `wrangler.jsonc`
- Зависимости: `@tanstack/react-start`, `@cloudflare/vite-plugin`, `@lovable.dev/vite-tanstack-config`

### Чистый SPA на TanStack Router
- `vite.config.ts` — только `TanStackRouterVite` + react + tailwind + tsconfigPaths
- `index.html` (корневой) + `src/main.tsx` (RouterProvider)
- `src/routes/__root.tsx` без `shellComponent`/`<html>`; `<HeadContent />` внутри `RootComponent`
- `src/router.tsx` без SSR-специфики
- `routeTree.gen.ts` регенерируется плагином автоматически

### Лид-форма → Telegram Bot API
- `src/lib/telegram.ts` — `sendLeadToTelegram()` + `checkRateLimit()` (30 сек/lead через `localStorage`)
- `src/components/site/LeadForm.tsx` и `MobileQuickLead.tsx` шлют напрямую в Telegram, оба в один чат, формат HTML с источником `[lead_form]` / `[mobile_quick_lead]`
- Honeypot-поле `website` (скрытый input) — боты заполняют → silent success
- Переменные: `VITE_TG_BOT_TOKEN`, `VITE_TG_CHAT_ID` (см. `.env.example`)

### Prerender + SEO
- `scripts/generate-seo.ts` — генерирует `dist/sitemap.xml` (99 URL) и `dist/robots.txt`; флаг `--verify` проверяет наличие HTML для каждого маршрута
- `scripts/prerender.ts` — sirv-сервер + puppeteer-core, для каждого URL пишет `dist/<route>/index.html` с гидратированными `<title>/meta/JSON-LD`; дополнительно `dist/404.html`
- `package.json`: `build` = `vite build` (для Lovable sandbox); `build:prod` = full chain с prerender (для локальной сборки/деплоя)

### Apache (Beget)
- `public/.htaccess` — отдаёт реальные prerender-файлы, остальные пути → `ErrorDocument 404 /404.html` (правильный HTTP 404 для SEO); gzip/brotli, immutable-кэш для ассетов, `no-cache` для html, security headers
- `public/_redirects` — на будущее (Netlify/CF)

## Как пользоваться

1. Скопируй `.env.example` → `.env` и впиши `VITE_TG_BOT_TOKEN` (от @BotFather) и `VITE_TG_CHAT_ID`
2. Локально для деплоя на Beget:
   ```
   npm install
   PRERENDER=1 CHROMIUM_PATH=/usr/bin/chromium npm run build:prod
   ```
   (на Mac автоопределится Google Chrome; на Linux — установить chromium-browser)
3. Содержимое `dist/` залить на Beget (например, в `~/public_html`)
4. `.htaccess` уже внутри `dist/` (из public/)

## Что осталось пользователю
- Создать Telegram-бот через @BotFather, добавить его в чат, узнать chat_id
- Положить `og-default.jpg` (1200×630) в `public/` если хочется fallback OG-картинки
- Первый деплой по SSH/FTP вручную; CI можно настроить позже
