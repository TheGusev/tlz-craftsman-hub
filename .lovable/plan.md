## Диагноз

`TimeoutError: Timed out after 30000 ms while waiting for the WS endpoint URL to appear` — Chromium стартует на GitHub Actions runner-е, но никогда не открывает DevTools WebSocket. Причина — нехватка флагов для headless-запуска в контейнере без `/dev/shm` и без zygote-процесса. Один `puppeteer.launch` в файле (строка 196), второго нет.

Дополнительно: на actions-runner-е Chrome обычно ставится через `npx puppeteer browsers install chrome` и кладётся в `~/.cache/puppeteer/...`, а не в `/usr/bin/chromium`. Текущий `findChromium()` не ищет в puppeteer-cache → даже если флаги починим, executablePath может указать в пустоту. Это нужно править заодно — иначе следующий прогон упрётся в «Не найден Chromium».

## План

Правка одного файла: `scripts/prerender.ts`.

### 1. Флаги запуска Chromium (строка 196)

```ts
const browser = await puppeteer.launch({
  executablePath: chromium,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
  ],
  timeout: 60_000,
});
```

Ключевое: `--disable-dev-shm-usage` (на runner-е `/dev/shm` маленький, без флага Chromium падает молча) + `--no-zygote` + `--single-process` (исключает race при создании WS-эндпоинта в контейнере) + `timeout: 60_000` (даём больше времени на старт).

### 2. Поиск Chrome в puppeteer-cache

В `findChromium()` добавить поиск по `~/.cache/puppeteer/chrome/*/chrome-linux64/chrome` перед текущим списком кандидатов:

```ts
function findInPuppeteerCache(): string | undefined {
  const base = join(process.env.HOME ?? "", ".cache/puppeteer/chrome");
  if (!existsSync(base)) return undefined;
  for (const rev of readdirSync(base)) {
    const candidate = join(base, rev, "chrome-linux64/chrome");
    if (existsSync(candidate)) return candidate;
    const mac = join(base, rev, "chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
    if (existsSync(mac)) return mac;
  }
  return undefined;
}
```

В `findChromium()` после проверки env-переменной — вызвать `findInPuppeteerCache()`, и только если ничего не нашлось — fallback на `/usr/bin/chromium` и т.д.

### 3. НЕ трогаем

- `puppeteer.launch` один на весь скрипт — повторного вызова нет, `browser.newPage()` уже переиспользуется в `renderQueue`/`render404`. Подтверждено просмотром файла.
- Xvfb в проекте не используется (`.github/workflows/deploy.yml` его не запускает).
- `headless: true` не меняем на `"new"` — в `puppeteer-core` 22+ `true` уже = новый headless, а строка `"new"` бросает type-error.

## Файлы

- `scripts/prerender.ts` — 2 точечные правки (`findInPuppeteerCache` + расширенный список args + `timeout: 60_000`).

## После правки

Если на CI ещё нет шага установки Chrome для puppeteer — workflow должен содержать `npx puppeteer browsers install chrome` до запуска prerender. Если шага нет, перед коммитом проверю `.github/workflows/deploy.yml` и добавлю; если есть — оставлю.
