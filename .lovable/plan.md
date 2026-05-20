## План: GitHub Actions deploy на Beget

### Что создаём
Файл `.github/workflows/deploy.yml` — автодеплой при push в `main`.

### Ключевые улучшения vs исходник
1. **PRERENDER=1** — используем `npm run build:prod`, который генерирует sitemap, prerender HTML и проверяет результат. Без этого канонические URL и sitemap, которые мы настраивали, не материализуются в статику.
2. **Кэш npm** оставляем (`actions/setup-node` с `cache: 'npm'`).
3. **Puppeteer для prerender** — `puppeteer-core` уже в devDependencies; нужен Chrome. Добавляем `npx puppeteer browsers install chrome` перед сборкой (или ставим системный chromium через apt).
4. **FTP exclude** — исключаем `**/.git*`, `**/.git*/**`, `**/node_modules/**` (на всякий случай, хотя в dist их нет).
5. **dangerous-clean-slate: false** (по умолчанию) — не сносить файлы на сервере, использовать инкрементальную синхронизацию.
6. **Concurrency** — оставляем как было.
7. **Проверка секретов** — workflow рассчитывает на `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, `FTP_PATH` в GitHub Secrets репозитория.

### Финальный workflow

```yaml
name: Build & Deploy to Beget

on:
  push:
    branches: ["main"]
  workflow_dispatch:

concurrency:
  group: deploy-prod
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Chrome for prerender
        run: npx puppeteer browsers install chrome

      - name: Build (with prerender + sitemap)
        run: npm run build:prod
        env:
          PRERENDER: '1'

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: ${{ secrets.FTP_PATH }}/
          exclude: |
            **/.git*
            **/.git*/**
            **/node_modules/**
```

### Что нужно от пользователя
Добавить в **GitHub → Settings → Secrets and variables → Actions**:
- `FTP_HOST` — например `ftp.beget.com`
- `FTP_USER` — FTP-логин Beget
- `FTP_PASSWORD` — пароль
- `FTP_PATH` — путь на сервере, например `/site/public_html` (со слэшем в конце не обязательно — добавим в workflow)

### Открытый вопрос
Если prerender в CI окажется тяжёлым (puppeteer ~5 мин), можно откатиться на `PRERENDER=0` + положиться только на SPA-режим. Но тогда теряется SEO-эффект всей предыдущей работы. Рекомендую PRERENDER=1.
