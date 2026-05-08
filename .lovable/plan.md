## Что меняем

### 1. Шапка на мобильном (`src/components/site/Header.tsx`)
- Полностью убрать кнопку «Срочный выезд» на мобильной (оставить только на `md+`).
- Убрать телефон-ссылку из шапки (он и так не виден на мобильном).
- Заголовок «Санитарные Решения / РФ · Аварийная служба 24/7» поднять/прижать к левому краю — убрать `gap-4` зазоры, сделать строку компактной.
- Ко второй строке `РФ · Аварийная служба 24/7` применить переливающийся градиент: текст `bg-gradient-to-r from-accent via-urgent to-accent bg-clip-text text-transparent` + анимация `animate-shimmer` (двигаем `background-position` бесконечно).

### 2. Анимация «перелив» (`src/styles.css`)
Добавить новый keyframe и утилитарный класс:
```css
@keyframes shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.animate-shimmer {
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;
}
```

### 3. Кнопка «Срочный выезд» в hero (`src/routes/index.tsx`)
Заменить однотонный `bg-urgent` на градиент с переливом:
```
bg-[linear-gradient(110deg,var(--urgent),var(--accent),var(--urgent))]
animate-shimmer text-urgent-foreground shadow-lg shadow-urgent/40
```
Сохраняем размер, иконку, hover.

### 4. Плавающая кнопка-телефон (`src/components/site/UrgentCTA.tsx`)
Когда меню закрыто — заменить плоский зелёный `bg-[#25D366]` на тот же переливающийся градиент (зелёный→бирюза→зелёный):
```
bg-[linear-gradient(110deg,#25D366,#0fb89a,#25D366)] animate-shimmer
```
При открытом состоянии (крестик) остаётся `bg-primary` без анимации.

## Технические детали
- Переменные `--urgent` и `--accent` уже существуют в `styles.css` — используем их через `var()` внутри inline-градиента.
- `animate-shimmer` — обычный CSS-класс в `@layer utilities` (или просто на корневом уровне), доступный во всём проекте.
- Никаких новых зависимостей.

## Что НЕ трогаем
- Десктопную шапку (там «Срочный выезд» остаётся).
- Логику `UrgentCTA` (раскрывающийся список, обработчики).
- Другие страницы и компоненты.
