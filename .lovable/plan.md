# План: серверная отправка лидов в Telegram

## Проблема с текущим кодом
Сейчас `src/lib/telegram.ts` читает `VITE_TG_BOT_TOKEN` и `VITE_TG_CHAT_ID` — это переменные `VITE_*`, которые **встраиваются в JS-бандл и видны любому посетителю сайта**. Если так подключить присланный токен `8273064302:AAF4...`, его смогут украсть и использовать (спам, бан бота, отправка в чужие чаты). Поэтому я НЕ буду класть токен в `.env` фронта.

## Решение
Принимаю токен и chat_id как **серверные секреты** Lovable Cloud, а отправку в Telegram делаю через серверный роут `/api/public/lead`. Фронт шлёт туда JSON, сервер сам зовёт Telegram Bot API.

## Шаги

1. **Сохранить секреты на сервере** через `secrets--add_secret`:
   - `TG_BOT_TOKEN` = `8273064302:AAF4kMWfuUrPwv7QqTyjE9jw3xicY-NKymg`
   - `TG_CHAT_ID` = `-5240648574`
   
   (Вызову tool — откроется форма, нужно будет подтвердить. Значения уже заполню.)

2. **Создать серверный роут** `src/routes/api/public/lead.ts`:
   - `POST` принимает JSON с полями лида (source, name, phone, city, problem, urgency, comment, utm, landing, referrer, service…).
   - Валидация через Zod: `phone` 7–30 символов, `name` ≤100, `comment` ≤2000 и т.д. (как сейчас на фронте).
   - Простой in-memory rate-limit по IP (1 запрос / 10 сек) — защита от спама.
   - Форматирует HTML-сообщение (как в текущем `formatLead`) и шлёт `POST https://api.telegram.org/bot{TOKEN}/sendMessage` с `process.env.TG_BOT_TOKEN` / `TG_CHAT_ID`.
   - Возвращает `{ok:true}` или ошибку с понятным статусом.

3. **Переписать `src/lib/telegram.ts`** — оставить тот же экспорт `sendLeadToTelegram(payload)` и `checkRateLimit()`, но теперь внутри — `fetch("/api/public/lead", {method:"POST", body: JSON.stringify(payload)})`. Никаких токенов на фронте. Это сохранит совместимость со всеми формами: `LeadForm`, `MobileQuickLead`, и любыми будущими.

4. **Почистить `.env.example`** — убрать `VITE_TG_BOT_TOKEN` и `VITE_TG_CHAT_ID`, добавить комментарий: «Telegram-токены хранятся в секретах Lovable Cloud (TG_BOT_TOKEN / TG_CHAT_ID)».

5. **Протестировать**:
   - Вызову `stack_modern--invoke-server-function` с `POST /api/public/lead` и тестовым телом — реальное сообщение придёт в чат `-5240648574`. Сообщу, что пришло.
   - Проверю rate-limit (второй запрос подряд → 429).
   - Проверю валидацию (пустой phone → 400).

## Что НЕ меняется
- Форма `LeadForm`, `MobileQuickLead`, навигация на `/thank-you`, аналитика (`trackGoal`, `trackCityConversion`), honeypot, согласие — всё остаётся.
- Существующие 9 страниц городов/услуг и SEO-шаблон не трогаю.

## Технические детали
- Файл роута: `src/routes/api/public/lead.ts` (префикс `/api/public/*` обходит auth на published).
- Секреты читаются из `process.env` только внутри handler (важно для рантайма Workers).
- CORS не нужен — same-origin.
- Текущая клиентская проверка `checkRateLimit` (30 сек через localStorage) остаётся как UX-защита, серверный rate-limit — как реальный барьер.

После апрува — реализую и сразу прогоню тестовую заявку.
