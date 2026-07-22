
## Что меняем

### 1. Контент — 4 страницы city×service (`src/data/serviceInCity.ts`)

Переписываем поля (`h1`, `metaTitle`, `metaDescription`, `introAnswer`, `localOffer`, `whenCalled`, `priceContext`, `caseScenario`, `faq`) со смещением акцента с «дезинфекции/санобработки» на **уборку, вывоз, восстановление помещения**. Услуги и slug'и не трогаем — меняется только копирайт.

- **`moskva` × `posle-pozhara`** — уже про уборку; усилим: вывоз обгоревшего имущества, генеральная уборка после пожара, химчистка мягких поверхностей, мойка стен/потолков, вывоз строительного и погорельного мусора контейнерами, финишная приборка под сдачу оценщику/страховой. Добавим сценарии «уборка квартиры после пожара», «уборка коммерческого помещения после возгорания».
- **`moskovskaya-oblast` × `posle-pozhara`** — то же, но с фокусом на коттеджи, дачи СНТ, ангары и склады МО: вывоз крупногабарита, уборка территории вокруг строения, разборка сгоревших конструкций, мойка фасадов от копоти.
- **`moskva` × `dezinfekciya-posle-smerti`** — переписываем с ключевого «дезинфекция» на **уборку квартиры после смерти / после умершего**: вывоз мебели и вещей с биоследами, генеральная уборка всех поверхностей, химчистка, мойка полов и стен, устранение запаха, финишная уборка «под ключ» для сдачи наследникам/риелтору. Слово «дезинфекция» в тексте остаётся однократно как часть регламента, H1 меняем на «Уборка квартиры после смерти в Москве» (metaTitle/description синхронизируем).
- **`moskovskaya-oblast` × `dezinfekciya-posle-smerti`** — аналогично: уборка квартир, коттеджей, комнат в общежитиях и домов в СНТ; вывоз крупногабарита из частного сектора, уборка придомовой территории при необходимости.

Ограничения:
- `slug` услуг и URL не меняются — SEO-история страниц сохраняется.
- FAQ вопросов сохраняем ≥3 (для JSON-LD FAQPage).
- Плотность топонима и названия услуги оставляем в текущих порогах (audit-geo не должен ругаться).

### 2. Составная цель Метрики (`src/lib/conversions.ts`)

Сейчас `trackCityConversion` работает по 3 городам × 3 услугам (9 целей). Для МСК/МО нужны 4 новые цели, но не 6 (пары `moskva × dezinfekciya-posle-smerti` и т.п. — а не декартово произведение). Меняем механику с «два множества» на **whitelist пар**:

```ts
const TRACKED_PAIRS = new Set<string>([
  // существующие 9
  "simferopol:ochistka-uchastkov", "simferopol:unichtozhenie-tarakanov", "simferopol:posle-pozhara",
  "sevastopol:ochistka-uchastkov", "sevastopol:unichtozhenie-tarakanov", "sevastopol:posle-pozhara",
  "sochi:ochistka-uchastkov",       "sochi:unichtozhenie-tarakanov",       "sochi:posle-pozhara",
  // новые 4
  "moskva:posle-pozhara", "moskva:dezinfekciya-posle-smerti",
  "moskovskaya-oblast:posle-pozhara", "moskovskaya-oblast:dezinfekciya-posle-smerti",
]);
```

`trackCityConversion(city, service, type, params)` шлёт `conversion_{city}_{service}` только если пара в whitelist. Сигнатура и все места вызова (`LeadForm`, `QuickLead`, клики WA/TG/tel в `UrgentCTA`/`HeroCTA`/city×service, `PriceQuiz`) — **не меняются**, отчёт продолжит работать.

### 3. Что НЕ трогаем

- Общая структура сайта, sitemap, canonical, JSON-LD, прайсы, цены (35 000 / 25 000 ₽ и т.д.), калькулятор, шапка, футер.
- Другие 7 услуг МСК/МО.
- Route-файл `cities.$citySlug.$serviceSlug.tsx` — он уже вызывает `trackCityConversion` и рендерит из `serviceInCity`.

### 4. Проверки после сборки

1. `npm run build` + prerender → 4 обновлённые страницы без ошибок.
2. `scripts/audit-geo.ts` → 0 findings (плотность в норме).
3. Открыть `/cities/moskva/posle-pozhara` — H1/тексты про уборку, FAQPage JSON-LD в head.
4. В DevTools после отправки формы на `/cities/moskva/dezinfekciya-posle-smerti` — событие Метрики `conversion_moskva_dezinfekciya-posle-smerti`.
5. Затем список из 4 URL — на переобход в Яндекс.Вебмастер (пришлю в чате после деплоя).

## Что нужно от вас

Подтвердите одно уточнение: **H1 на страницах «трупы» меняем** на «Уборка квартиры после смерти в Москве / в Московской области» (URL и slug остаются `dezinfekciya-posle-smerti`)? Если предпочитаете сохранить прежний H1 «Дезинфекция после смерти…» и переписать только тело — скажите, оставлю как есть.
