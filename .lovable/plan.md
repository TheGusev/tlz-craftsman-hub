# JSON-LD для медиа: VideoObject и ImageObject на услугах и городах

## Текущее состояние (проверено)

- `VideoObject` отдаётся только для услуги «После потопа» — на `/services/posle-potopa` и на страницах город×услуга. Больше нигде видео в разметке нет.
- Галереи реальных фото (потоп — 4 фото, пожар — 3 фото) выводятся на страницах, но **в JSON-LD не попадают вообще**: `buildImageGallerySchema` используется только в кейсах.
- Проверка `--verify-jsonld` в сборке контролирует только canonical, robots, WebPage/Breadcrumb/Service/LocalBusiness/FAQPage и Article. Видео и изображения она не проверяет — то есть «зелёная» сборка ничего не говорит о медиа-разметке.
- В `VideoObject` нет `embedUrl`/`inLanguage`, `uploadDate` — просто дата без времени и таймзоны, `duration` задан вручную (PT35S при фактической длительности ~34 с).
- У `WebPage` нет `primaryImageOfPage`, хотя обложка услуги есть.

## Что сделаю

1. **ImageObject для галерей.** Добавлю в граф `ImageGallery` с массивом `ImageObject` (contentUrl, caption, description с гео-привязкой, width/height) на:
   - `/services/posle-potopa` и `/services/posle-pozhara`;
   - все страницы город×услуга по этим двум услугам (Москва, МО).
   Данные беру из `floodGallery.ts` и `fireGallery.ts`, alt/caption уже склоняются по городу.
2. **Полный VideoObject.** Дополню схему полями `inLanguage: "ru-RU"`, `isFamilyFriendly`, `uploadDate` в формате ISO с таймзоной, `thumbnailUrl` абсолютным, `contentUrl` абсолютным, `duration` из фактической длительности файла. Проверю, что видео отдаётся с корректным Content-Type.
3. **primaryImageOfPage.** У `WebPage` на страницах услуг и город×услуга проставлю обложку как `ImageObject`, чтобы у страницы был явный главный визуал.
4. **Расширю верификатор** `scripts/generate-seo.ts --verify-jsonld`:
   - если у услуги есть видео — на её страницах обязателен валидный `VideoObject` с непустыми `name`, `description`, `contentUrl`, `thumbnailUrl`, `uploadDate`;
   - если у услуги есть галерея — обязателен `ImageGallery` с ≥1 `ImageObject`;
   - все `contentUrl`/`thumbnailUrl` — абсолютные и начинаются с домена сайта;
   - каждый файл, указанный в `contentUrl`/`thumbnailUrl`, реально существует в `dist` (ловит битые пути ещё до деплоя).
   Ошибка любой из проверок роняет сборку — тогда «зелёный» билд действительно означает корректную медиа-разметку.
5. **Прогон**: `npm run build:prod` на 134 маршрутах + выборочная проверка итогового JSON-LD на страницах потопа и пожара.

## Технические детали

- Файлы: `src/lib/jsonld.ts` (расширение `buildVideoObjectSchema`, новый `buildMediaImagesSchema`), `src/routes/services.$serviceSlug.tsx`, `src/routes/cities.$citySlug.$serviceSlug.tsx`, `scripts/generate-seo.ts`.
- Никаких изменений в видимой вёрстке — только разметка в `<head>`.
- Идентификаторы узлов: `#video`, `#gallery`, `#primaryimage` относительно canonical страницы, чтобы не было дублей при склейке графа.
