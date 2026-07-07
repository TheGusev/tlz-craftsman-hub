## Цель

Прогнать сайт `sanitarnyeresheniya.ru` через полный аудит: техническое SEO, гео-SEO (для Москвы/МО, Краснодара, Крыма и т.д.), структурированные данные, производительность, доступность, безопасность, визуал/UX. На выходе — балльная оценка по 8 категориям (0–100 в каждой + сводный балл) с конкретными «что чинить, чтобы стало 100».

Аудит **только чтение** — правки не делаю, сначала показываю отчёт. После вашего одобрения фикшу все находки одним заходом.

## Что и как проверю

### 1. Технический SEO (crawl-аудит, вес 20)
- Скачиваю все 134 URL из `sitemap.xml` (прод), парсю `<head>`.
- На каждой странице проверяю:
  - **1 `<title>`**, длина 30–65 симв., уникальность по всему сайту.
  - **1 `<meta name="description">`**, 120–170 симв., уникальность.
  - **1 `<link rel="canonical">`**, самореференс (URL страницы = URL канона).
  - **1 `<meta name="robots">`**, значение `index,follow,…` (кроме `/privacy`).
  - `og:title/og:description/og:url/og:image` — по одному, `og:url == canonical`, `og:image` — абсолютный URL, 1200×630.
  - `twitter:card = summary_large_image`, `twitter:image` абсолютный.
  - `<html lang="ru">`, `<meta charset>`, `<meta viewport>`.
  - HTTP-ответ 200, редиректы (`www` → без `www`, `http` → `https`), нет 4xx/5xx.
  - `X-Robots-Tag` заголовок не противоречит meta robots.
- `robots.txt`: доступен, разрешает индексацию, ссылка на sitemap.
- `sitemap.xml`: валиден, все URL отвечают 200, `lastmod` есть.
- Хлебные крошки: `BreadcrumbList` JSON-LD на всех вложенных страницах.
- 404-страница: отдаётся с корректным кодом 404 и мета `noindex`.

### 2. Структурированные данные / Schema.org (вес 15)
- Для каждой страницы вытаскиваю все `<script type="application/ld+json">` и валидирую JSON.
- Проверяю наличие нужных типов по типу страницы:
  - Главная: `Organization` + `WebSite` (с `SearchAction`).
  - `/cities/:city`: `LocalBusiness` (или `EmergencyService`) с `address`, `geo`, `areaServed`, `telephone`, `openingHoursSpecification 24/7`, `priceRange`, `aggregateRating` если есть отзывы.
  - `/cities/:city/:service`: `Service` со ссылкой на `LocalBusiness` + `areaServed`.
  - `/services/:slug`: `Service` + `FAQPage` если есть FAQ.
  - `/cases/:slug`: `Article` + `BreadcrumbList` + `ImageObject`.
  - `/blog/:slug`: `Article` с `datePublished/dateModified/author/image`.
  - `/faq`, `/prices`: `FAQPage`, `PriceSpecification`.
- Прогоняю каждую разметку через Google Rich Results Test API (или локальный `schema-dts`-валидатор).

### 3. Гео-SEO (вес 15)
- В сайдбаре сборной инфы: **где** мы упоминаем каждый регион (title/H1/canonical), **сколько раз** название города встречается в тексте (нормально 3–8 на 1000 знаков, спам > 15).
- `LocalBusiness.address` с `addressLocality` для каждого города.
- `geo` с координатами (lat/lng) на каждой city-странице.
- `areaServed` перечисляет все районы города (у нас в `cities.ts` есть `districts`).
- NAP-консистентность: телефон/адрес/название совпадают везде (`SITE_PHONE`, `SITE_NAME`).
- `hreflang` — не нужен (одноязычный сайт).
- Sitemap разбит логично; для крупных городов (Москва, Краснодар) — есть ли internal linking из главной/regions.

### 4. Контент-SEO (вес 10)
- Уникальность H1 на страницу (один H1, содержит основной ключ).
- Иерархия `H1 → H2 → H3` без скачков.
- Плотность ключей (город + услуга) в title/H1/URL/первом абзаце/alt.
- Длина текста на посадочных city×service: минимум 800–1200 слов для конкурентных запросов ( «дезинфекция после смерти Москва» и т.п.).
- Внутренние ссылки: у city-страницы → на 9 service-in-city; у service — на все города; у cases/blog — обратно на профильные посадочные.
- `alt` атрибуты на всех `<img>` (проверю HTML всех 134 страниц).

### 5. Производительность (Core Web Vitals, вес 15)
- Прогоняю `unlighthouse` или `lighthouse` на выборке из ~10 представительных URL (главная, city, city×service, case, blog, services). Метрики:
  - **LCP** ≤ 2.5s
  - **CLS** ≤ 0.1
  - **INP** ≤ 200ms
  - TBT ≤ 200ms
  - Total transfer size, JS size.
