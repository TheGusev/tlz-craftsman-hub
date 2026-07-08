## Что сделаем

Финальный аудит сайта sanitarnyeresheniya.ru без изменений кода — только чтение проекта и формирование отчёта. Результат пришлю прямо в чат одним сообщением.

## Что проверим (полная прогонка)

**1. Технический SEO-слой**
- `index.html`: title, meta description, og:*, twitter:*, viewport, lang, JSON-LD Organization/WebSite.
- `public/robots.txt`: allow/disallow, GPT/Yandex/Perplexity боты, `Sitemap:`, `Host:`.
- `scripts/generate-seo.ts` — sitemap с `<lastmod>`, режим `--verify-jsonld`.
- `scripts/prerender.ts` — `dedupeHead()`, canonical, robots на всех 285 city×service + 4 блог + статика.
- `public/.htaccess`, `_redirects`, `.well-known/ai.json`, `llms.txt`.

**2. Структурированные данные (JSON-LD)**
- city×service: `WebPage`, `BreadcrumbList`, `Service`, `LocalBusiness`, `FAQPage` (≥3 вопроса, синхронизирован с видимым UI).
- blog/*: `BreadcrumbList`, `Article`, `FAQPage`.
- Статические: FAQPage на `/faq`, ImageGallery на кейсах, Organization sitewide.

**3. Контент и GEO-оптимизация**
- Объём текстов city×service (800+ слов) — по `cityServiceContent.ts`.
- Объём блог-постов (1200+ слов) — по `blog.ts`.
- Плотность ключей (город/услуга/биграммы) — по `scripts/audit-geo.report.md`.

**4. Внутренняя перелинковка**
- `RelatedCityServices.tsx` — блоки «Другие услуги в городе» + «Читайте в блоге» с якорями `#s-N`.
- `relatedContent.ts` — маппинг 19 кластеров услуг → deep-links в блог.
- Хлебные крошки, футер, шапка.

**5. UX и производительность (по коду)**
- Мобильные компоненты (`MobileQuickLead`, `use-mobile`), `HeroCTA`, `LeadForm`, `PriceQuiz`.
- Lightbox для галерей, `scroll-mt-24` для якорей.
- Аналитика (`useAnalytics`, `analytics.ts`, `conversions.ts`).

**6. Формы и конверсия**
- LeadForm → Telegram (`telegram.ts`) + `send.php`.
- WhatsApp/Max/Telegram CTA, `thank-you`, UrgentCTA.

**7. Юридические страницы**
- `/oferta`, `/privacy`, `/soglasie`, `/rekvizity`, `/licenzii`, `/garantii`.

**8. Билд/CI**
- `package.json` scripts: `predev`, `prebuild`, `verify:seo`.
- `.github/workflows/deploy.yml` — порядок шагов, verify-jsonld в пайплайне.

## Формат отчёта

Одно сообщение в чате, структура:

```
1. Итоговая оценка: XX / 100
2. Разбивка по категориям (Tech SEO, JSON-LD, Контент, Перелинковка, UX, Формы, Юридика, CI) — балл + краткий комментарий
3. Что сделано за всю серию итераций (по этапам, от расширения контента → GEO-балансировки → перелинковки → FAQPage JSON-LD → verify-jsonld)
4. Полный список изменённых/созданных файлов с назначением
5. Что работает как система (sitemap с lastmod, verify-jsonld в CI, дедуп FAQ, deep-links)
6. Замечания и точки роста (что можно улучшить — SSR для og:image per-route, автотесты Lighthouse и т.п.)
7. Чек-лист «готово к продакшену»
```

## Файлы

Ничего не редактируем. Только читаем для отчёта:
`index.html`, `public/robots.txt`, `public/.htaccess`, `public/llms.txt`, `scripts/*.ts`, `src/routes/*`, `src/lib/*`, `src/data/*`, `src/components/site/*`, `package.json`, `.github/workflows/deploy.yml`, `scripts/audit-geo.report.md`, `.lovable/audit-report.md`.
