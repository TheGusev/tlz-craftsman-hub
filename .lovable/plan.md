## Что нашёл — реальный ответ сервера vs ожидания

Скачал все 134 URL из `sitemap.xml`, распарсил `<head>`. Основные проблемы — на уровне `<link rel="canonical">`, а не robots.

### 1. Критично: 115 страниц имеют по 2 `<link rel="canonical">`

Первый указывает на **родительский листинг**, второй — на саму страницу. Яндекс/Google читают первый → все дочерние URL «схлопываются» в родительский. Это и есть настоящая причина жалоб на индексацию.

Затронуто (примеры из живого сайта):

| URL | 1-й canonical (что видит Яндекс) | 2-й canonical (правильный) |
|---|---|---|
| `/blog/chto-delat-posle-pozhara-v-kvartire` | `/blog` | `/blog/chto-delat-posle-pozhara-v-kvartire` |
| `/cases/pozhar-zhk-samolet-krasnodar` | `/cases` | `/cases/pozhar-zhk-samolet-krasnodar` |
| `/cities/krasnodar` | `/cities` | `/cities/krasnodar` |
| `/cities/krasnodar/posle-pozhara` | `/cities` | `/cities/krasnodar/posle-pozhara` |

Всего: 4 блоговых + 12 кейсов + 16 городов + 82 город×услуга + `/regions/*` = **115 страниц**.

**Причина.** В TanStack file-based routing при рендере `/cases/foo` активны сразу оба матча (`cases.tsx` + `cases.$slug.tsx`), их `head().links` **конкатенируются**, а `<link>` в отличие от `<meta name=...>` не дедуплицируется по атрибутам. Родитель одновременно и layout, и index-страница, поэтому у него правомерно есть свой canonical на `/cases` — но он «протекает» в детей.

### 2. Средне: `og:image` и `twitter:image` дублируются на всех 134 страницах

Первый — `/og-default.jpg` из `index.html` (относительный, не резолвится соцсетями), второй — правильный от route/root. Пример на `/cases/pozhar-zhk-samolet-krasnodar`:
```
<meta property="og:image" content="/og-default.jpg">
<meta property="og:image" content="https://sanitarnyeresheniya.ru/assets/pozhar-zhk-samolet-krasnodar-before-…jpg">
```

### 3. Мелко

- `src/routes/oferta.tsx`: robots перезаписан на `index,follow` (без `max-image-preview:large,max-snippet:-1`). Все остальные — с полным набором.
- `src/routes/lp.$citySlug.$serviceSlug.tsx`: canonical хардкодит домен `tlz-craftsman-hub.lovable.app`. LP-роуты у нас `noindex,nofollow`, но canonical всё равно надо строить через `SITE_URL`.

### Что уже ок

- **`<meta name="robots">`** — на всех страницах ровно один тег. Значения корректные:
  - 132 страницы — `index,follow,max-image-preview:large,max-snippet:-1` (из `__root.tsx`).
  - `oferta` — `index,follow` (см. пункт 3).
  - `privacy` — `noindex, follow` (намеренно, служебная).
- `<meta property="og:url"/og:title/og:description>` — по одному тегу на страницу (эти mata-теги дедуплицируются).
- `<title>` — по одному валидному значению у всех.

## Что сделаю

**A. Убрать из `index.html` теги, которые перезаписываются роутами и порождают дубли:**
- `<meta property="og:image" content="/og-default.jpg">` (строка 32)
- `<meta name="twitter:image" content="/og-default.jpg">` (строка 34)

Оставить `og:type`, `og:site_name`, `og:locale`, `twitter:card` — они не дублируются на уровне значений и полезны как фолбэк для соц-краулеров, не выполняющих JS.

**B. Добавить пост-обработку в `scripts/prerender.ts`** перед `writeFileSync(fp, html)`:

```ts
function dedupeHead(html: string): string {
  // Для каждого «уникального» ключа оставляем ПОСЛЕДНЕЕ вхождение,
  // потому что child-роут пишет head позже родителя.
  const rules = [
    { re: /<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, key: () => "canonical" },
    { re: /<meta\b[^>]*\bproperty=["']og:image["'][^>]*>/gi, key: () => "og:image" },
    { re: /<meta\b[^>]*\bname=["']twitter:image["'][^>]*>/gi, key: () => "twitter:image" },
    { re: /<title>[^<]*<\/title>/gi, key: () => "title" },
  ];
  for (const { re } of rules) {
    const matches = [...html.matchAll(re)];
    if (matches.length <= 1) continue;
    // Удаляем все, кроме последнего.
    for (let i = 0; i < matches.length - 1; i++) {
      const m = matches[i];
      html = html.slice(0, m.index) + html.slice(m.index + m[0].length);
      // сдвиг индексов последующих — matchAll на исходной строке, пересчитывать:
      // проще заново вычислить в цикле:
      // (заменю на цикл через `replace` — см. ниже)
    }
  }
  return html;
}
```

Финальную реализацию сделаю без ловушки со сдвигом индексов (либо через повторный `matchAll` до сходимости, либо `html.replace(re, (m, i, all) => i === lastIndex ? m : "")`).

Это самый безопасный фикс: не трогаем файловую структуру роутов, не рискуем сломать логику TanStack, и правило «оставить последний» естественно потому, что child-`head()` эмитится после parent-`head()`.

**C. Мелкие правки в роутах:**
- `src/routes/oferta.tsx`: robots → `index,follow,max-image-preview:large,max-snippet:-1` (как у всех).
- `src/routes/lp.$citySlug.$serviceSlug.tsx`: заменить хардкод домена на `${SITE_URL}/lp/${params.citySlug}/${params.serviceSlug}`.

## Проверка после деплоя

1. `curl -s https://sanitarnyeresheniya.ru/cases/pozhar-zhk-samolet-krasnodar | grep -c 'rel="canonical"'` → **1**.
2. То же для `/blog/*`, `/cities/*`, `/cities/:city/:service`.
3. `grep -c 'og:image'` на любой странице → **1**.
4. `<meta name="robots">` — по-прежнему один тег, `index,follow,max-image-preview:large,max-snippet:-1`.
5. В Яндекс.Вебмастере отправить на переобход:
   - `/cases`, `/blog`, `/cities`, `/regions` и все их дочерние URL (те же 115, что были со сбитым canonical).

## Файлы, которые меняю

- `index.html` — удалить `og:image` и `twitter:image`.
- `scripts/prerender.ts` — добавить функцию `dedupeHead` и вызвать её перед записью `fp` (и `dist/404.html`).
- `src/routes/oferta.tsx` — выровнять `robots`.
- `src/routes/lp.$citySlug.$serviceSlug.tsx` — canonical через `SITE_URL`.

Роуты `cases.tsx`, `blog.tsx`, `cities.tsx`, `cities.$citySlug.tsx` **не трогаю**: их собственный canonical (для `/cases`, `/blog`, `/cities`, `/cities/:city`) корректный, дедуп в prerender'е снимет только лишние дубли у детей.
