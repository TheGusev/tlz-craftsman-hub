## Задача
Добавить два загруженных фото в карточки услуг «После пожара» и «Очистка участков».

## Шаги

1. **Скопировать фото в `src/assets/`:**
   - `user-uploads://05-service-fire.png` → `src/assets/service-fire.png`
   - `user-uploads://13-service-plot.png` → `src/assets/service-plot.png`

2. **Обновить `src/lib/serviceImages.ts`:**
   - Импортировать новые изображения.
   - Добавить маппинги:
     - `"posle-pozhara": fire`
     - `"ochistka-uchastkov": plot`

3. **Проверка отображения:**
   - Каталог `/services` и страницы `/services/posle-pozhara`, `/services/ochistka-uchastkov` подхватят фото через существующий `getServiceImage(slug)`.
   - Главная (секция «Что делаем») при необходимости тоже использует тот же словарь.

## Файлы
- create `src/assets/service-fire.png`
- create `src/assets/service-plot.png`
- edit `src/lib/serviceImages.ts`
