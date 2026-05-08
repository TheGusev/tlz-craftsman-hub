## Что меняем

1. **Главная (`src/routes/index.tsx`)** — убираем фото `hero-main.jpg` из hero-секции:
   - удаляем импорт `heroMain` и `<div>` с `backgroundImage`
   - оставляем градиент primary/accent как фон, чтобы hero не «провалился» визуально

2. **Сервис «Дезинфекция после смерти» (`src/lib/serviceImages.ts`)** — назначаем убранное фото `hero-main.jpg` именно этой услуге:
   - меняем маппинг `"dezinfekciya-posle-smerti"` с `disinfection` на новый импорт `heroMain`
   - картинка автоматически появится: на карточке услуги на главной, в каталоге `/services` и в шапке страницы услуги `/services/dezinfekciya-posle-smerti` (включая og:image)

Никаких других секций и логики не трогаем.