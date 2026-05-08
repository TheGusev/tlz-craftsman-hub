
# План реализации сайта «Санитарные Решения РФ»

Сайт строится строго по архитектурному blueprint из ТЗ: единый бренд, мульти-услуга, мульти-город, чёткое разделение `indexable_core` / `indexable_support` / `noindex_utility`, правило **1 URL = 1 сущность = 1 интент**.

## Дизайн-система

- **Палитра**: Medical Trust — глубокий navy `#0c2340`, рабочий синий `#1a4a6e`, акцент бирюза `#2d8a9e`, фон `#e8f0f8` / белый. Семантические токены в `src/styles.css` (oklch).
- **Акцент срочности**: насыщенный `#c8321e` для CTA «Аварийный выезд» (отдельный токен `--urgent`).
- **Типографика**: Space Grotesk (заголовки) + DM Sans (текст), подключение через Google Fonts в `__root.tsx`.
- **Тон**: профессиональный, медицинско-санитарный, без агрессии; чёткая иерархия, крупные H1, белые карточки на светло-голубом фоне.

## Маршрутная структура (Этап 1)

Все шаблоны через TanStack Start file-based routing в `src/routes/`. Каждый маршрут — отдельный файл с собственным `head()` (title/description/og), уникальным H1 и контентом.

### indexable_core
```
/                                              index.tsx
/services/                                     services.index.tsx
/services/posle-pozhara/
/services/posle-potopa/
/services/udalenie-zapaha-gari/
/services/dezinfekciya-posle-smerti/
/services/udalenie-trupnogo-zapaha/
/services/fumigaciya/
/services/udalenie-pleseni/
/services/sanitarnaya-obrabotka-pomeshcheniy/
/services/ochistka-uchastkov/
/regions/                                      regions.index.tsx
/regions/krym/
/cities/                                       cities.index.tsx
/cities/krasnodar/
/cities/sochi/
/cities/rostov-na-donu/
/cities/simferopol/
/cities/sevastopol/
/cities/yalta/
/cities/evpatoriya/
/cities/kerch/
```

### Приоритетные «услуга в городе» (12 связок по матрице ТЗ §16)
```
/cities/krasnodar/posle-pozhara/
/cities/krasnodar/posle-potopa/
/cities/krasnodar/udalenie-pleseni/
/cities/krasnodar/dezinfekciya-posle-smerti/
/cities/sochi/posle-potopa/
/cities/sochi/udalenie-pleseni/
/cities/sochi/fumigaciya/
/cities/rostov-na-donu/posle-pozhara/
/cities/rostov-na-donu/fumigaciya/
/cities/rostov-na-donu/dezinfekciya-posle-smerti/
/cities/simferopol/dezinfekciya-posle-smerti/
/cities/simferopol/udalenie-pleseni/
```

### indexable_support
```
/cases/        /faq/        /prices/        /contacts/        /about/
```

### noindex_utility (шаблоны под рекламу)
```
/landing/dezinfekciya-24-7/
/landing/obrabotka-posle-potopa/
```
Для них — `<meta name="robots" content="noindex,follow">` через `head()`, исключение из sitemap.

## Шаблоны страниц (4 типа из ТЗ §10)

Каждый шаблон — переиспользуемый компонент в `src/components/templates/`, принимает контент-объект:

1. **HomeTemplate** — Hero + срочный CTA, каталог услуг, география, «Когда обращаются», этапы, кейсы, FAQ, конверсионный блок.
2. **ServiceTemplate** — H1, что входит, для каких объектов, чем опасно промедление, этапы, оборудование, цена, города оказания, кейсы, FAQ, CTA.
3. **CityTemplate** — H1, услуги в городе, популярные направления, районы выезда, сроки, локальные кейсы, FAQ, CTA.
4. **ServiceInCityTemplate** — H1 «[услуга] в [городе]», локальный сценарий, когда вызывают, этапы, ценообразование, районы, кейсы, FAQ, кросс-ссылки на родительскую услугу + город, CTA.

## Контент-модель

Централизованный route registry в `src/data/`:
- `services.ts` — массив 8 услуг (slug, name, h1, intro, входит, объекты, этапы, оборудование, FAQ, цена-факторы).
- `cities.ts` — 8 городов (slug, name, регион, районы, сроки выезда, локальный контекст).
- `serviceInCity.ts` — 12 связок с уникальным локальным оффером, локальным FAQ, кейсом-сценарием.
- `cases.ts` — 10–15 кейсов (задача, объект, город, проблема, работы, срок, результат, ссылки на услугу/город).
- `faq.ts` — общая база + по-услугам и по-городам.

Контент пишется осмысленно на русском, без копипасты — каждая `city/service` получает свой H1, оффер, локальное описание, FAQ.

## Общие компоненты

- `Header` — верхнее меню (Услуги, Города, Кейсы, FAQ, Цены, О компании, Контакты) + выпадающие меню с под-пунктами по ТЗ §9.
- `Footer` — карта сайта по кластерам + контакты + юр. инфо.
- `UrgentCTA` — sticky-кнопка «Срочный выезд 24/7» (звонок + WhatsApp).
- `LeadForm` — единая форма по ТЗ §17 (имя, телефон, город, тип объекта, проблема, срочность, комментарий/фото).
- `Breadcrumbs` — хлебные крошки на всех вложенных страницах.
- `RelatedLinks` — блок внутренней перелинковки по hub-модели §12.

## SEO и техника

- `head()` на каждом маршруте: уникальные `title`, `description`, `og:title`, `og:description`, canonical (TanStack Start head meta).
- `schema.org` JSON-LD: `LocalBusiness` на главной/городах, `Service` на услугах, `FAQPage` где есть FAQ, `BreadcrumbList` везде.
- `robots`: noindex для `/landing/*`.
- `sitemap.xml` через server route `src/routes/api/sitemap[.]xml.ts` — генерится из route registry, исключает noindex.
- `robots.txt` в `public/`.
- Семантический HTML, один H1 на страницу, alt на изображениях.

## Технические детали

- TanStack Start v1, file-based routing — никаких BrowserRouter.
- Tailwind v4 + дизайн-токены в `src/styles.css` (oklch).
- shadcn/ui компоненты (Button, Card, Accordion для FAQ, Dialog для формы, Sheet для мобильного меню, Form).
- Без бэкенда на этом этапе — форма показывает success-состояние; интеграцию (Lovable Cloud / Telegram / email) добавим следующим шагом по запросу.
- Аналитика (Метрика, GA4) — слоты в `__root.tsx` под будущие ID.

## Что вне MVP (Этапы 2–3 ТЗ)

Не реализуем сейчас: блог, дополнительные city/service связки сверх 12, личный кабинет, квиз, калькулятор, thank-you. Структура расширяемая — добавляются новыми файлами в `src/routes/` без рефакторинга.

## Порядок работы

1. Дизайн-токены + типографика + базовые UI-примитивы.
2. Header / Footer / UrgentCTA / LeadForm / Breadcrumbs.
3. Контент-реестр (services.ts, cities.ts, serviceInCity.ts, cases.ts, faq.ts).
4. 4 шаблона страниц.
5. Все ~30 маршрутов с уникальным `head()`.
6. Hub-страницы (`/services/`, `/cities/`, `/regions/krym/`).
7. sitemap.xml + robots.txt + JSON-LD.
8. Финальная вычитка перелинковки и canonical.
