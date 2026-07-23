## Проблема

GitHub Actions workflow `Build & Deploy to Beget` падает на шаге `npm run build:prod`. Из-за этого последние изменения (переписанные страницы МСК/МО «пожары» и «трупы», составные цели) не доехали до продакшена — на скриншоте коммит с красным ✕.

Локальная сборка воспроизводит ошибку:

```
[verify-jsonld] ОШИБКИ (1):
  - /privacy: <meta name="robots"> содержит noindex
```

Скрипт `scripts/generate-seo.ts` (шаг `--verify-jsonld`) считает любой `noindex` фатальной ошибкой и делает `process.exit(1)`. Но на `/privacy` стоит `noindex, follow` намеренно — политику конфиденциальности индексировать не нужно. Проверка слишком строгая.

## Что сделать

1. **`scripts/generate-seo.ts`** — в функции `verifyJsonLd()` добавить whitelist путей, для которых `noindex` допустим и ожидаем:
   - `/privacy`
   - `/soglasie`
   - `/thank-you`
   
   Для этих путей проверка `hasNoindex` не должна давать ошибку. Для остальных 131 маршрута строгая проверка сохраняется. Заодно пропустить для них проверки JSON-LD-типов, характерных для контентных страниц (они и так не попадают под `isCityService`/`isBlogPost`).

2. **Перепрогнать `npm run build:prod` локально** — убедиться, что verify-jsonld проходит с кодом 0 и все 134 маршрута OK.

3. После пуша фикса GitHub Actions задеплоит на Beget уже с накопленными изменениями по МСК/МО.

## Технические детали

Точка правки — `scripts/generate-seo.ts`, строки 170–173:

```ts
const NOINDEX_ALLOWED = new Set(["/privacy", "/soglasie", "/thank-you"]);
if (!NOINDEX_ALLOWED.has(r.path) && hasNoindex(html)) {
  errors.push(`${r.path}: <meta name="robots"> содержит noindex`);
}
```

Файлы `src/routes/privacy.tsx`, `src/routes/soglasie.tsx`, `src/routes/thank-you.tsx` не меняем — их `noindex` корректен по SEO-практикам (страницы согласия/благодарности не должны попадать в индекс).

## Итог

После мержа этого фикса CI зелёный → FTP-деплой отрабатывает → изменения МСК/МО и составные цели уходят на прод.
