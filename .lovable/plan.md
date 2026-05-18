# Проверка sitemap.xml / robots.txt после PRERENDER=1

## Что проверил

- Сгенерировал `dist/sitemap.xml` через `npx tsx scripts/generate-seo.ts` — 99 URL.
- Сравнил все пути из sitemap с роутами в `src/routes/` и со списком в `src/lib/route-config.ts`.
- Проверил `public/.htaccess` (как Apache/Beget будет отдавать `dist/<route>/index.html`).
- Проверил `public/robots.txt` vs тот, что пишет `scripts/generate-seo.ts` в `dist/`.
- Проверил, что `stavropol` нигде не осталось — чисто (0 совпадений).

## Найденные проблемы

### 1. `generate-seo.ts` затирает `public/robots.txt` (критично)

Vite копирует `public/robots.txt` в `dist/`, а потом `generate-seo.ts` перезаписывает его минимальной версией:

```
User-agent: *
Allow: /
Disallow: /thank-you
Sitemap: https://tlz-craftsman-hub.lovable.app/sitemap.xml
```

В `public/robots.txt` лежит богатая версия (Disallow `/api/`, `/lp/`, `/quiz/`, `?utm`, `?gclid`, плюс блоки для GPTBot/ClaudeBot/PerplexityBot/YandexGPT/Google-Extended/OAI-SearchBot/ChatGPT-User, `Host:`). После `build:prod` всё это пропадает.

**Фикс:** убрать запись `robots.txt` из `scripts/generate-seo.ts` — оставить только генерацию `sitemap.xml`. Источник правды для robots — `public/robots.txt`. (Если нужно — синхронизировать `Disallow: /thank-you` и `Sitemap:` в `public/robots.txt`.)

### 2. Trailing-slash mismatch между sitemap и физическими файлами

Sitemap содержит `https://.../services` (без `/`), а prerender пишет `dist/services/index.html`. Apache с `DirectoryIndex index.html` на запрос `/services` сделает 301 → `/services/`. То есть **каждый URL в sitemap (кроме `/`) — это редирект**, что Google помечает как «sitemap contains URLs that redirect».

**Варианты фикса** (выбрать один):

- **A. Канонический URL без слэша** (рекомендую — короче, совпадает с `<Link to="/services">`):
  prerender пишет в `dist/services.html` вместо `dist/services/index.html`. В `.htaccess` добавить `RewriteRule ^([^/]+)/$ /$1 [R=301,L]`, чтобы убрать слэш.
- **B. Канонический URL со слэшем:** в `route-config.ts` ко всем путям (кроме `/`) добавить `/`. Sitemap и `<link rel="canonical">` будут совпадать с физическим путём. Меняется и `getCanonical()`.

### 3. Роуты, которые есть в приложении, но отсутствуют в sitemap

В `src/routes/` есть страницы, которых нет в `route-config.ts`:
`/garantii`, `/licenzii`, `/otzyvy`, `/oplata`, `/oferta`, `/rekvizity`, `/soglasie`, `/vyezd`, `/thank-you`, `/lp/$citySlug/$serviceSlug`.

- `/thank-you`, `/lp/*` — правильно НЕ в sitemap (служебные).
- `/garantii`, `/licenzii`, `/otzyvy`, `/vyezd` — скорее всего, надо добавить в `staticEntries` (priority 0.5, monthly).
- `/oplata`, `/oferta`, `/rekvizity`, `/soglasie` — юридические, обычно ставят priority 0.3 yearly, либо оставляют вне sitemap, но без `noindex`.

Уточню решение в вопросах ниже.

## План действий

1. **`scripts/generate-seo.ts`** — удалить функцию `buildRobots()` и её запись в `dist/`. Оставить только `sitemap.xml`.
2. **Привести sitemap и физические файлы к одной форме URL** (вариант A или B из п. 2).
3. **Добавить недостающие страницы** в `staticEntries` `src/lib/route-config.ts` (по решению в вопросе ниже).
4. **`public/robots.txt`** — синхронизировать с реальностью: добавить `Disallow: /thank-you`, убедиться, что `Sitemap:` строка актуальна. Остальные правила (AI-боты, utm/gclid) остаются.
5. Прогнать `npm run build:prod` локально (с Chromium) и убедиться, что `generate-seo.ts --verify` проходит (для каждого URL из sitemap есть `dist/<route>/index.html` или `dist/<route>.html`).

## Вопросы перед реализацией

1. Канонический URL — со слэшем (`/services/`) или без (`/services`)? Сейчас в коде везде без слэша — рекомендую вариант A (без слэша) и редирект в `.htaccess`.
2. Юридические страницы `/oferta`, `/rekvizity`, `/soglasie`, `/oplata` — добавляем в sitemap (priority 0.3) или оставляем вне?
3. `/garantii`, `/licenzii`, `/otzyvy`, `/vyezd` — добавляю в sitemap?
