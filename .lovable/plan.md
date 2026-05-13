
# План переработки сайта по ТЗ из «Правки.docx»

Объём работ очень большой (7 промтов, +10 услуг, +8 городов, новые компоненты, генераторы, sitemap-индексы, рекламные посадочные). Чтобы избежать «недоделанной кучи» — иду строго по порядку из ТЗ: **1 → 2 → 6 → 3 → 4 → 5 → 7**, каждый этап завершаю прогоном `bun run build` и визуальной проверкой ключевых страниц.

## Этап 1 — P0-фиксы (Промт 1)

1. `src/lib/jsonld.ts` — фабрики `buildOrganizationSchema`, `buildWebSiteSchema`, `buildWebPageSchema`, `buildServiceSchema`, `buildLocalBusinessSchema`, `buildFAQSchema`, `buildBreadcrumbSchema`, `buildGraphHead(schemas[])` (склеивает в `@graph`).
2. Расширить типы `Service`, `City`, `ServiceInCity` полем `introAnswer: string` + проставить значения для всех существующих 9 услуг / 8 городов / существующих SIC.
3. Новые компоненты:
   - `src/components/site/IntroAnswer.tsx` — первый `<p class="intro-answer">` в `<article>`.
   - `src/components/site/HeroCTA.tsx` — кнопка «Получить расчёт» в hero (встраивается в `PageHero` через слот `actions`).
   - `src/components/site/FAQSection.tsx` — `<details>/<summary>`, принимает `faqs[]`, рендерит и регистрирует FAQ для `@graph`.
4. Перевести JSON-LD во ВСЕХ роутах (`index`, `services`, `services.$serviceSlug`, `cities`, `cities.$citySlug`, `cities.$citySlug.$serviceSlug`, `regions`, `regions.krym`, `blog`, `blog.$slug`, `cases`, `prices`, `about`, `contacts`, `faq`) на единый `@graph` через `buildGraphHead`.
5. Canonical: в каждой `head()` — абсолютный URL без query, без trailing slash. Хелпер `buildCanonical(path)` в `src/lib/seo.ts`.
6. FAQ-блок (минимум 5 Q/A) добавить в `services/*`, `cities/*`, `cities/*/*`, `prices`, `about`, `contacts`, `cases`, `blog`. Контент — из `src/data/faq.ts` (расширить) + per-page faq.
7. `LeadForm` добавить в sidebar/секцию на `faq`, `cases`, `blog`, `about`, `contacts`, `services` (hub), `privacy` — пропустить.
8. Проверка `MobileQuickLead` sticky bottom.

## Этап 2 — Route-config + sitemap-индексы (Промт 2)

1. `src/lib/route-config.ts` с `RouteEntry`, `getAllRoutes()`, `getCanonical(path)`, `getSitemapEntries(index)`.
2. Удалить trailing slash везде, нормализовать canonical.
3. Разделить sitemap:
   - `sitemap[.]xml.tsx` → sitemap index с 3 ссылками.
   - `sitemap-services[.]xml.tsx`, `sitemap-cities[.]xml.tsx`, `sitemap-content[.]xml.tsx`.
4. `vite.config.ts`: `dynamicPages` строится из `getAllRoutes()`.

## Этап 3 — robots.txt, llms.txt, ai.json, AI-мета (Промт 6)

1. Перезаписать `public/robots.txt` (UA-блок: GPTBot, ClaudeBot, PerplexityBot, YandexGPT, Google-Extended, OAI-SearchBot, ChatGPT-User; Disallow `/api/`, `?utm`, `?yclid`, `?gclid`).
2. `public/llms.txt` — каталог из 19 услуг + 16 городов + контакты. Домен — текущий `tlz-craftsman-hub.lovable.app` (или из переменной).
3. `public/.well-known/ai.json`.
4. В `__root.tsx` добавить мета `ai-content-declaration` и расширенный `robots`.

## Этап 4 — +10 услуг (Промт 3)

1. Добавить в `src/data/services.ts` 10 услуг (`dezinfekciya`, `dezinsekciya`, `deratizaciya`, `unichtozhenie-tarakanov/klopov/kleschey/komarov/muravev`, `ozonirovanie-pomescheniy`, `obrabotka-uchastkov-ot-kleschey`) — каждая полностью заполнена (introAnswer, includes, objects, dangers, steps, equipment, priceFactors, priceFrom, faq ≥5).
2. Расширить тип `Service`: `nameGenitive`, `priceFrom: number`. Дозаполнить старые 9.
3. Перегруппировать кластеры по ТЗ.
4. Hub `/services` — секции по кластерам с иконками.
5. `serviceImages.ts` — заглушки/реальные изображения для 10 новых.
6. Обновить `route-config` + `vite.config` + sitemap + `llms.txt`.

