## Что делаем

**1. Единый калькулятор на Москве и МО**

Заменяем `LeadForm` (скрин 2) на пошаговый калькулятор в стиле `MobileQuickLead` (скрин 1) только на трёх страницах:
- `/cities/moskva`
- `/cities/moskovskaya-oblast`
- `/regions/moskva-mo`

Чтобы не дублировать код, `MobileQuickLead` рефакторим в переиспользуемый компонент `QuickLead`:
- Принимает пропы `defaultCity?`, `defaultProblem?`, `source?`, `title?`, `subtitle?` — по аналогии с `LeadForm`.
- Логика step-by-step, honeypot, rate-limit, Telegram-отправка, `trackGoal`/`trackCityConversion`, редирект на `/thank-you` — переносится 1-в-1.
- Старый `MobileQuickLead.tsx` становится тонкой обёрткой `<QuickLead source="mobile_quick_lead" />` — чтобы главная страница не сломалась.

На трёх целевых роутах:
- `src/routes/cities.$citySlug.tsx` — если `citySlug === "moskva"` или `"moskovskaya-oblast"`, рендерим `<QuickLead defaultCity={city.slug} source="city_page" />` вместо `LeadForm`. Остальные города остаются на `LeadForm`.
- `src/routes/regions.moskva-mo.tsx` — добавляем секцию с `<QuickLead source="regions_moskva_mo" />` после hero, перед списком карточек городов.

**2. Москва первой в выпадающих списках**

Массив `cities` в `src/data/cities.ts` НЕ трогаем (влияет на sitemap, роуты, порядок карточек на `/cities` и `/regions/*`). Вместо этого в компонентах, где рендерятся `<Option>`/`<SelectItem>` со списком городов, сортируем через локальный хелпер:

```ts
// src/lib/cityOrder.ts (новый)
export function citiesForDropdown(list: City[]): City[] {
  const priority = ["moskva", "moskovskaya-oblast"];
  const head = priority.map((s) => list.find((c) => c.slug === s)).filter(Boolean) as City[];
  const rest = list.filter((c) => !priority.includes(c.slug));
  return [...head, ...rest];
}
```

Применяем в:
- `src/components/site/QuickLead.tsx` (шаг 1 — «Выберите город»)
- `src/components/site/LeadForm.tsx` (селект «Город»)

Другие места (`/cities`, футер, `/regions/*`) — не трогаем: там визуальные карточки по регионам, а не выпадающий список.

## Технические детали

- `QuickLead` кладём в `src/components/site/QuickLead.tsx`. Все хендлеры и импорты копируются из `MobileQuickLead` — никаких изменений в telegram/analytics/conversions.
- `defaultCity` в `QuickLead`: если задан, шаг 1 сразу закрыт и подсвечен галочкой, `openStep` стартует с 2. Пользователь всё равно может раскрыть и поменять город.
- `defaultProblem` работает аналогично для шага 3 (пригодится в будущем на city×service, но сейчас не подключаем).
- Заголовок `<h2>Рассчитать выезд</h2>` в `QuickLead` — принимаем через `title` проп с дефолтом.
- Проверка `citySlug === "moskva" || "moskovskaya-oblast"` инкапсулируется в константу `MOSCOW_SLUGS` внутри роута — легко расширить.

## Файлы

- `src/components/site/QuickLead.tsx` (создать) — вынесенный переиспользуемый калькулятор.
- `src/components/site/MobileQuickLead.tsx` — превратить в тонкую обёртку над `QuickLead`.
- `src/components/site/LeadForm.tsx` — сортировка городов в селекте через `citiesForDropdown`.
- `src/lib/cityOrder.ts` (создать) — хелпер порядка городов.
- `src/routes/cities.$citySlug.tsx` — условный рендер `QuickLead` для Москвы/МО.
- `src/routes/regions.moskva-mo.tsx` — вставить `QuickLead` секцией после hero.

## Что не трогаем

- `src/data/cities.ts` — порядок массива, чтобы не сломать sitemap/prerender/JSON-LD.
- Остальные роуты с `LeadForm` (`/vyezd`, `/garantii`, `/prices`, `/contacts`, `/services/*`, city×service, `/lp/*`).
- `MobileQuickLead` на главной — визуально ничего не поменяется (обёртка над `QuickLead` со старым `source`).
- Логику Telegram/аналитики/rate-limit/honeypot.
