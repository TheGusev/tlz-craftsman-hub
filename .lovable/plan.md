## Sitemap для отправки в Яндекс + ссылки на услуги в 3 городах

### Текущая ситуация
В проекте **нет sitemap.xml** — ни `public/sitemap.xml`, ни `src/routes/sitemap[.]xml.ts`. Отправлять в Яндекс пока нечего.

### Что сделать
Создать server-route `src/routes/sitemap[.]xml.ts` с `BASE_URL = "https://sanitarnyeresheniya.ru"`, который генерирует все публичные URL:

- Статика: `/`, `/about`, `/services`, `/cities`, `/prices`, `/contacts`, `/faq`, `/blog`, `/cases`, `/otzyvy`, `/garantii`, `/vyezd`, `/licenzii`, `/oplata`, `/rekvizity`, `/regions`, `/regions/krym`, `/privacy`, `/oferta`, `/soglasie`.
- По услугам: `/services/{slug}` × 9 услуг.
- По городам: `/cities/{slug}` × 9 городов.
- Город × услуга: `/cities/{citySlug}/{serviceSlug}` — по `popularServices` каждого города (как сейчас рендерится в `cities.$citySlug.$serviceSlug.tsx`).
- Блог и кейсы: `/blog/{slug}`, `/cases/{slug}` из `src/data/blog.ts` и `src/data/cases.ts`.
- `thank-you` и `lp/*` — пропускаем (служебные/лендинги).

В `public/robots.txt` добавить строку:
```
Sitemap: https://sanitarnyeresheniya.ru/sitemap.xml
```

### Что получите после публикации

**Sitemap:** `https://sanitarnyeresheniya.ru/sitemap.xml` — её и отправите в Яндекс.Вебмастер → «Файлы Sitemap».

**Примеры страниц «город × услуга»** (3 города × 3 услуги = 9 ссылок) — можно отдельно прислать на переобход в «Индексирование → Переобход страниц»:

Краснодар:
- https://sanitarnyeresheniya.ru/cities/krasnodar/posle-pozhara
- https://sanitarnyeresheniya.ru/cities/krasnodar/posle-potopa
- https://sanitarnyeresheniya.ru/cities/krasnodar/udalenie-pleseni

Сочи:
- https://sanitarnyeresheniya.ru/cities/sochi/posle-pozhara
- https://sanitarnyeresheniya.ru/cities/sochi/posle-potopa
- https://sanitarnyeresheniya.ru/cities/sochi/dezinfekciya-posle-smerti

Симферополь:
- https://sanitarnyeresheniya.ru/cities/simferopol/posle-pozhara
- https://sanitarnyeresheniya.ru/cities/simferopol/posle-potopa
- https://sanitarnyeresheniya.ru/cities/simferopol/udalenie-pleseni

### Важно
После одобрения плана и реализации **нужно нажать Publish/Update** — иначе `/sitemap.xml` не появится на проде.
