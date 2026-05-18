# Канонические URL + редирект `/path/` → `/path`

## Что уже сделано (проверил)

- `buildCanonical()` в `src/lib/seo.ts` уже возвращает URL **без** завершающего слэша — это единый источник правды.
- 22 из 25 публичных роутов уже выставляют `<link rel="canonical">` через `buildCanonical(path)`.
- В `__root.tsx` canonical не задаётся — это правильно (TanStack концатенирует `links` без dedup, см. правило «canonical только на листе»).
- `.htaccess` уже содержит `DirectorySlash Off` — `/services` отдаёт `dist/services/index.html` без 301 на `/services/`.

## Что нужно сделать

### 1. Добавить canonical на 2 страницы, где его нет

- **`src/routes/thank-you.tsx`** — добавить `links: [{ rel: "canonical", href: \`${SITE_URL}/thank-you\` }]`. Страница уже `noindex,nofollow`, но canonical поможет, если кто-то даст на неё ссылку.
- **`src/routes/lp.$citySlug.$serviceSlug.tsx`** — посадочная под рекламу. Здесь два корректных варианта; нужно решение (см. вопрос ниже).

### 2. Редирект `/path/` → `/path` в `.htaccess`

Сейчас:
- `/services` → 200 (отдаёт `dist/services/index.html`).
- `/services/` → тоже 200 (Apache видит директорию + `DirectoryIndex`), **дубль контента**.

Добавить в `public/.htaccess` **до** правил file/dir-exists:

```apache
# Убрать завершающий слэш: /services/ → /services (301)
RewriteCond %{REQUEST_URI} ^.+/$
RewriteRule ^(.+)/$ /$1 [R=301,L]
```

После этого:
- `/services/` → 301 → `/services` → 200.
- `/` остаётся как есть (правило срабатывает только если в URI есть символ перед `/`).
- `/sitemap.xml`, `/robots.txt`, ассеты не затрагиваются (нет завершающего слэша).

### 3. Sitemap

Уже без слэшей (107 URL), `buildCanonical` без слэшей, после редиректа всё совпадёт. Менять не нужно.

### 4. Проверка после деплоя

`curl -I https://tlz-craftsman-hub.lovable.app/services/` → должен быть `301` на `/services`.
`curl -I https://tlz-craftsman-hub.lovable.app/services` → `200`, в HTML `<link rel="canonical" href=".../services">`.

## Вопрос перед реализацией

**`/lp/<город>/<услуга>`** (рекламный лендинг) — добавляю на эти страницы:

1. `noindex, nofollow` + canonical на саму lp-страницу? (стандарт для платных лендингов — не индексировать, но canonical корректный)
2. `noindex, nofollow` без canonical? (минимум, как сейчас)
3. canonical на основную страницу `/cities/<город>/<услуга>` + `noindex, nofollow`? (если контент дублирует основную)

Рекомендую вариант 1 — безопаснее всего.
