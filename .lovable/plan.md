## Что фиксим (по чек-листу GEO-отчёта)

### 1. Техническая база (27 → 30): добавить HSTS

В `public/.htaccess` в блок `mod_headers.c` добавить:
```
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

### 2. Производительность (13 → 20): убрать блокирующий CSS шрифтов + lazy/decoding

- В `index.html` заменить `<link rel="stylesheet" href="...fonts...">` на неблокирующую загрузку:
  ```html
  <link rel="preload" as="style" href="...&display=swap" />
  <link rel="stylesheet" href="...&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="...&display=swap"/></noscript>
  ```
  (`display=swap` уже стоит — это закрывает пункт `font-display`).
- Пробежаться по `<img>` без `loading`/`decoding` (главным образом карточки кейсов/услуг, hero-картинки кроме первой) и проставить `loading="lazy"` + `decoding="async"`. Hero на главной уже корректный.

### 3. Контент-минимум (22 → 25): нормализовать длины title/description

Проверить и поправить страницы, где `title` вне 30–70 или `description` вне 120–160:
- `src/routes/thank-you.tsx` — description короткий (~70), расширить до 120–160.
- `src/routes/privacy.tsx`, `oferta.tsx`, `soglasie.tsx`, `rekvizity.tsx`, `oplata.tsx`, `garantii.tsx`, `licenzii.tsx`, `vyezd.tsx`, `otzyvy.tsx`, `about.tsx`, `regions.krym.tsx` — пройтись по `TITLE`/`DESC` константам, привести к диапазону.
- Главная (`index.tsx`) — title 96 символов, обрезать до ≤70: «Санитарные Решения РФ — служба 24/7 по ЮФО и Крыму».
- В `__root.tsx` оставить дефолт, но убедиться, что он не перетирает leaf-страницы.

Менять только текстовые значения meta — структура и компоненты не трогаются.

### 4. Проверка

После правок: визуально не меняется ничего. Сборка должна пройти. Schema.org (15/15) и Индексация (10/10) уже зелёные — не трогаем.

### Файлы

- `public/.htaccess` — добавить HSTS-заголовки
- `index.html` — неблокирующая загрузка шрифтов
- ~10 route-файлов в `src/routes/` — подровнять длины title/description
- Возможные `<img>` в `src/routes/cities.$citySlug.tsx`, `services.$serviceSlug.tsx`, `cases.tsx`, `blog.tsx` — добавить `loading="lazy"` где нет
