## Цель

Добавить убедительную фотогалерею к каждому кейсу: на карточке списка `/cases` — обложка + 3 миниатюры с лайтбоксом, плюс новая детальная страница `/cases/$slug` с полной галереей, описанием этапов работ и SEO-разметкой.

## Что делаем

### 1. Генерация AI-фотографий (12 кейсов × 4 фото = 48 изображений)

Для каждого из 12 кейсов в `src/data/cases.ts` генерируем 4 изображения в стиле текущих (фотореалистичные, документальные):

| Слот | Что показываем |
|---|---|
| `before` | Состояние объекта до работ (повреждение, очаг проблемы) |
| `process` | Бригада в СИЗ за работой, оборудование в действии |
| `equipment` | Крупный план профильного оборудования (генератор тумана, тепловая пушка, фумигатор и т.д.) |
| `after` | Чистый результат, тот же ракурс что и `before` |

Промпты учитывают тип кейса (пожар/потоп/плесень/санация/фумигация) и тип объекта из `cases[i].objectType`. Стиль — "documentary photo, professional sanitation crew, Russia, realistic lighting".

Файлы сохраняются в `src/assets/cases/{slug}-{slot}.jpg` (~150–250 КБ каждый, 1280×800).

### 2. Структура данных

Расширяем `src/data/cases.ts` — у каждого кейса добавляем массив `gallery` (4 элемента: `src`, `alt`, `caption`, `kind`).

Создаём `src/lib/caseGallery.ts` — типизированный реестр импортов всех изображений (mapping `slug → Photo[]`). Старый `src/lib/caseImages.ts` оставляем для обратной совместимости (использует `before` как обложку).

### 3. Лайтбокс-компонент

Новый `src/components/site/Lightbox.tsx`:
- Управляется prop `images` + `index` + `onClose`
- Навигация: стрелки, свайпы (touch), клавиши ←/→/Esc
- Caption внизу
- Закрытие по клику на фон, кнопка-крестик
- Trap focus, `aria-modal`, `role="dialog"`
- Без сторонних библиотек (~80 строк кода)

### 4. Карточка кейса в `/cases`

Обновляем `src/routes/cases.tsx`:
- Обложка (фото `before`) + полоска из 3 миниатюр под ней
- Клик по любому фото → лайтбокс с галереей этого кейса
- Клик по заголовку или кнопке "Подробнее →" → переход на `/cases/$slug`

### 5. Детальная страница `/cases/$slug`

Новый файл `src/routes/cases.$slug.tsx`:

```
- Breadcrumbs: Главная → Кейсы → {заголовок}
- H1 + теги города/услуги (ссылками)
- Главная галерея 2×2 (все 4 фото) с лайтбоксом
- Блок "Задача" (problem + objectType)
- Блок "Что сделали" (works в виде нумерованного списка)
- Блок "Срок и результат"
- CTA-блок: "Нужна такая же работа в {city}?" с телефоном и ссылкой на форму
- Секция "Похожие кейсы" — 3 карточки той же услуги или города
- head() с уникальными meta + JSON-LD: Article + ImageGallery + BreadcrumbList
- 404 через notFoundComponent при невалидном slug
```

### 6. Sitemap и навигация

- В `src/routes/sitemap[.]xml.tsx` добавляем 12 урлов вида `/cases/{slug}`
- В Footer / на главной (если есть блок кейсов) — обновить ссылки на детальные страницы

### 7. JSON-LD

В `src/lib/jsonld.ts` добавляем:
- `buildImageGallerySchema(images, name)` — `@type: ImageGallery`
- `buildArticleSchema({ headline, image, datePublished, ... })` — для детальной страницы кейса

## Технические детали

- Все 48 изображений генерируем через `imagegen--generate_image` в режиме `fast`, размер 1280×800 (16:10), `transparent_background: false`
- Генерация параллельная батчами по 6 за раз (~10 минут общее время)
- `loading="lazy"` на всех миниатюрах, `loading="eager" fetchPriority="high"` на главной картинке детальной страницы (LCP)
- Лайтбокс — клиентский, не ломает SSR (открытие после монтирования)
- Использование семантических токенов из `src/styles.css` (border, accent, card)

## Что НЕ делаем

- Не настраиваем upload реальных фото пользователем
- Не используем сторонние библиотеки (yet-another-react-lightbox и т.п.)
- Не меняем структуру `cases.ts` кардинально — только добавляем поле `gallery`
- Не трогаем существующие `src/assets/case-*.png` (остаются как fallback)

## Файлы

**Новые:**
- `src/components/site/Lightbox.tsx`
- `src/routes/cases.$slug.tsx`
- `src/lib/caseGallery.ts`
- `src/assets/cases/*.jpg` (48 файлов)

**Изменённые:**
- `src/data/cases.ts` (добавляем `gallery`)
- `src/routes/cases.tsx` (миниатюры + лайтбокс + ссылка на детальную)
- `src/routes/sitemap[.]xml.tsx` (12 новых урлов)
- `src/lib/jsonld.ts` (ImageGallery + Article схемы)

## Порядок работ

1. Расширяем `src/data/cases.ts` структурой `gallery` (placeholder-пути)
2. Генерируем 48 изображений батчами
3. Создаём `caseGallery.ts` с импортами
4. Пишем `Lightbox.tsx`
5. Создаём детальную страницу `cases.$slug.tsx` + JSON-LD-хелперы
6. Обновляем `cases.tsx` (миниатюры + ссылка)
7. Обновляем sitemap
8. `tsc --noEmit` + ручная проверка `/cases` и `/cases/pozhar-zhk-samolet-krasnodar`