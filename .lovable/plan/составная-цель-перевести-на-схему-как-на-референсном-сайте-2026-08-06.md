# Составная цель: перевести на схему как на референсном сайте

## Что сейчас (проверено в коде)

- `src/lib/analytics.ts` → `trackGoal(name, params)` — единая точка отправки в Метрику и `dataLayer`. Это слой 1, он совпадает с референсом.
- Атомарные цели, которые реально отправляются: `lead_phone_click`, `lead_whatsapp_click`, `lead_telegram_click`, `lead_max_click`, `lead_messenger_click`, `lead_form_submit`, `lp_quiz_complete`, `quick_lead_open`, `lead_confirmed`.
- Дополнительно `src/lib/conversions.ts` генерирует **динамические имена целей** `conversion_{city}_{service}` — это 2 города × 19 услуг = 38 отдельных целей, которых в Метрике нужно заводить руками, и ни одна из них не является составной.

Отличие от референса: там составная цель `all_conversions` собирается **в интерфейсе Метрики** из атомарных целей, а в коде её нет. У нас же «составная» цель эмулируется в коде через генерацию десятков имён — это неверная схема.

## Что делаю

1. **Убираю кодовую генерацию составных целей.** Удаляю `src/lib/conversions.ts` и все вызовы `trackCityConversion` в: `Header.tsx`, `Footer.tsx` (там его нет), `LeadForm.tsx`, `QuickLead.tsx`, `UrgentCTA.tsx`, `PriceQuiz.tsx`, `routes/cities.$citySlug.$serviceSlug.tsx`, `routes/lp.$citySlug.$serviceSlug.tsx`.
2. **Город и услугу не теряю** — они уходят теми же существующими параметрами (`city`, `service`, `source`, `channel`) внутри атомарных целей. Новых параметров и новых целей не добавляю.
3. **Привожу набор параметров к единому виду** во всех точках вызова: `{ source, city, service }` (плюс `channel` для мессенджеров) — там, где сейчас какие-то из них пропущены, подставляю уже доступные в компоненте значения.
4. **Составную цель `all_conversions` заводите в интерфейсе Метрики** — я дам точный список атомарных целей, которые в неё нужно включить (лид-генерирующие: `lead_form_submit`, `lp_quiz_complete`, `lead_phone_click`, `lead_whatsapp_click`, `lead_telegram_click`, `lead_max_click`, `lead_messenger_click`). В коде она не определяется, как и на референсном сайте.
5. **Перепроверка в браузере:** прохожу по московским страницам (город×услуга, LP, главная), кликаю телефон/WhatsApp/квиз/форму и читаю `window.dataLayer` — подтверждаю, что уходят только атомарные цели с корректными `city`/`service`.

## Технические детали

- Файлы правок: `src/lib/conversions.ts` (удаление), `src/components/site/{Header,LeadForm,QuickLead,UrgentCTA,PriceQuiz}.tsx`, `src/routes/cities.$citySlug.$serviceSlug.tsx`, `src/routes/lp.$citySlug.$serviceSlug.tsx`.
- `trackGoal` остаётся единственным каналом отправки; сигнатура не меняется.
- Итог: 9 атомарных целей вместо 9 + 38 динамических; одна составная цель настраивается на стороне Метрики.

## Что нужно от вас после внедрения

В счётчике Метрики удалить/не заводить цели `conversion_*` и создать одну составную цель `all_conversions` по списку из пункта 4.
