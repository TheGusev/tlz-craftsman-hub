## Цель
Убрать implicit any (TS7006) во всех страницах с `.map((it, i) => …)`, навести единообразие типов loader → `Route.useLoaderData`, и закрыть лазейку на уровне конфигурации, чтобы такие ошибки не возвращались.

## 1. Аннотировать loader и useLoaderData

Во всех динамических роутах указать явный возвращаемый тип у `loader` и тот же тип в `Route.useLoaderData()`. Дальше элементы массивов (`includes`, `objects`, `dangers`, `steps`, `equipment`, `priceFactors`, `faq`, `popularServices`, `whenCalled`) типизируются автоматически из `Service`, `City`, `ServiceInCity`.

Файлы:
- `src/routes/services.$serviceSlug.tsx` — loader `: { service: Service }`
- `src/routes/cities.$citySlug.tsx` — loader `: { city: City }`
- `src/routes/cities.$citySlug.$serviceSlug.tsx` — loader `: { city: City; service: Service; sc: ServiceInCity }`

Уже частично сделано в прошлом шаге — пройти и убедиться, что аннотации применены и что useLoaderData типизирован тем же типом.

## 2. Точечные аннотации в `.map`

Там, где TS всё ещё не выводит элемент (например коллбэки на сложных выражениях `services.filter(...).slice(...).map`), добавить явные типы параметров:

- `(it: string, i: number)` — для `includes`, `objects`, `dangers`, `equipment`, `priceFactors`, `whenCalled`
- `(step: Service["steps"][number], i: number)` — для `steps`
- `(f: Service["faq"][number], i: number)` — для `faq`
- `(d: string, i: number)` — для `districts`
- `(s: Service, i: number)` — для связанных услуг
- `(sc: ServiceInCity)` — для городских ссылок
- `(c: Case)` — для кейсов

## 3. Усилить TypeScript

`tsconfig.json` → добавить:
```json
"noImplicitAny": true,
"strictNullChecks": true,
"noImplicitReturns": true
```
(уже включены через `strict: true`, но прописать явно для прозрачности и чтобы CI/IDE падали с понятным сообщением).

Опционально включить `"noImplicitOverride": true` и `"useUnknownInCatchVariables": true`.

## 4. Усилить ESLint

`eslint.config.js` → добавить правила:
```
"@typescript-eslint/no-explicit-any": "warn",
"@typescript-eslint/no-implicit-any-catch": "off", // покрывается tsconfig
"@typescript-eslint/explicit-module-boundary-types": "off"
```
и расширить базу до `tseslint.configs.recommendedTypeChecked` с `parserOptions.project: "./tsconfig.json"` — это включит проверку типов внутри ESLint и поймает implicit any до билда.

## 5. Проверка

После правок прогнать билд (автоматически в Lovable) и убедиться, что список ошибок TS7006 пуст. Если возникнут новые ошибки от `recommendedTypeChecked` — снизить шум через `rules` (например выключить `no-misused-promises` для form handlers).

## Что не меняем
- Содержимое страниц, верстку, дизайн-токены, маршруты.
- Контент в `src/data/*` (типы там уже корректные).