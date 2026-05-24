## Цель

Заменить одну составную цель `conversion_{city}` на 9 целей вида `conversion_{city}_{service}` для:
- городов: `simferopol`, `sevastopol`, `sochi`
- услуг: `ochistka-uchastkov`, `unichtozhenie-tarakanov`, `posle-pozhara`

## Изменения

### `src/lib/conversions.ts`
- Добавить `TRACKED_SERVICES = new Set(["ochistka-uchastkov", "unichtozhenie-tarakanov", "posle-pozhara"])`.
- Расширить сигнатуру: `trackCityConversion(city, type, params?)` → `trackCityConversion(city, service, type, params?)`.
- Логика: если `city` не в `TRACKED_CITIES` или `service` не в `TRACKED_SERVICES` — ничего не шлём.
- Иначе отправляем одну цель: `conversion_{city}_{service}` (тип канала и прочее идут в params).
- Старые `conversion_{city}` и `conversion_{city}_{type}` удаляем.

### Обновить вызовы (передать `service`)
- `src/routes/cities.$citySlug.$serviceSlug.tsx` — `service.slug` уже есть.
- `src/routes/lp.$citySlug.$serviceSlug.tsx` — взять `service.slug` (уже в скоупе).
- `src/components/site/PriceQuiz.tsx` — пробросить `service` (квиз привязан к LP-странице, проверю и подставлю).
- `src/components/site/UrgentCTA.tsx` — компонент общий: вызовы будут no-op (услуга неизвестна), убираем там `trackCityConversion`, оставляем только `trackGoal`.
- `src/components/site/LeadForm.tsx` — передаёт `service` пропсом; передавать его в conversion.
- `src/components/site/Header.tsx`, `Footer.tsx`, `MobileQuickLead.tsx` — услуги нет → убрать вызов `trackCityConversion` (по решению «Не считать»). Оставить обычный `trackGoal`.

## Что нужно сделать в Метрике (вручную, вне кода)
Создать 9 составных целей: для каждой пары `{city} × {service}` — JS-событие `conversion_{city}_{service}`. Названия:

```
conversion_simferopol_ochistka-uchastkov
conversion_simferopol_unichtozhenie-tarakanov
conversion_simferopol_posle-pozhara
conversion_sevastopol_ochistka-uchastkov
conversion_sevastopol_unichtozhenie-tarakanov
conversion_sevastopol_posle-pozhara
conversion_sochi_ochistka-uchastkov
conversion_sochi_unichtozhenie-tarakanov
conversion_sochi_posle-pozhara
```

Старую составную `conversion_{city}` можно архивировать.
