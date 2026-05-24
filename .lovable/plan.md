## Заменить ссылки Telegram на username

Используем `https://t.me/expert_dendrologist` вместо ссылки по номеру.

**`src/lib/site.ts`:**
- `SITE_TELEGRAM_URL = "https://t.me/expert_dendrologist"`
- `SITE_TELEGRAM_USERNAME = "@expert_dendrologist"` (для отображения).

**`src/routes/contacts.tsx`:**
- В карточке Telegram заменить подпись с `{SITE_PHONE}` на `{SITE_TELEGRAM_USERNAME}`.

Остальные использования (`UrgentCTA`) уже берут `SITE_TELEGRAM_URL` — автоматически подхватят новый линк.

Для **MAX** username не дан — оставляю ссылку по номеру `https://max.ru/+79619119919`. Если есть отдельный username для MAX — пришлите, заменю.
