# План: прогон всех лид-форм с реальными отправками в чат

## Что протестирую
Открою в браузере по очереди ключевые страницы с формами, заполню реальными тестовыми данными и отправлю — каждая заявка придёт в группу «Site Заявки». Помечу источник, чтобы ты сразу видел в чате, какая форма откуда:

| # | Страница | Форма | source в Telegram |
|---|----------|-------|-------------------|
| 1 | `/` (главная) — десктоп | LeadForm | `lead_form` |
| 2 | `/` (главная) — моб. 393px | MobileQuickLead | `mobile_quick_lead` |
| 3 | `/services/prosushka-pomescheniy` | LeadForm | `lead_form` |
| 4 | `/cities/sochi` | LeadForm | `lead_form` |
| 5 | `/cities/sochi/prosushka-pomescheniy` | LeadForm | `lead_form` |
| 6 | `/cities/simferopol/dezinfekciya` | LeadForm | `lead_form` |
| 7 | `/cities/sevastopol/uborka-posle-zatopleniya` | LeadForm | `lead_form` |
| 8 | `/lp/sochi/prosushka-pomescheniy` | LeadForm | `lead_form` |
| 9 | `/contacts` | LeadForm | `lead_form` |
| 10 | `/prices` (если есть PriceQuiz) | PriceQuiz | `price_quiz` |
| 11 | `/vyezd` | LeadForm | `lead_form` |
| 12 | `/garantii` | LeadForm | `lead_form` |

## Тестовые данные
Чтобы вы могли отличить тестовые заявки от настоящих, везде использую:
- Имя: **«ТЕСТ Лавабл»**
- Телефон: **+7 (000) 000-00-01** (заведомо нерабочий)
- Комментарий: `__test__ <название страницы>`
- Город / услуга — соответствуют странице
- Согласие — отмечено

## Как буду делать (технически)
- Для каждой страницы: `browser--navigate_to_sandbox` → `browser--act` (заполнить поля) → `browser--act` (Submit) → `browser--screenshot` подтверждения `/thank-you`.
- Для моб. формы переключу viewport через `preview_ui--set_preview_device_viewport` на 393×844 и пройду 3 шага визарда.
- Между отправками жду >30 сек (клиентский rate-limit) или чищу `localStorage.tg_lead_last_ts`.
- В конце дам список из 12 заявок с пометкой «✓ доставлено / ✗ не дошло» — ты сверишь в чате.

## Что НЕ делаю
- Не меняю код форм — только тестирую.
- Не трогаю SEO и контент.

## Риски / оговорки
- Если на странице форма не открывается (например, скрыта за модалкой) — отмечу и продолжу.
- 12 заявок прилетят подряд — будет шумно в чате; если хочешь — могу сократить набор (например, только 6 ключевых страниц). Напиши, если так.

После апрува — погнал по списку.
