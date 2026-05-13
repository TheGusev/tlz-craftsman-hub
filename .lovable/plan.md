# Единый Hero-компонент для всех страниц

## Цель

Сейчас на каждой странице (главная, услуги, регионы, Крым, услуга, город, блог, города) hero-блок собирается вручную: разный padding, разные подложки (`bg-primary/70 backdrop-blur-sm`, плоский `bg-primary`, без фона), разные размеры заголовков и крошек. Нужно один раз описать стиль и переиспользовать.

## Что делаю

### 1. Новый компонент `src/components/site/PageHero.tsx`

Единый шаблон для всех hero-блоков (кроме главной — там кастомный full-screen hero, его не трогаю).

Пропсы:
- `title: string` — H1
- `eyebrow?: string` — мелкая надпись над заголовком (кластер услуги, регион)
- `description?: ReactNode` — лид-абзац
- `breadcrumbs?: BreadcrumbItem[]` — пробрасываем в `<Breadcrumbs />`
- `backgroundImage?: string` — URL фоновой картинки; если есть — рендерим `<div bg-cover>` + полупрозрачную подложку под текстовой колонкой
- `meta?: ReactNode` — слот под доп. инфу (время выезда, кол-во районов, иконки)
- `actions?: ReactNode` — слот под CTA-кнопки

Единые стили:
- `<header className="relative overflow-hidden bg-primary text-primary-foreground">`
- `<div className="container mx-auto px-4 py-12 md:py-20">`
- При наличии `backgroundImage`: текстовая колонка обернута в `max-w-3xl rounded-2xl bg-primary/70 p-5 backdrop-blur-sm md:p-8`
- Без картинки — без подложки, просто `max-w-3xl`
- Eyebrow: `text-xs font-semibold uppercase tracking-wider text-accent`
- H1: `font-display text-3xl font-bold sm:text-4xl md:text-5xl`
- Description: `mt-4 text-sm opacity-95 md:text-base`

### 2. Применяю к страницам

| Файл | Что заменить |
|---|---|
| `src/routes/services.tsx` | header вокруг H1 «Все санитарные услуги» (без фото) |
| `src/routes/services.$serviceSlug.tsx` | строки 86–104 (с фото) |
| `src/routes/cities.tsx` | header «Города присутствия» (без фото) |
| `src/routes/cities.$citySlug.tsx` | строки 44–55 (без фото, но с meta-слотом для времени выезда / районов) |
| `src/routes/regions.tsx` | header «Регионы присутствия» (с фото `geographyImg`) |
| `src/routes/regions.krym.tsx` | строки 27–39 (с фото) |
| `src/routes/blog.tsx` | header «Блог» (без фото) |

Главная (`src/routes/index.tsx`) **не трогаю** — там карусель из 2 фото на full-screen hero, это самостоятельный компонент с другой задачей.

### 3. Проверка

- `bun run build` (через харнес)
- Открыть на 393×844: `/services`, `/services/posle-pozhara`, `/cities`, `/cities/krasnodar`, `/regions`, `/regions/krym`, `/blog` — убедиться, что hero выглядит одинаково по высоте, типографике, отступам, что breadcrumbs / eyebrow / описание сохранились, что фото видны без затемнения.

## Что НЕ меняется

- Контент ниже hero — без изменений.
- SEO `head()`, лоадеры, JSON-LD — не трогаю.
- Главный hero на `/` — остаётся кастомным.
- Цветовые токены в `styles.css` — не меняю.