- Проверю:
  - Preload LCP-картинки (`<link rel="preload" as="image">`).
  - Формат картинок (WebP/AVIF vs JPEG/PNG).
  - Ленивая загрузка нехайлайтных `<img loading="lazy">`.
  - `fetchpriority="high"` на LCP, `low` на прочих.
  - Font-display swap, preconnect к CDN шрифтов.
  - Отсутствие render-blocking скриптов; аналитика с `async/defer`.
  - Кэширование статики: `Cache-Control: public, max-age=31536000, immutable` на `/assets/*`.

### 6. Доступность (a11y, вес 10)
- axe-core через Playwright на выборке из 10 страниц.
- Контрастность (WCAG AA ≥ 4.5:1 для основного текста, 3:1 для крупного).
- Все кнопки/ссылки имеют доступное имя (`aria-label` на icon-only).
- Формы: `<label for>`, `aria-invalid`, обязательные поля помечены.
- Один `<main>`, landmark-регионы, tab-порядок логичный.
- Focus-visible виден.

### 7. Безопасность (вес 5)
- HTTPS, HSTS.
- CSP-заголовок (если есть — валиден; если нет — предложу).
- `Referrer-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` или `frame-ancestors`.
- Утечки: нет `.env`, `.git`, source maps на проде.
- Формы: honeypot / rate-limit, CSRF (нам нужен?).

### 8. Визуал / UX / GEO-UX (вес 10)
- Playwright-скриншоты в трёх вьюпортах (375×812 mobile, 768×1024 tablet, 1440×900 desktop) на ~10 страниц.
- Что смотрю:
  - Hero без «обрезки» текста, CTA виден без прокрутки.
  - Единая типографика, единый тон.
  - Формы заявки — фокус, состояние отправки, подтверждение.
  - Все ссылки на TG/WA/Max/телефон — рабочие (кликаю Playwright'ом, проверяю URL).
  - Единый tone для новых МО-страниц по сравнению со старыми (Крым/Краснодар).
  - Липкие CTA и «позвонить»-кнопка на mobile.
  - Отсутствие layout shift, дребезга шрифтов, «плавания» картинок.

### 9. GEO / Локальные каталоги (бонус, вне общего балла)
Не проверяется автоматически, но добавлю в отчёт чек-лист:
- Яндекс.Бизнес / Google Business Profile для каждого города?
- Отзывы на Яндекс.Картах, 2GIS, Otzovik?
- Единый NAP во всех каталогах?

## Что получит пользователь

Один markdown-отчёт со структурой:

```text
Итоговый балл: XX/100

┌─ 1. Технический SEO           XX/20  [P0 issues: N]
├─ 2. Structured data            XX/15
├─ 3. Гео-SEO                    XX/15
├─ 4. Контент-SEO                XX/10
├─ 5. Performance (CWV)          XX/15
├─ 6. Accessibility              XX/10
├─ 7. Security                    X/5
└─ 8. Visual / UX                XX/10

--- Что мешает 100/100 ---
P0 (индексация / краш):
  1. …
P1 (страдает SEO / CWV):
  1. …
P2 (мелочи, косметика):
  1. …

--- Что уже отлично ---
  • …
```

Плюс:
- CSV-таблицу «URL × проверка» для всех 134 страниц с колонками title/description/canonical/robots/schema.
- Скриншоты выборки страниц (mobile+desktop) с пометками проблемных мест.

## Инструменты, которые задействую

- `curl` + `python3` для скачивания и парсинга (`beautifulsoup4`, `json`).
- **Playwright** для рендеринга, скриншотов, click-through проверки форм и кнопок.
- **Lighthouse CLI** (`nix run nixpkgs#lighthouse -- ...`) для CWV на выборке.
- **axe-core** через Playwright для a11y.
- Валидаторы:
  - `xmllint` для `sitemap.xml`.
  - Google Rich Results Test API (открытый) для schema.
  - `curl -I` для заголовков (HSTS, CSP, cache-control).
- Semrush-инструменты (уже подключены) для внешнего взгляда: `domain_analysis`, `top_pages`, `serp_analysis` на ключевые запросы — покажет, как нас видит Google относительно конкурентов, ставлю отдельным блоком в отчёте.

## Что НЕ входит в этот заход

- **Правки кода.** Отдам только отчёт. После вашего «ок, чиним» — второй заход с фиксами по списку P0 → P1 → P2.
- **Тексты «под ключ».** Если контент-SEO покажет тонкий текст на конкретных city×service (< 800 слов) — предложу расширить, но переписывать буду отдельным запросом (это большая работа с копирайтом).
- **Внешние ссылки и каталоги.** Только чек-лист, регистрация в Я.Бизнес/2GIS — вручную.

## Оценка объёма

Аудит займёт ~15–25 tool calls (Lighthouse, Playwright, парсинг). Ничего не деплою, прод не трогаю.

## Готов начать?

Одобрите план — переключу в build mode и запущу все проверки, затем верну единый отчёт с баллами и списком фиксов. После — вторым сообщением ("чиним") прогоню все P0/P1.
