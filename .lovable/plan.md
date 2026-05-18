# Уникальные изображения для каждого раздела

## Найденные повторы

### 1. `src/lib/serviceImages.ts` — одни и те же файлы на разных услугах
- `service-fumigation.jpg` используется на **7 услугах**: `fumigaciya`, `dezinsekciya`, `deratizaciya`, `unichtozhenie-tarakanov`, `unichtozhenie-klopov`, `unichtozhenie-blokh`, `unichtozhenie-muravev`
- `service-plot.png` на **3 услугах**: `ochistka-uchastkov`, `obrabotka-uchastkov-ot-kleschey`, `obrabotka-ot-grizunov-na-uchastke`
- `service-disinfection.jpg` на **2 услугах**: `sanitarnaya-obrabotka-pomeshcheniy`, `dezinfekciya-pomeshcheniy`
- `service-odor.jpg` на **2 услугах**: `udalenie-trupnogo-zapaha`, `ozonirovanie-pomescheniy`
- `hero-main.jpg` стоит и на услуге `dezinfekciya-posle-smerti`, и как hero главной страницы

В комментарии в коде прямо написано «переиспользуем имеющиеся обложки» — это техдолг.

### 2. `src/assets/geography.jpg` — на 3 страницах
- `src/routes/index.tsx`
- `src/routes/regions.tsx`
- `src/routes/regions.krym.tsx`

### 3. Кейсы (`src/assets/cases/*`) и блог — повторов **нет** ✓

## План

1. **Сгенерировать 9 новых уникальных обложек услуг** (1024×768, JPG, тематические):
   - `service-dezinsekciya.jpg` — общая дезинсекция (распылитель, СИЗ)
   - `service-deratizaciya.jpg` — дератизация (приманочная станция)
   - `service-tarakany.jpg` — тараканы
   - `service-klopy.jpg` — клопы (матрас, обработка постельных принадлежностей)
   - `service-blohi.jpg` — блохи (ковёр, пол)
   - `service-muravi.jpg` — муравьи
   - `service-ozonirovanie.jpg` — озонатор в помещении
   - `service-klesch.jpg` — клещи на участке (трава)
   - `service-rodents-yard.jpg` — грызуны на участке
   - `service-dezinfekciya-room.jpg` — отдельная обложка для `dezinfekciya-pomeshcheniy` (чтобы не дублировать `sanitarnaya-obrabotka-pomeshcheniy`)
   - `service-after-death.jpg` — отдельная обложка для `dezinfekciya-posle-smerti`, чтобы освободить `hero-main.jpg` под единственный hero главной
2. **Сгенерировать 2 новые обложки** для разделов:
   - `regions-cover.jpg` — общая карта регионов России (для `regions.tsx`)
   - оставить `geography.jpg` только за `index.tsx`; `hero-crimea-mountain.png` уже уникальна для Крыма
3. **Обновить** `src/lib/serviceImages.ts` — каждому slug свой импорт, никаких комментариев «переиспользуем».
4. **Обновить** `src/routes/regions.tsx` на новый `regions-cover.jpg`.

Итого 12 новых картинок. Генерирую через `imagegen` (`fast`-tier, по ~5 сек/шт).

## Вопрос

Подтверди — генерируем все 12 уникальных обложек, или ограничиться только теми, что повторяются больше 2 раз (тогда `service-fumigation` и `service-plot` дробим, остальное оставляем)?
