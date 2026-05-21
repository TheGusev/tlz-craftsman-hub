## Цель

Для трёх «рекламных» городов (`simferopol`, `sevastopol`, `sochi`) собрать все конверсионные действия в одну **составную цель** Яндекс.Метрики на город. Аналитика уже подключена через `src/lib/analytics.ts` (`trackGoal` → `window.ym(YM_ID, "reachGoal", ...)`).

## Архитектура целей

На каждый город создаётся **одна** конверсионная цель в Метрике:

- `conversion_simferopol`
- `conversion_sevastopol`
- `conversion_sochi`

Эта цель срабатывает при **любом** конверсионном событии на страницах, привязанных к этому городу. Параллельно отправляются «детализирующие» цели — чтобы в отчётах было видно, какой именно канал сработал:

- `conversion_{city}_form` — успешная отправка любой формы
- `conversion_{city}_messenger` — клик по WhatsApp / Telegram / MAX
- `conversion_{city}_phone` — клик по `tel:`-ссылке
- `conversion_{city}_quiz` — завершение калькулятора PriceQuiz на `/lp/`

Что считается «страницей города»: `/cities/{city}`, `/cities/{city}/{service}`, `/lp/{city}/{service}`. Город берётся из `useActiveCity` (хук уже есть).

В коде город — только из `useActiveCity` (a не из formdata `defaultCity`), чтобы избежать ложных срабатываний на главной/контактах.

## Что меняется в коде

### 1. Новый помощник `src/lib/conversions.ts`

```ts
import { trackGoal } from "./analytics";

const TRACKED_CITIES = new Set(["simferopol", "sevastopol", "sochi"]);
type ConversionType = "form" | "messenger" | "phone" | "quiz";

export function trackCityConversion(
  city: string | undefined,
  type: ConversionType,
  params?: Record<string, unknown>,
) {
  if (!city || !TRACKED_CITIES.has(city)) return;
  trackGoal(`conversion_${city}`, { type, ...params });
  trackGoal(`conversion_${city}_${type}`, params);
}
```

### 2. Точки вызова (везде через `useActiveCity`)

| Компонент | Событие | Тип |
|---|---|---|
| `LeadForm.tsx` | успешный `sendLeadToTelegram` → `trackGoal("lead_form_submit", …)` | `form` |
| `MobileQuickLead.tsx` | то же | `form` (хотя компонент сейчас не используется на 3 городах — на будущее) |
| `PriceQuiz.tsx` | `trackGoal("lp_quiz_complete", …)` | `quiz` |
| `UrgentCTA.tsx` | клик «Позвонить» / «MAX» / «Telegram» | `phone` / `messenger` |
| `Header.tsx` | клик по иконке/кнопке «Срочный выезд» (tel:) | `phone` |
| `Footer.tsx` | клик по городскому номеру (уже есть `trackGoal("lead_phone_click", …)`) | `phone` |
| `lp.$citySlug.$serviceSlug.tsx` | кнопки «Позвонить» и «WhatsApp» в hero, плюс верхняя tel:-ссылка | `phone` / `messenger` |
| `cities.$citySlug.tsx` | кликов по мессенджерам нет; конверсии идут через LeadForm в aside | — |

В каждой из этих точек дополнительно к существующему `trackGoal(...)` вызываем `trackCityConversion(activeCity?.slug, type, { source })`. Старые названия событий (`lead_form_submit`, `lead_phone_click` и т. п.) оставляем — они полезны для общего отчёта.

### 3. Кнопки в LP-странице сейчас без аналитики

В `src/routes/lp.$citySlug.$serviceSlug.tsx` кнопки `Позвонить` (`<a href={phoneHref}>`) и `WhatsApp` сейчас не вызывают `trackGoal`. Добавлю `onClick` с `trackGoal("lead_phone_click" / "lead_messenger_click", { source: "lp_hero", city: city.slug })` и одновременно `trackCityConversion(city.slug, "phone" / "messenger", …)`.

### 4. Header tel:-ссылка

Сейчас просто `<a href={cityPhoneHref}>` без аналитики. Добавлю `onClick` → `trackCityConversion(activeCity?.slug, "phone", { source: "header" })` + `trackGoal("lead_phone_click", …)`.

## Что делает пользователь в кабинете Метрики после деплоя

Для каждого из 3 городов завести **одну составную цель**:

1. Метрика → Цели → «Добавить цель» → тип **«Составная»**.
2. Название: «Конверсия Симферополь» (Севастополь / Сочи).
3. Шаги — режим «достаточно выполнить любое из условий» (в Метрике это создаётся как одна цель типа «JavaScript-событие» с именем `conversion_simferopol` — она автоматически сработает на любое из под-событий, потому что мы шлём один и тот же reachGoal из всех точек).

То есть фактически в Метрике достаточно создать **одну цель типа «JavaScript-событие»** с идентификатором `conversion_{city}` — она и есть «составная» в смысле «срабатывает на любую конверсию города». Для детализации канала можно создать ещё 4 цели `conversion_{city}_form/messenger/phone/quiz`, но это опционально.

Альтернатива (если хочется именно тип «Составная» в интерфейсе): создать 4 простых цели `conversion_{city}_*` и объединить их в составную с режимом «любой шаг = достижение». Зависит от того, как удобнее в отчётах.

## Проверка после правок

1. `VITE_YANDEX_METRIKA_ID` установлен в окружении (без него ничего не шлётся — `trackGoal` это no-op).
2. Открыть `/cities/sochi` → нажать в шапке кнопку «Срочный выезд» → в Метрике (вебвизор + отладчик) должны прилететь `lead_phone_click`, `conversion_sochi`, `conversion_sochi_phone`.
3. Открыть `/lp/simferopol/obrabotka-uchastkov-ot-kleschey` → отправить форму → должны прийти `lead_form_submit`, `conversion_simferopol`, `conversion_simferopol_form`.
4. Там же → клик «WhatsApp» в hero → `lead_messenger_click`, `conversion_simferopol`, `conversion_simferopol_messenger`.
5. На `/` (главной), `/contacts`, `/cities/krasnodar` (не отслеживаемый город) — никакие `conversion_*` не отправляются, только базовые `lead_*`.
6. `npm run build` — без ошибок.
