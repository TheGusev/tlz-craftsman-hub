## React error #29 — расшифровка

С https://react.dev/errors/29:

> **Accumulated items must be not be null or undefined.**

Эта ошибка приходит из аккумулятора React (head / children / Children API). На наших падающих маршрутах (`/faq`, `/prices`, `/cases`, `/regions/krym`) самый вероятный кандидат — `HeadContent`: TanStack Router склеивает `meta`/`scripts` всех matched routes (root + leaf), и если хоть одна запись в `scripts[].children` или `meta[].content` имеет значение `undefined`, аккумулятор бросает #29.

Что именно сейчас выглядит подозрительно:
- `src/routes/faq.tsx` строит `buildFAQSchema(allFaq)` — функция отсутствует в показанной части `src/lib/jsonld.ts`; нужно проверить, не возвращает ли она `undefined`/массив с `undefined` для пустых `q`/`a` (в `generalFaq` или `services[].faq`).
- `buildGraphHead([...])` на этих 4 страницах вызывается с массивом нод; если один из `build*Schema(...)` возвращает `undefined` (например, при пустом `path`), JSON-граф ломается.
- На `/prices` и `/cases` подключаются тяжёлые компоненты (`LeadForm`, `Lightbox`) — но Lightbox рендерится только при `lightbox !== null`, а LeadForm SSR-безопасен (window guarded). Скорее всего, дело не в них, а в `scripts[].children` head.

## План

### Шаг 1 (приоритет — делаем первым). Полный стек в логах CI
В `scripts/prerender.ts` заменить
```ts
page.on("pageerror", (e) => console.error(`  [pageerror ${route}]`, e.message));
```
на
```ts
page.on("pageerror", (e) => console.error(`  [pageerror ${route}]`, e.stack ?? e.message));
```
Это даст минифицированный, но всё-таки путь по бандлу — уже подскажет компонент.

### Шаг 2. Сделать стек читаемым на проде
В `vite.config.ts` для production-сборки включить сохранение имён функций. В TanStack Start template минификатор — esbuild по умолчанию (не terser). Правка:

```ts
// vite.config.ts
export default defineConfig({
  // ...
  build: {
    minify: "esbuild",
    sourcemap: true,           // карты загрузятся puppeteer'ом, стек развернётся
  },
  esbuild: {
    keepNames: true,            // имена компонентов сохраняются в проде
  },
});
```

Если в шаблоне уже есть `build.minify: "terser"` — добавить `terserOptions: { keep_fnames: true, keep_classnames: true }`. `sourcemap: true` критичен — Chromium автоматически разворачивает стек по map-файлам.

### Шаг 3. Записать в `scripts/prerender.ts` комментарий-расшифровку
В шапку файла:
```ts
/**
 * React minified error #29: "Accumulated items must be not be null or undefined."
 * Источник: https://react.dev/errors/29
 * Чаще всего ловится в head-аккумуляторе TanStack Router, когда
 * scripts[].children или meta[].content равен undefined.
 */
```

### Шаг 4. После прогона CI с шагами 1–3 — точечный фикс
Логи покажут конкретный модуль. Наиболее вероятные правки:
- В `src/lib/jsonld.ts`: проверить `buildFAQSchema` (его нет в показанной части — открыть и убедиться, что он не возвращает `undefined` при пустом списке и не кладёт `undefined` в `mainEntity[].acceptedAnswer.text`).
- На всех роутах с `head() → scripts`: убедиться, что `buildGraphHead([...])` всегда возвращает string. Если внутри один из `build*Schema` вернул `undefined`, отфильтровать.
- Защитный фильтр в `buildGraphHead`: `nodes.filter(Boolean)` перед сериализацией.

### Шаг 5. Чистый прогон
После фикса CI-лог должен не содержать `[pageerror]` ни на одном из 4 маршрутов, prerender отрабатывает 100% routes.

## Файлы
- `scripts/prerender.ts` — комментарий + `e.stack`.
- `vite.config.ts` — `esbuild.keepNames: true` + `build.sourcemap: true`.
- (после Шага 4) `src/lib/jsonld.ts` или конкретный route — точечный фикс.

## Что НЕ делаем
- Не оборачиваем страницы в дополнительный `<main id="main">` — он уже глобально в `__root.tsx`.
- Не отключаем минификацию целиком (только `keepNames` + sourcemap).
- Не правим вслепую — сначала Шаг 1+2 → читаем CI → потом точечный фикс.
