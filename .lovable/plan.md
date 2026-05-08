Нашёл конкретную проблему: `routeTree` видит дочерние маршруты (`/services/$serviceSlug`, `/cities/$citySlug`, `/blog/$slug`, `/regions/krym`), но родительские страницы (`/services`, `/cities`, `/blog`, `/regions`) сейчас всегда рендерят свой список и не отдают `<Outlet />`. Поэтому при переходе по «Подробнее» URL меняется, но пользователь остаётся на родительской странице/каталоге.

План выполнения:

1. Исправить вложенные маршруты
   - В `src/routes/services.tsx` добавить `Outlet` и показывать каталог услуг только на точном пути `/services`.
   - В `src/routes/cities.tsx` добавить `Outlet` и показывать список городов только на точном пути `/cities`.
   - В `src/routes/cities.$citySlug.tsx` добавить `Outlet`, чтобы `/cities/$citySlug/$serviceSlug` открывал страницу услуги в городе.
   - В `src/routes/blog.tsx` добавить `Outlet` и показывать блог только на точном пути `/blog`.
   - В `src/routes/regions.tsx` добавить `Outlet` и показывать список регионов только на точном пути `/regions`.

2. Проверить кнопки «Подробнее»
   - Оставить существующие `Link` с параметрами, они уже написаны правильно через `params`.
   - Проверить, что кнопка «Подробнее» на главной открывает детальную страницу услуги, а не каталог.
   - Проверить «Подробнее» в каталоге услуг.

3. Включить SSG/пререндеринг
   - В `vite.config.ts` добавить `tanstackStart.prerender.enabled = true`.
   - Включить `crawlLinks: true`, чтобы страницы из ссылок автоматически попадали в пререндер.
   - Явно добавить `pages` для всех важных динамических URL:
     - все услуги из `services`
     - все города из `cities`
     - все связки город+услуга из `serviceInCity`
     - все статьи из `blogPosts`
     - `/regions/krym`

4. Проверить результат в браузере
   - На мобильном viewport 390×844 нажать первую кнопку «Подробнее» на главной.
   - Проверить прямые URL:
     - `/services/posle-pozhara`
     - `/services/udalenie-pleseni`
     - `/cities/krasnodar`
     - `/cities/krasnodar/posle-pozhara`
     - `/blog/chem-opasna-plesen-posle-zatopleniya`
     - `/regions/krym`
   - Убедиться, что на каждой странице виден правильный H1 и нет 404/каталога вместо детальной страницы.