## Цель

Превратить сайт в эталонную аварийно-санитарную службу ЮФО+Крым: единая сильная структура, реальная экспертная семантика, конверсионные посадочные, полная готовность к Яндекс.Директу и индексации в Яндекс.Вебмастере.

---

## Что уже есть (короткий аудит)

- Маршруты: `/`, `/services`, `/services/$slug` (19 услуг), `/cities`, `/cities/$slug` (17 городов), `/cities/$city/$service` (40 SIC), `/regions`, `/regions/krym`, `/blog`, `/cases`, `/faq`, `/about`, `/contacts`, `/prices`, `/privacy`, `/lp/$city/$service`, `/sitemap.xml`.
- SEO-инфраструктура: `lib/site.ts`, `lib/seo.ts`, `lib/jsonld.ts` (`@graph`), `lib/route-config.ts`, IntroAnswer, HeroCTA, FAQSection, MobileQuickLead, PageHero, LeadForm.
- AI/SEO мета: `robots.txt` с правилами для GPTBot/ClaudeBot/YandexGPT, `llms.txt`.

**Слабые места**, которые блокируют «эталон»:

1. Нет Яндекс.Метрики, Webmaster-верификации, разметки счётчиков, целей, UTM-нормализации.
2. 25 SIC сгенерированы шаблоном — нет уникального локального текста (Яндекс не любит шаблонные страницы).
3. 8 новых городов и 10 новых услуг имеют короткие `intro` без местных триггеров, кейсов, цен.
4. Нет коммерческих обязательных страниц для Директа: «Доставка/выезд», «Оплата», «Гарантии», «Отзывы», «Лицензии», «Договор-оферта», «Согласие на ОПД», «Реквизиты».
5. `/prices` минимальная — для рекламы нужна полноценная таблица с ценами от.
6. `LeadForm` не привязана к целям Метрики (нет `ym('reachGoal','lead')`), нет thank-you, нет hidden UTM-полей.
7. `MobileQuickLead`/`UrgentCTA` дублируются — нужно унифицировать.
8. `og:image` в root жёстко привязан к одному URL — для каждого кластера услуг нужна своя картинка.
9. Кейсы (`/cases`) — без фото «до/после», хронометража, гарантий.
10. Семантика: где-то `<details>` вместо ARIA-аккордеона, где-то нет `<address>`, `microdata`/`itemscope` не используются.
11. Footer без NAP-блока (Name/Address/Phone) — критично для локального SEO Яндекса.
12. Нет `/api/leads` server-route — заявка не сохраняется, теряется.

---

## План работ — 7 этапов

### Этап A. Яндекс-стек: счётчик, верификация, цели, UTM (**основа рекламы**)

A1. `Yandex.Metrika` через `<Scripts />` в `__root.tsx`, ID — секрет `VITE_YANDEX_METRIKA_ID`. Webvisor + clickmap + accurateTrackBounce + trackHash. NoScript-пиксель — в `<body>`.

A2. Цели: `lead_form_submit`, `lead_phone_click`, `lead_whatsapp_click`, `quick_lead_open`, `lp_view`, `service_page_view`, `city_page_view`, `sic_page_view`, `price_view_30s`. Цели вызываются из `LeadForm`, `HeroCTA`, `MobileQuickLead`, `lp.*`.

A3. Верификация Яндекс.Вебмастера через `<meta name="yandex-verification">` (секрет `VITE_YANDEX_VERIFICATION`). Дополнительно — Google site-verification. Sitemap уже отдаётся на `/sitemap.xml` — добавить `Sitemap: https://...` в `robots.txt`.

A4. UTM-слой: общий хук `useUtmCapture()` сохраняет `utm_*`, `yclid`, `_ym_uid`, `gclid`, `roistat` в `sessionStorage` + скрытые поля в `LeadForm`. Передача в `dataLayer` и в Метрику параметрами визита.

A5. `/api/leads` — server-route POST: валидация (Zod), сохранение (для начала — в Lovable Cloud если включён, иначе — отправка в e-mail через Lovable Email), ответ JSON. `LeadForm` фетчит туда.

A6. Thank-you страница `/thank-you` (noindex) с подтверждением и счётчиком цели `lead_confirmed`.

### Этап B. Коммерческие страницы (обязательны для модерации Директа)

