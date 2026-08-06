# Объединение per-service целей в одну составную цель Метрики

## Что делаем

Создаём в Яндекс.Метрике одну составную цель (составное действие), которое срабатывает при достижении любой из перечисленных целей. Условие объединения — логическое **ИЛИ** ("выполнено хотя бы одно").

## Название составной цели

`all_conversions`  
(или другое удобное вам название; главное — зафиксировать идентификаторы целей-шагов.)

## Цели, которые нужно включить в составную (18 шагов)

### posle_pozhara
- lead_phone_click_posle_pozhara
- lead_whatsapp_click_posle_pozhara
- lead_telegram_click_posle_pozhara
- lead_max_click_posle_pozhara
- lead_form_submit_posle_pozhara
- lp_quiz_complete_posle_pozhara

### posle_potopa
- lead_phone_click_posle_potopa
- lead_whatsapp_click_posle_potopa
- lead_telegram_click_posle_potopa
- lead_max_click_posle_potopa
- lead_form_submit_posle_potopa
- lp_quiz_complete_posle_potopa

### dezinfekciya_posle_smerti
- lead_phone_click_dezinfekciya_posle_smerti
- lead_whatsapp_click_dezinfekciya_posle_smerti
- lead_telegram_click_dezinfekciya_posle_smerti
- lead_max_click_dezinfekciya_posle_smerti
- lead_form_submit_dezinfekciya_posle_smerti
- lp_quiz_complete_dezinfekciya_posle_smerti

## Как настроить в Метрике

1. Открыть счётчик → **Настройки** → **Цели**.
2. Нажать **Добавить цель** → выбрать тип **Составное действие**.
3. В поле "Название" ввести `all_conversions`.
4. Добавить шаги: в каждом шаге выбрать **JavaScript-событие** и ввести один идентификатор из списка выше.
5. Условие между шагами оставить **ИЛИ** (по умолчанию для составного действия).
6. Сохранить.

## Проверка на сайте

- Открыть любую из страниц: `/cities/moskva/posle-pozhara`, `/cities/moskva/posle-potopa`, `/cities/moskva/dezinfekciya-posle-smerti`.
- В консоли браузера выполнить `window.dataLayer` после клика по телефону/WhatsApp/квизу/форме.
- Убедиться, что в `dataLayer` появляется событие с именем из списка выше.
- В Метрике в отчёте по целям появится засчитанное `all_conversions`.

## Что не меняется в коде

- `src/lib/analytics.ts` уже отправляет и базовую цель (`lead_phone_click`), и per-service цель (`lead_phone_click_posle_pozhara`) при наличии параметра `service`.
- Никакие дополнительные параметры или новые цели в код не добавляются.