## Этап 5 — +8 городов (Промт 4)

1. `src/data/cities.ts`: Ставрополь, Анапа, Геленджик, Новороссийск, Феодосия, Алушта, Судак, Саки.
2. Расширить тип `City`: `nameGenitive`, `address`, `workingHours`, `coordinates {lat,lng}`, `introAnswer`. Дозаполнить старые 8.
3. Hub `/cities` — группировка по регионам.
4. Создать `src/routes/regions.krasnodarskiy-kray.tsx`, `regions.stavropolskiy-kray.tsx`, `regions.rostovskaya-oblast.tsx` по образцу `regions.krym.tsx`.
5. Обновить `route-config`, sitemap, prerender.

## Этап 6 — Матрица город × услуга (Промт 5)

1. Расширить тип `ServiceInCity`: `introAnswer`, `localOffer`, `localPricing {from,to,unit}`, `localCaseScenario`, `localFaq[]`, `localTriggers[]`, `popularDistricts[]`, `isReady: boolean`.
2. `src/data/generators/generateServiceInCity.ts` — базовый шаблон (заполняет дефолты, `isReady:false`).
3. **Фаза 1 контента**: 5 топ-городов (Краснодар, Сочи, Ростов, Симферополь, Севастополь) × 5 топ-услуг (dezinfekciya, dezinsekciya, deratizaciya, posle-pozhara, posle-potopa) = 25 SIC с уникальным контентом и `isReady:true`.
4. Переработать `routes/cities.$citySlug.$serviceSlug.tsx` по структуре из ТЗ (IntroAnswer → HeroCTA → Что входит → Цены → Районы → Преимущества → FAQ → LeadForm sidebar; @graph c LocalBusiness+Service+FAQPage).
5. В sitemap/prerender попадают только `isReady:true`.

## Этап 7 — Рекламные посадочные `/lp/*` (Промт 7)

1. `src/routes/lp.$citySlug.$serviceSlug.tsx`: noindex,nofollow; минимальный header (логотип + телефон), без основного `Header`/`Footer`/навигации.
2. Структура: Hero+CTA → УТП (4 бокса) → Форма (UTM hidden) → Шаги (4) → Таблица цен → 2-3 кейса → FAQ (3) → финальная форма.
3. UTM перехват из `useSearch` → hidden inputs.
4. dataLayer.push на submit (заглушка — `window.dataLayer = window.dataLayer || []`).
5. НЕ добавлять в sitemap/route-config tier 1-2/перелинковку.

## Финальный чек-лист (после каждого этапа и в конце)

- `bun run build` без ошибок (через харнес).
- Прогон всех ключевых URL на preview (393×844 + 1280): `/`, `/services`, `/services/dezinfekciya`, `/cities`, `/cities/krasnodar`, `/cities/krasnodar/dezinfekciya`, `/regions`, `/regions/krym`, `/regions/krasnodarskiy-kray`, `/blog`, `/cases`, `/about`, `/contacts`, `/prices`, `/faq`, `/lp/krasnodar/dezinfekciya`.
- Просмотр HTML: один `<script type="application/ld+json">` с `@graph`, есть IntroAnswer, HeroCTA, FAQ.
- `sitemap.xml` (index) + 3 sub-sitemap отдают валидный XML.
- `robots.txt`, `llms.txt`, `.well-known/ai.json` доступны.
- Canonical = текущий URL без query/trailing.
- Lead-формы во всех нужных местах.
- `MobileQuickLead` виден на 393×844.
- На `/lp/*` — `<meta name="robots" content="noindex,nofollow">`, нет основного header/footer.

## Технические детали

- Домен: брать `https://tlz-craftsman-hub.lovable.app` (можно вынести в `src/lib/site.ts` как `SITE_URL`).
- Все новые компоненты — semantic tokens из `styles.css`, никаких хардкод-цветов.
- JSON-LD генерируется на сервере (head meta), не на клиенте.
- `route-config` единственный источник для prerender/sitemap/breadcrumbs.

## Что НЕ делаю

- Не меняю текущий главный hero на `/` (карусель остаётся).
- Не меняю URL-структуру (оставляем `/cities/{city}/{service}`).
- Не подключаю Lovable Cloud — формы по-прежнему имитируют отправку.
- Не делаю реальную генерацию контента ИИ — Фаза 2-3 матрицы (за пределами 25 SIC) остаётся скелетом с `isReady:false`.

## Объём

Ориентировочно 35-50 файлов: ~12 правок существующих роутов, 8 новых роутов (`lp.*`, 3 региона, 3 sub-sitemap, generator), 4 новых компонента, 2 новых lib (`jsonld`, `route-config`, `seo`), массивные правки 3 data-файлов, 3 файла в `public/`. Результат — 1 большая итерация с пошаговой верификацией.
