
## Что делаем

### 1. FAQPage JSON-LD на city×service — синхронизировать с видимым блоком
Сейчас в `src/routes/cities.$citySlug.$serviceSlug.tsx` в UI показывается `[...sc.faq, ...service.faq.slice(0, 2)]` (до 5 вопросов), а в JSON-LD (`buildFAQSchema(sc.faq)`) уходит только `sc.faq` (≤3). Google требует, чтобы FAQPage-разметка точно соответствовала видимому контенту, иначе она игнорируется/помечается как spammy.

Изменения:
- Собрать массив `visibleFaq = [...sc.faq, ...service.faq.slice(0, 2)]` один раз (в `head()` и в компоненте — из общего хелпера или прямо инлайн).
- В `head()` передавать `buildFAQSchema(visibleFaq)` вместо `sc.faq`.
- Дедуп по вопросу `q` на всякий случай (если `sc.faq` пересекается с `service.faq`).

### 2. FAQ-блоки и FAQPage JSON-LD на страницах блога
Сейчас `BlogPost` (в `src/data/blog.ts`) не имеет поля `faq`, блока FAQ на статьях нет, `buildFAQSchema` в `src/routes/blog.$slug.tsx` не вызывается.

Изменения:
- В `src/data/blog.ts`: расширить тип
  ```ts
  export type BlogPost = { ...; faq?: { q: string; a: string }[] };
  ```
  Добавить 4–6 GEO-ориентированных FAQ к каждому из 4 постов (вопросы вида «Сколько стоит удаление плесени после потопа в Сочи?», «Через сколько после залива появляется плесень в Крыму?», «Сушит ли тепловая пушка стены?» и т.п. — тематически по посту, со склонениями ЮФО/Крым/Краснодар/Ростов/Сочи, чтобы не ломать geo-баланс из прошлой итерации).
- В `src/routes/blog.$slug.tsx`:
  - Импортировать `FAQSection` (`src/components/site/FAQSection.tsx`) и `buildFAQSchema`.
  - Отрендерить `<FAQSection faqs={post.faq} />` после `post.body` и перед блоком «По теме», только если `post.faq?.length`.
  - В `head()` добавить `buildFAQSchema(post.faq ?? [])` в `buildGraphHead([...])` — `buildFAQSchema` уже возвращает `null` для пустого массива, `buildGraphHead` его фильтрует.

### 3. Sitemap / robots / canonical — синхронизация
- `scripts/generate-seo.ts` уже пишет `dist/sitemap.xml` из `getAllRoutes()` (285 city×service + 4 блога + статика). Ничего не меняем в списке маршрутов — он корректен. Добавляем в sitemap `<lastmod>` для блога (`blogPosts[i].publishedAt`) и общий `<lastmod>` = дата сборки для остальных URL — так Яндекс/Google быстрее переобойдут FAQ-обновления.
- `public/robots.txt` не трогаем (уже корректен: `Sitemap: https://sanitarnyeresheniya.ru/sitemap.xml`, `Host: sanitarnyeresheniya.ru`, разрешены все GPT/Yandex/Perplexity боты).
- В `scripts/prerender.ts` уже есть `dedupeHead()`, оставляющий один `<link rel="canonical">` и один `<title>` из дочернего роута — canonical для city×service и блога уже проставляется корректно через `buildCanonical(path)` в head роутов. Ничего не меняем.

### 4. Верификация prerender + JSON-LD
Добавить в `scripts/generate-seo.ts` (или отдельным `--verify-jsonld` режимом) проверку после prerender:
- Для каждого маршрута из `getAllRoutes()` открыть `dist/<route>/index.html`.
- Извлечь все `<script type="application/ld+json">`, распарсить JSON, найти `@graph` и проверить:
  - city×service: присутствуют типы `WebPage`, `BreadcrumbList`, `Service`, `LocalBusiness`, `FAQPage` (последний — с `mainEntity.length >= 3`).
  - blog/*: присутствуют `BreadcrumbList`, `Article`, `FAQPage` (если у поста задан `faq`).
  - Все URL в JSON-LD начинаются с `https://sanitarnyeresheniya.ru`.
  - Ровно один `<link rel="canonical">` и он совпадает с ожидаемым `buildCanonical(path)`.
  - `<meta name="robots">` либо отсутствует, либо не содержит `noindex`.
- Ошибки выводятся списком, exit 1 при любых расхождениях. Вызов из `package.json` script `verify:seo` и (опционально) шаг в GH Actions после `build:prod`.

## Технические детали

- `buildFAQSchema` и `buildGraphHead` уже готовы — их сигнатуры не меняем.
- Для дедупа вопросов на city×service — простой `Map` по нормализованному `q`.
- Верификатор — на `node:fs` + regex `/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g` + `JSON.parse`; puppeteer не нужен, работаем поверх готового `dist/`.
- `<lastmod>` в sitemap — ISO-дата (`YYYY-MM-DD`). Для блога берём `publishedAt`, для остальных — `new Date().toISOString().slice(0,10)`.

## Файлы

- `src/routes/cities.$citySlug.$serviceSlug.tsx` — синхронизация FAQPage JSON-LD с видимым списком.
- `src/data/blog.ts` — добавить `faq?` + FAQ-массивы к 4 постам.
- `src/routes/blog.$slug.tsx` — рендер `FAQSection` + `buildFAQSchema` в `@graph`.
- `scripts/generate-seo.ts` — `<lastmod>` в sitemap + режим `--verify-jsonld`.
- `package.json` — script `verify:seo`.

## Что не трогаем

- `public/robots.txt` (уже корректен).
- `src/lib/site.ts`, `SITE_URL`, canonical-логику.
- Список маршрутов в `src/lib/route-config.ts`.
- FAQ на статических страницах (`/faq` уже эмитит FAQPage).
- Список постов и структуру `body` — только добавляем поле `faq`.
