# Добавить WhatsApp по номеру +7 961 911-99-19 везде

Номер уже есть в `src/lib/site.ts` как `SITE_WHATSAPP_URL = "https://wa.me/79619119919"`. Добавим его во все места, где сейчас показаны только Позвонить / MAX / Telegram.

## Что и где меняем

### 1. Плавающий виджет связи — `src/components/site/UrgentCTA.tsx`
Виден на всех страницах сайта. Сейчас: Позвонить · MAX · Telegram.
Добавляем 4-ю кнопку **WhatsApp** между «Позвонить» и «MAX»:
- цвет `bg-[#25D366] text-white` (фирменный зелёный WhatsApp)
- иконка `MessageCircle` из `lucide-react`
- `href={SITE_WHATSAPP_URL}`, `target="_blank"`, `rel="noopener noreferrer"`
- аналитика: `goal: "lead_whatsapp_click"`, `source: "urgent_cta"`
- порядок: Позвонить · WhatsApp · MAX · Telegram
- «Позвонить» перекрашиваем в нейтральный (сейчас зелёный WA-цвет), чтобы не дублировать зелёный: `bg-primary text-primary-foreground` или `bg-urgent`.

### 2. Шапка сайта — `src/components/site/Header.tsx`
На десктопе рядом с телефоном и кнопкой «Срочный выезд» добавляем иконку-ссылку WhatsApp (только иконка, `MessageCircle`, зелёная), `md:inline-flex`. На мобиле — не добавляем (там есть плавающий виджет).

### 3. LP-страница — `src/routes/lp.$citySlug.$serviceSlug.tsx`
В hero-блоке уже есть `whatsappHref`, но кнопки WhatsApp рядом с «Позвонить» нет. Добавляем вторую CTA-кнопку «Написать в WhatsApp» рядом с существующей «Позвонить», зелёный стиль, тот же `whatsappHref`. Событие аналитики `lead_whatsapp_click` с `source: "lp_hero"`.

### 4. Городская страница услуги — `src/routes/cities.$citySlug.$serviceSlug.tsx`
Кнопка WhatsApp уже есть — не трогаем.

### 5. Страница /contacts — `src/routes/contacts.tsx`
WhatsApp уже есть — не трогаем.

## Единый источник номера
Везде используем `SITE_WHATSAPP_URL` из `src/lib/site.ts` (кроме городской страницы, где сохраняется предзаполненный текст сообщения с названием услуги — оставляем как есть).

## Аналитика
Новое событие `lead_whatsapp_click` с полями `source` (`urgent_cta` / `header` / `lp_hero`) и `city` (slug активного города).

## Что НЕ меняем
- Порядок городов в дропдаунах, калькулятор МСК/МО, JSON-LD, sitemap, контент — без изменений.
- Логику Telegram-нотификаций формы — без изменений.
- Номер телефона и `SITE_WHATSAPP_URL` — без изменений (уже правильный).

## Проверка после сборки
1. Открыть главную → плавающая кнопка «трубка» → в раскрытии видно 4 пункта в порядке Позвонить · WhatsApp · MAX · Telegram, клик по WhatsApp открывает `wa.me/79619119919` в новой вкладке.
2. Десктопная шапка — иконка WhatsApp рядом с телефоном.
3. `/lp/moskva/dezinfekciya-...` — в hero две CTA: «Позвонить» и «Написать в WhatsApp».
4. `/contacts` и `/cities/moskva/dezinfekciya-...` — WhatsApp на месте (как было).
