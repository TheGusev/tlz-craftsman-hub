# Полный аудит sanitarnyeresheniya.ru

Дата: 2026-07-07. База: 134 URL из `sitemap.xml`, скачаны и распарсены; Lighthouse desktop на главной.

## Итоговый балл: **79 / 100**

| # | Категория | Балл | Комментарий |
|---|---|---|---|
| 1 | Технический SEO | **18/20** | 6 стейл-дублей канонических из-за старого билда |
| 2 | Structured Data | **12/15** | JSON-LD везде, но дублируется из-за head-склейки |
| 3 | Гео-SEO | **13/15** | 17 городов + Москва+МО, LocalBusiness на каждом |
| 4 | Контент-SEO | **6/10** | Блог 170-220 слов, city×service ~400 слов — тонко |
| 5 | Performance / CWV | **9/15** | LCP 4.5s, total 23 MB — просят WebP и preload |
| 6 | Accessibility | **9/10** | Контраст text-accent + одна aria-label |
| 7 | Security | **4/5** | Всё кроме CSP |
| 8 | Visual / UX | **8/10** | Единый tone Москва/МО = остальные города |

---

## 1. Технический SEO — 18/20

**Что уже отлично**
- HTTPS + HSTS preload (`max-age=63072000; includeSubDomains; preload`)
- 134/134 URL отдают HTTP 200
- `robots.txt`: правильный, AI-боты (GPT/Claude/Perplexity/YandexGPT/Gemini) разрешены, служебное (`/lp`, `/api`, `/quiz`, `?utm`, `?yclid`) закрыто
- `sitemap.xml` валиден, 134 URL
- Заголовки: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`
- **0 дублей title** и **0 дублей description** по всему сайту
- `<html lang="ru">`, viewport, charset — всё на месте
- `<meta name="robots">` = `index,follow,max-image-preview:large,max-snippet:-1` на 133 из 134 (privacy — `noindex,follow`, правильно)

**Что мешает 20/20 (P1)**
- **6 страниц: два `<link rel="canonical">`.** Первый указывает на `/services`, второй — на реальную страницу. Пострадали: `udalenie-zapaha-gari`, `udalenie-trupnogo-zapaha`, `unichtozhenie-tarakanov`, `unichtozhenie-klopov`, `unichtozhenie-blokh`, `unichtozhenie-muravev`. **Причина: прод ещё не переразвернут после последнего фикса** (в `scripts/prerender.ts` уже есть `dedupeHead()`, локальные исходники чисты — нужен rebuild + publish).
- **67/134 страниц: description вне диапазона 120–170 символов** (в основном короткие, 80-100). Не критично, но SERP-сниппет усечён.
- **Cache-Control HTML: `no-cache, no-store, must-revalidate`** — `no-store` блокирует BFCache браузера (пользователь нажал «назад» → полная перезагрузка). Достаточно `no-cache` без `no-store`.

## 2. Structured Data — 12/15

**Что уже отлично**
- 134/134 страниц имеют JSON-LD
- Правильный набор типов:
  - `/` → Organization + WebSite + LocalBusiness + Service×19 + FAQPage
  - `/services/*` → Service + FAQPage + BreadcrumbList
  - `/cities/:city` → LocalBusiness + BreadcrumbList
  - `/cities/:city/:service` → Service + LocalBusiness + FAQPage
  - `/cases/*` → Article + ImageGallery + BreadcrumbList
  - `/blog/*` → Article + BreadcrumbList

**Что мешает 15/15 (P2)**
- Массовая дупликация из-за склейки `head()` родителя и ребёнка в TanStack Router:
  - `WebPage` × 2-3 на большинстве страниц
  - `BreadcrumbList` × 2-3
  - `LocalBusiness` × 2 на city×service (17 городов + Москва/МО)
- `dedupeHead()` в prerender'e не покрывает `<script type="application/ld+json">`. Yandex/Google дедуплицируют по `@id`, но чище отдавать один комплект.
- **Fix**: расширить `dedupeHead()` — дедуп JSON-LD по содержимому `@id`.

## 3. Гео-SEO — 13/15

**Что уже отлично**
- Полное покрытие: Крым (Симферополь, Севастополь, Ялта, Евпатория, Керчь, Феодосия, Алушта, Судак, Саки), Краснодарский край (Краснодар, Сочи, Анапа, Геленджик, Новороссийск), Ростов, Москва, МО — 17 городов
- 2 региональных landing: `/regions/krym`, `/regions/moskva-mo`
- `LocalBusiness` schema на каждом городе с адресом, координатами, телефоном
- NAP-консистентность: единый `SITE_PHONE` и `SITE_NAME` через `src/lib/site.ts`
- Единая структура city×service = 9 услуг на каждом городе (морги/пожары/фумигация/плесень/дезинфекция/дезинсекция/дератизация/тараканы/клещи)

**Что мешает 15/15 (P2)**
- В `LocalBusiness` не проверялось наличие `aggregateRating` (нет отзывов в разметке)
- `areaServed` с районами города — проверить, чтобы Москва/МО получили все свои районы

## 4. Контент-SEO — 6/10

**Средняя длина текста по типам страниц:**

| Тип | Кол-во | min | avg | max | Норма |
|---|---|---|---|---|---|
| Home | 1 | 941 | 941 | 941 | ✅ |
| Services | 1 | 407 | 407 | 407 | ⚠️ 600+ |
| Service page | 19 | 362 | 453 | 541 | ⚠️ 800+ |
| City | 17 | 383 | 510 | 717 | ⚠️ 700+ |
| **City × service** | 61 | **311** | **400** | 580 | ❌ 800+ для гео-запросов |
| Case | 12 | 652 | 652 | 652 | ✅ |
| **Blog** | 4 | **173** | **197** | 220 | ❌ 1200+ |

**P0**
- **Блог: 173-220 слов** — критически тонко. Для запросов «что делать после пожара в квартире» нужны 1200-2000 слов + FAQ, чтобы конкурировать
- **city×service ~400 слов** — минимум 800 нужен для «дезинфекция после смерти Москва» (тег KDI 30-50 по SEMRush)

**Хорошее**
- ✅ Один H1 на каждой странице
- ✅ Все `<img>` с `alt` — проверено 134/134 страницы
- ✅ Уникальные title/description на 134/134

## 5. Performance (CWV) — 9/15 (desktop Lighthouse)

```
performance     75
accessibility   96
best-practices  78
seo            100
```

| Метрика | Значение | Target | Статус |
|---|---|---|---|
| **LCP** | **4.5 s** | ≤ 2.5 s | ❌ |
| CLS | 0.002 | ≤ 0.1 | ✅ |
| TBT | 30 ms | ≤ 200 ms | ✅ |
| FCP | 1.0 s | ≤ 1.8 s | ✅ |
| TTFB | 262 ms | ≤ 800 ms | ✅ |

**LCP breakdown:**
- LCP-элемент: `/assets/geography-CQvQCYTj.jpg` (hero главной, 1335×864)
- TTFB 262ms (6%) + Load Delay 1265ms (28%) + Load Time 1989ms (44%) + Render Delay 995ms (22%)
- **Load Time 2 сек** — картинка тяжёлая, не в WebP/AVIF
- **Total transfer 23.9 MiB** — критично много

**P0 (для CWV):**
1. Конвертнуть все hero и cards картинки в WebP/AVIF (`vite-imagetools`)
2. Добавить `<link rel="preload" as="image">` в `index.html` для LCP на главной
3. Убрать `no-store` из Cache-Control на HTML → BFCache восстановится

**P1:**
- Unused JS 96 KiB
- Убрать WebSocket из бандла на публичных страницах (или lazy) — тоже режет BFCache

## 6. Accessibility — 9/10 (Lighthouse 96)

**Проблемы:**
1. **`color-contrast` fail** — `text-accent` на светлых фонах не проходит WCAG AA (4.5:1):
   - «политикой конфиденциальности» в футере
   - «Все услуги →» ссылка
   - Бейджи «Москва и МО», «1-2 часа по городу» и т.п.
   - **Fix**: увеличить контраст `--accent` в `index.css` или использовать `text-accent-foreground` на цветном фоне
2. **`label-content-name-mismatch`** — `<a aria-label="Позвонить" href="tel:...">+7 961 911-99-19</a>`: aria-label должен содержать видимый текст. **Fix**: `aria-label="Позвонить +7 961 911-99-19"` или убрать aria-label.

## 7. Security — 4/5

- ✅ HTTPS + HSTS preload
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- ⚠️ **Нет CSP-заголовка** — добавить хотя бы `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' mc.yandex.ru; ...`
- ⚠️ Third-party cookies (Яндекс.Метрика) — предупреждение Chrome, но снять нельзя (метрика важна)

## 8. Visual / UX — 8/10

- Единая типографика Space Grotesk + DM Sans (уже preload'ится)
- Новые Москва/МО-страницы визуально идентичны Крыму и Краснодару — консистентно
- Sticky CTA-кнопка «Позвонить» на mobile — есть
- Кликабельные TG/WA/Max/tel — на месте
- CTA видна без прокрутки на home
- **Мелочи**: тап-таргеты бейджей в hero могут быть < 44×44 на mobile — проверить

---

## Что делать, чтобы стать 100/100

### P0 (обязательно, поднимет до ~90/100)
1. **Rebuild + publish** — уйдут 6 дублей canonical и 8 дублей og:image из p.1 автоматически
2. **Расширить контент**:
   - Блог: каждая статья 1200-1500 слов + FAQ + BreadcrumbList (сейчас 200)
   - city×service: расширить до 800+ слов, добавить локальные упоминания (районы, метро, ЖК)
3. **LCP-фикс**:
   - hero-картинки в WebP через `vite-imagetools`
   - `<link rel="preload" as="image">` на LCP
4. **Cache-Control**: убрать `no-store`, оставить `no-cache` → BFCache вернётся
5. **Accessibility**:
   - Поднять контраст `--accent` до 4.5:1
   - `aria-label` телефонной ссылки = видимый текст

### P1 (пиксель-перфект, добьёт до 100/100)
6. Расширить `dedupeHead()` в `scripts/prerender.ts` для JSON-LD (дедуп по `@id`)
7. Оптимизировать description на 67 страницах до 140-160 символов
8. Добавить `AggregateRating` в LocalBusiness (когда будут отзывы)
9. Добавить CSP-заголовок
10. Убрать unused JS (96 KiB) — code splitting по роутам

### P2 (косметика)
11. `areaServed` с районами Москвы/МО в LocalBusiness
12. Автогенерация OG-картинок под каждый город/услугу (сейчас общая или сервисная)

---

## Что уже отлично 🎯

- SEO Lighthouse **100/100**
- CLS 0.002 (одно из лучших значений)
- TBT 30 ms (моментальная отзывчивость после загрузки)
- HTTPS + HSTS preload
- Все AI-краулеры (GPTBot/ClaudeBot/PerplexityBot/YandexGPT) явно разрешены — GEO/AEO-оптимально
- 134/134 страниц с уникальными title/description
- Полное покрытие Крыма (9 городов), Краснодарского края (5), Ростова, Москвы+МО (2)
- Полный набор JSON-LD schema под каждый тип страницы
- Sticky CTA на mobile, TG/WA/Max/tel — все каналы связи
