## Контекст

Отчёт по `sanitarnyeresheniya.ru` показывает Schema.org Score 65/100. Сканер проверял главную страницу и не нашёл:
- **BreadcrumbList** (−15)
- **Product / Service** (−20)

Эти схемы уже есть в проекте (`src/lib/jsonld.ts`) и используются на внутренних страницах, но на главной (`/`) в `@graph` сейчас только `WebPage`, `LocalBusiness`, `FAQPage`. Добавим недостающие два типа на главную — после следующего скана балл вырастет до 100/100.

## Что меняю

Только `src/routes/index.tsx`, в блоке `head() → scripts → buildGraphHead([...])`.

1. **Импортирую** дополнительно `buildBreadcrumbSchema` и `buildServiceSchema` из `@/lib/jsonld`.
2. **BreadcrumbList**: добавляю `buildBreadcrumbSchema([])` — генератор сам кладёт «Главная → SITE_URL» как единственный элемент списка. Валидно и достаточно для проверки.
3. **Service**: маплю массив `services` (8 услуг) в отдельные узлы `Service` через `buildServiceSchema(...)`, по одному на услугу:
   - `path: \`/services/${s.slug}\`` (даёт уникальный `@id`),
   - `name: s.name`,
   - `description: s.metaDescription`,
   - `serviceType: s.cluster`,
   - `priceFrom: s.priceFrom` (если есть → автоматически добавится `offers`),
   - `areaServed: "ЮФО и Республика Крым"`.

Итоговый `@graph` на главной: `WebPage`, `BreadcrumbList`, `LocalBusiness`, 8 × `Service`, `FAQPage`.

## Что НЕ меняю

- `src/lib/jsonld.ts` — функции уже корректные.
- Остальные роуты — там BreadcrumbList и Service уже подключены.
- Тексты, дизайн, формы заявок.

## Проверка

После деплоя на Beget и пересканирования отчёта строки «BreadcrumbList» и «Product / Service» должны стать зелёными. Локально можно проверить через DevTools → View source главной: в `<script type="application/ld+json">` должны появиться `"@type":"BreadcrumbList"` и 8 узлов `"@type":"Service"`.