B1. `/garantii` — гарантии 6/12 мес, условия, повторный выезд за наш счёт, акт.
B2. `/oplata` — наличные/карта/безнал/счёт, чек ОФД.
B3. `/dostavka` (выезд бригады) — зоны выезда, время, стоимость доезда.
B4. `/otzyvy` — типы отзывов (Яндекс.Карты, 2ГИС, видеоотзывы, текст), микроразметка `Review` + агрегатный `AggregateRating` на главной.
B5. `/licenzii` — сканы/PDF свидетельств, СанПиН-допусков, СРО, страховка ответственности.
B6. `/kontrakt-oferta` — публичная оферта.
B7. `/soglasie` — согласие на обработку персональных данных (ФЗ-152) + чекбокс в форме.
B8. `/rekvizity` — ИНН/ОГРН/р/с — обязательно для b2b и Директа.
B9. Footer переработать: NAP-блок (юр.название, адрес, телефон, email, часы), ИНН, ссылки на оферту/согласие/реквизиты, schema.org `Organization` с `address`, `geo`, `contactPoint`.

### Этап C. Контент глубины: услуги, города, SIC

C1. **10 новых услуг** (`dezinfekciya-pomeshcheniy`, `dezinsekciya`, `deratizaciya`, `unichtozhenie-tarakanov/klopov/blokh/muravev`, `ozonirovanie-pomescheniy`, `obrabotka-uchastkov-ot-kleschey`, `obrabotka-ot-grizunov-na-uchastke`) — расширить до уровня старых: 6+ пунктов `includes`, 4+ `objects`, 3+ `dangers`, 5+ `steps`, 4+ `equipment`, 5+ `priceFactors`, 5+ FAQ, мини-кейс, прайс-таблица.
C2. **8 новых городов** (Ставрополь, Анапа, Геленджик, Новороссийск, Феодосия, Алушта, Судак, Саки) — локальный контекст: реальные ЖК/районы, частые сценарии, время выезда по часам, местные триггеры (сезонность, климат).
C3. **40 SIC** (15 ручных + 25 авто-сгенерированных) — для авто-сгенерированных написать настоящий уникальный текст: `localOffer` 200-400 слов, `whenCalled` 4 локальных кейса, `priceContext` с конкретными ценами от, `caseScenario` с ЖК и параметрами, 5 FAQ с городскими нюансами, `popularDistricts`, `localTriggers`, `localPricing.from/to`. Помечать `isReady` только когда контент готов.
C4. Добавить раздел «Связанные услуги/города» внизу каждой страницы (внутренняя перелинковка).
C5. Хлебные крошки везде с микроразметкой `BreadcrumbList`.

### Этап D. Конверсионные посадочные `/lp/*` под Директ

D1. Расширить шаблон LP: квиз «3 вопроса → расчёт цены», калькулятор стоимости (площадь × тип), счётчик «осталось N выездов сегодня», блок «вызов за 60 секунд», sticky CTA.
D2. A/B-готовность: query-param `v` → выбор варианта hero/CTA, метка в Метрике.
D3. UTM-подмена контента: `?utm_term=tarakany` → персональный заголовок «Уничтожим тараканов в {город} за 60 минут».
D4. Каждая LP отдельно для топ-кампаний: `/lp/krasnodar/dezinsekciya`, `/lp/sochi/udalenie-pleseni`, `/lp/rostov-na-donu/deratizaciya`, и т.д.
D5. Все LP `noindex,nofollow`, не в sitemap, в `robots.txt` `Disallow: /lp/` (уже есть).
D6. На LP — встроенный коллбэк-форма, WhatsApp/Telegram кнопки с pre-filled текстом.

### Этап E. Семантика и доступность (HTML-уровень)

E1. По одному `<h1>` на маршрут, остальные — `<h2>/<h3>`. Проверить весь сайт скриптом.
E2. Все `<button>`/`<a>` с aria-label где иконка-only. FAQ — `<button aria-expanded>` вместо `<details>` для лучшей семантики Яндекса.
E3. `<address>` в Footer и Contacts. `<time datetime>` в блоге и кейсах. `<picture>` с WebP/AVIF + lazy.
E4. Микроразметка дополнительно: `Service`, `Offer.priceSpecification`, `OpeningHoursSpecification`, `AggregateRating`, `Review`, `HowTo` для `steps`.
E5. Skip-link для клавиатуры, контраст AA, focus-ring везде.
E6. `lang="ru"`, `dir="ltr"`, корректные `og:locale=ru_RU`.

### Этап F. Производительность и Core Web Vitals (Яндекс ранжирует по ним)

