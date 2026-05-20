## Контекст и уточнение диагноза

В проекте `<main id="main">` **уже отрендерен глобально** в `src/routes/__root.tsx` (строка 163) — он оборачивает `<Outlet />` и присутствует на КАЖДОМ маршруте сайта. Поэтому исходная гипотеза «на /about и /prices нет `<main id="main">`» неверна, и оборачивать содержимое страниц в ещё один `<main id="main">` нельзя: получим:
- дубликат `id="main"` (невалидный HTML, нарушение a11y),
- вложенный `<main>` внутри `<main>` (тоже запрещено стандартом).

Если selector `#main` действительно не находится за 30s на `/about` и `/prices`, это значит, что вместо `RootComponent` отрисовался **`errorComponent`** (у него нет `<main id="main">`) — то есть страница падает в рантайме при prerender. Остальные роуты успешно проходят.

## План

### 1. Воспроизвести и поймать настоящую ошибку
Добавить в `scripts/prerender.ts` сбор `console`/`pageerror` событий с проблемных страниц, чтобы видеть стек, а не только TimeoutError. Сейчас мы слепы: Puppeteer лишь сообщает, что селектор не появился.

Конкретно — в `renderRoute()` перед `page.goto`:
```ts
page.on("pageerror", (e) => console.error(`  [pageerror ${route}]`, e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.error(`  [console.error ${route}]`, m.text());
});
```

### 2. Сделать ожидание устойчивым
Заменить жёсткое `waitForSelector("#main", { timeout: 30000 })` на двойное условие, чтобы prerender не висел 30s даже когда отрисовался errorComponent:

```ts
await Promise.race([
  page.waitForSelector("#main", { timeout: TIMEOUT }),
  page.waitForSelector("[data-error-boundary]", { timeout: TIMEOUT }),
]);
```

И пометить `ErrorComponent` в `__root.tsx` атрибутом `data-error-boundary` у корневого `<div>`, чтобы prerender мог явно отличить «страница упала» от «селектор не дождались» и завершить шаг с понятным сообщением.

### 3. Расследовать, что именно падает на /about и /prices
После шага 1 в логах CI появится реальный стек. Наиболее вероятные кандидаты (проверить в первую очередь):

- `src/routes/prices.tsx` использует `<LeadForm />` — он может дёргать `fetch`/Telegram при mount или использовать `window`/`localStorage` без guard.
- `src/components/site/LeadForm.tsx`, `src/lib/telegram.ts`, `src/hooks/useAnalytics.ts`, `src/lib/analytics.ts` — кандидаты на необработанное обращение к `window`/`navigator`/env-переменной, которое не падает на других страницах, но падает в комбинации с конкретной разметкой `/about` и `/prices`.
- Возможна ошибка в JSON-LD-схеме (`buildWebPageSchema`/`buildBreadcrumbSchema`) для этих двух путей.

После того как реальная причина найдена — точечно её починить (guard `typeof window !== "undefined"`, дефолтное значение, и т.п.). Без шага 1 угадывать вслепую не имеет смысла.

### 4. Стандарт `<main id="main">` на сайте
Подтвердить, что `<main id="main">` остаётся **только** в `src/routes/__root.tsx`. Пройти по всем файлам `src/routes/*.tsx` и убедиться, что ни один из них не содержит собственного `<main ...>` (сейчас `rg 'id="main"' src/` показывает только `__root.tsx` — это уже единый стандарт, дополнительных правок не требуется).

### 5. Проверка
После правок CI-сборка с `PRERENDER=1 npm run build:prod` должна проходить все маршруты. Локально в Lovable preview prerender не запускается (нет Chromium-шага в dev), так что верификация — через следующий запуск GitHub Actions.

## Что НЕ делать
- ❌ Не оборачивать содержимое `about.tsx`/`prices.tsx` (или любых других страниц) в `<main id="main">` — это сломает HTML.
- ❌ Не убирать `<main id="main">` из `__root.tsx` ради переноса в страницы — это потеряет skip-link и единообразие.

## Технические детали (правки в файлах)
- `scripts/prerender.ts` — добавить page.on("pageerror"/"console"), заменить waitForSelector на Promise.race с двумя селекторами.
- `src/routes/__root.tsx` — добавить `data-error-boundary` на корневой `<div>` внутри `ErrorComponent`.
- Файл с реальным багом — определится после шага 1 (вероятно `LeadForm.tsx` или `useAnalytics.ts`).
