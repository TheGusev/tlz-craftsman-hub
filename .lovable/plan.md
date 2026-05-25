## Цель

Перевести отправку заявок с прямого вызова `api.telegram.org` из браузера на PHP-прокси `/send.php`, который будет лежать рядом с собранным фронтом на Beget. Это скроет токен бота из бандла.

## Контекст

- Проект на TanStack Start, собирается в статику и выгружается на Beget рядом с `send.php`.
- Вся отправка сейчас инкапсулирована в `src/lib/telegram.ts` и используется из двух форм: `src/components/site/LeadForm.tsx` и `src/components/site/MobileQuickLead.tsx`. Других форм с отправкой в Telegram в проекте нет (проверено `rg`).
- Контактный телефон для сообщений об ошибке: **+7 961 911 9919**.

## Что делаем

### 1. `public/send.php` (новый файл)
Файл из ТЗ один-в-один. Файлы из `public/` копируются в корень билда, на Beget он окажется по `/send.php`. PHP-плейсхолдеры `PASTE_TOKEN_HERE` / `PASTE_CHAT_ID_HERE` пользователь заполняет вручную после выгрузки (значения уже есть в текущем `.env`: токен `8273064302:AAF4...`, чат `-5240648574`). В плане их не подставляем, чтобы не коммитить секрет — оставим короткий комментарий в начале файла «впишите токен и chat_id».

### 2. `src/lib/telegram.ts` — переписать
- Убрать чтение `VITE_TG_BOT_TOKEN` / `VITE_TG_CHAT_ID` и любой вызов `api.telegram.org`.
- `sendLeadToTelegram(payload)` теперь делает:
  ```ts
  await fetch('/send.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone, name, city, objectType, problem, service,
      urgency, comment,
      formName: payload.source,
      page: typeof window !== 'undefined' ? window.location.href : '',
    }),
  });
  ```
- Сохранить текущий `checkRateLimit()` (30 сек, localStorage) — он уже работает.
- Бросать ошибку, если `res.ok === false` или `json.ok === false`.

### 3. Тексты в формах
В `LeadForm.tsx` и `MobileQuickLead.tsx` сейчас при успехе делается `navigate({ to: '/thank-you' })`. По ТЗ нужно показать toast вместо/перед редиректом:
- успех: `toast.success("Заявка отправлена! Мы перезвоним в течение 5 минут.")` — оставляем редирект на `/thank-you` (страница уже есть и используется в воронке/целях Метрики), просто добавляем toast перед `navigate`.
- ошибка: заменить текущий `toast.error("Не удалось отправить. Позвоните нам напрямую.")` на `toast.error("Ошибка отправки. Позвоните: +7 961 911 9919")`.

### 4. Чистка
- `.env` и `.env.example`: удалить `VITE_TG_BOT_TOKEN` и `VITE_TG_CHAT_ID`, обновить комментарий (сейчас он уже намекает на серверный роут — заменим на «отправка идёт через PHP-прокси `/send.php` на Beget»).
- `supabase.functions.invoke` в проекте не используется (проверено) — удалять нечего.
- Серверный роут `src/routes/api/public/lead.ts`, упомянутый в `.env.example`, физически не существует — удалять нечего.

## Что НЕ трогаем

- Цели Яндекс.Метрики и `trackCityConversion` (9 составных целей из прошлой итерации) — формы по-прежнему вызывают их после успешной отправки.
- Honeypot-поле `website`, rate-limit, редирект на `/thank-you`.
- Все остальные компоненты, CTA и роуты.

## Технические детали

- На Lovable preview (Cloudflare Workers) `/send.php` отдастся как 404/текст — отправка заработает только после выгрузки сборки на Beget. Это ожидаемо, форма покажет toast с ошибкой и телефоном.
- Никаких новых npm-зависимостей.

## Файлы

- `public/send.php` — создать
- `src/lib/telegram.ts` — переписать
- `src/components/site/LeadForm.tsx` — поменять текст success/error toast
- `src/components/site/MobileQuickLead.tsx` — поменять текст error toast, добавить success toast
- `.env`, `.env.example` — убрать `VITE_TG_*`