F1. Картинки: все hero/cover в WebP, преген-плейсхолдер blur, явные `width/height`, `loading="lazy"`, `decoding="async"`.
F2. Шрифты: подгрузить только нужные веса, `font-display: swap`, preload основного.
F3. JS: убрать неиспользуемые компоненты (UrgentCTA дубль MobileQuickLead — оставить один), code-split тяжёлых маршрутов.
F4. Critical CSS уже в Tailwind — проверить `LCP < 2.5s`, `INP < 200ms`, `CLS < 0.1` через PageSpeed.
F5. Prerender статики уже включён — добавить `lastmod` в sitemap из git/файла.

### Этап G. Финальная QA-проверка (чек-лист 🍁)

G1. **Технический**: `bun run build` без ошибок; `tsc --noEmit` чисто; `/sitemap.xml` валиден; `robots.txt` корректен; `/llms.txt` отдаётся; верификации Яндекс/Google проходят; Метрика принимает события (тест в Webvisor).

G2. **SEO/семантика**: каждая публичная страница имеет уникальные `<title>`, `description`, canonical, og:title, og:description, og:image; один h1; FAQ-разметка в `@graph`; BreadcrumbList на всех глубоких; нет дубликатов canonical.

G3. **Коммерция/Директ**: все обязательные страницы (Гарантии, Оплата, Выезд, Реквизиты, Лицензии, Оферта, Согласие, Отзывы) есть и заполнены; в Footer NAP; формы с галкой согласия; LP `noindex` и не в sitemap; UTM пробрасываются и сохраняются в заявке; цели в Метрике стреляют.

G4. **Контент**: 19 услуг с полным набором полей; 17 городов с местным контекстом; 40 SIC — каждая `isReady=true` имеет уникальные 200+ слов; кейсы с фото; отзывы; блог с минимум 5 SEO-статьями.

G5. **UX/производительность**: PageSpeed Mobile ≥ 85, Desktop ≥ 95; LCP/INP/CLS в зелёной зоне; кнопки CTA в 1 экране; sticky-CTA на мобиле; формы валидируются; thank-you работает.

G6. **Визуал**: ручной обход `/`, `/services`, 3 услуги, `/cities`, 3 города, 3 SIC, `/regions`, `/regions/krym`, `/lp/krasnodar/dezinsekciya`, `/blog`, `/cases`, `/faq`, `/about`, `/contacts`, `/prices`, юр.страниц на 393×844 и 1280×900.

G7. **Аналитика**: события `lead_*` приходят в Метрику; `dataLayer` пишется; UTM сохраняются; в Webmaster нет критических ошибок; sitemap проиндексирован.

---

## Технические детали

- Метрика и Вебмастер — через секреты `VITE_YANDEX_METRIKA_ID`, `VITE_YANDEX_VERIFICATION`. Подключение в `__root.tsx` через `scripts: [{ children: '...' }]` и `meta` соответственно.
- `/api/leads` — `createFileRoute('/api/leads')` с `server.handlers.POST`, Zod-валидация (имя 1-100, телефон, город, услуга, согласие=true), отправка через Lovable Email (если Cloud включён) и/или сохранение в таблицу `leads`.
- Цели вызываются обёрткой `trackGoal(name, params?)` в `src/lib/analytics.ts` — единая точка для Метрики и `dataLayer`.
- Для `Review`/`AggregateRating` — данные в `src/data/reviews.ts`, агрегат — на `/`, `/cities/$slug`, `/services/$slug`.
- `BreadcrumbList` уже в `lib/jsonld.ts` — добавить визуальные крошки в `PageHero`.
- Юридические страницы — обычные routes с длинным MDX-подобным текстом в JSX; для оферты и согласия — версионирование (`v1`, дата вступления).
- Доп. кампании Директа: 5 топ-городов × 5 топ-услуг = 25 LP (используем существующий `/lp/$city/$service` шаблон с расширениями D1-D3).

---

## Что НЕ входит

- Подключение к реальной CRM (только заглушка `/api/leads` + email).
- Реальная съёмка кейсов «до/после» — добавим placeholder’ы и систему загрузки.
- Полноценный авторский блог (только структура + 5 SEO-статей по топ-запросам).
- Подключение Лoвable Cloud (если ещё не включён, спросим перед B5/A5).

---

## Порядок выполнения и проверки

A → B → C → D → E → F → G. После каждого этапа — `bun run build`, `tsc --noEmit`, ручной обход 3-5 ключевых маршрутов, отметка в чек-листе. Этап G — финальная сводка с прогоном всех пунктов и публикацией.