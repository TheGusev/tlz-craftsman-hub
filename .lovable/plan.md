## Цель

Подготовить 9 рекламных посадочных «город × услуга» для матрицы:

```
города:  simferopol, sevastopol, sochi
услуги:  obrabotka-uchastkov-ot-kleschey   (зонтичная: клещи, комары,
                                            муравьи, мошка, мухи, кроты,
                                            а также борщевик)
         unichtozhenie-tarakanov           (уже есть 3 записи — не трогаем)
         posle-pozhara
```

Архитектура `cities.$citySlug.$serviceSlug.tsx` + SEO-схемы уже готовы. Закрываем три недочёта.

---

## Задача 1 — починить ссылку в секции «Какие работы выполняем»

Файл: `src/routes/cities.$citySlug.tsx`, строка 100.

Сейчас секция А ведёт на общую `/services/:serviceSlug` без города. Меняем на пару город+услуга:

```tsx
// было
<Link to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} ...>

// будет
<Link
  to="/cities/$citySlug/$serviceSlug"
  params={{ citySlug: city.slug, serviceSlug: s.slug }}
  ...
>
```

Секции B и C уже ведут правильно — их не трогаем.

---

## Задача 2 — fallback в loader, чтобы любая валидная пара открывалась

Файл: `src/routes/cities.$citySlug.$serviceSlug.tsx`.

Сейчас loader делает `throw notFound()` если в `serviceInCity` нет записи. Это ломает 247 валидных URL и блокирует рекламу на пары без уникального контента.

Меняем так:
1. `notFound()` бросаем только если нет `city` **или** `service`.
2. Если `city + service` валидны, но связки нет — собираем дефолтный `sc` из самих `city` и `service`:

```ts
function buildDefaultServiceInCity(city: City, service: Service): ServiceInCity {
  return {
    citySlug: city.slug,
    serviceSlug: service.slug,
    h1: `${service.name} в ${city.nameLocative}`,
    metaTitle: `${service.shortName} в ${city.name} — выезд 24/7`,
    metaDescription:
      `${service.name} в ${city.name}. Выезд бригады в течение ${city.arrivalTime}, ` +
      `гарантия, договор. ${city.phone ?? ""}`.slice(0, 160),
    localOffer: `Работаем в ${city.name} и пригородах. Выезд по графику ${city.arrivalTime}.`,
    whenCalled: service.typicalCases ?? [],   // если поля нет — пустой массив
    priceContext: service.priceFrom
      ? `В ${city.name} — от ${service.priceFrom} ₽. Финальная цена зависит от площади и сложности.`
      : "Цена рассчитывается по объёму работ.",
    caseScenario: { title: "", description: "" }, // см. ниже про условный рендер
    faq: service.faq?.slice(0, 3) ?? [],
    popularDistricts: city.districts ?? [],
  };
}
```

В компоненте `ServiceInCityPage` сделать условный рендер для секций, где у дефолта пусто:
- секция «Реальный сценарий» — рендерить только если `sc.caseScenario.title`;
- секция «Когда вызывают» — только если `sc.whenCalled.length > 0`.

(Список `whenCalled`/полей выверим по фактическим типам `Service` при имплементации; если части полей нет — берём пустой массив, чтобы fallback всегда был валиден.)

---

## Задача 3 — 6 новых записей в `src/data/serviceInCity.ts`

Существующие 3 пары `*/unichtozhenie-tarakanov` для Симф/Сев/Сочи **не трогаем**.

Добавляем 6 записей:

```
simferopol / obrabotka-uchastkov-ot-kleschey
sevastopol / obrabotka-uchastkov-ot-kleschey
sochi      / obrabotka-uchastkov-ot-kleschey
simferopol / posle-pozhara
sevastopol / posle-pozhara
sochi      / posle-pozhara
```

### Содержание «Обработка участков» (зонтичная)

`h1`, `metaTitle`, `metaDescription`, `localOffer` подают услугу как **комплексную обработку участка**, охватывающую:

- клещи (акарицидная)
- комары и мошка
- муравьи
- мухи
- кроты и грызуны на участке
- **борщевик** (выкос + обработка гербицидом против отрастания)

`whenCalled` — 5 ситуаций под город (Симф/Сев — сезон клещей в горном Крыму и Балаклавской долине; Сочи — субтропики, комары и мошка круглый год, мухи у частных домов).

`localOffer` упоминает локальные посёлки/районы:
- Симферополь — Залесье, Заречное, Чистенькое, дачные массивы у Аянского водохранилища.
- Севастополь — Балаклава, Инкерман, СНТ на Северной стороне.
- Сочи — Адлер, Хоста, Лазаревское, Красная Поляна.

`priceContext` — от 3000 ₽ (`service.priceFrom`), пояснение что в цену входит и про обработку борщевика отдельной строкой.

`caseScenario` — реальный сценарий (200–300 слов) под город: участок с борщевиком + клещами / СНТ с массовой обработкой / частный дом у леса.

`faq` — 5 вопросов: «когда обрабатывать от клещей в Крыму?», «безопасно ли для пчёл/детей/животных?», «как часто повторять?», «работаете ли с борщевиком и почему его нельзя просто скосить?», «нужна ли обработка зимой».

`popularDistricts` — 5–7 районов/посёлков города.

`localPricing` — `{ from: 3000, unit: "сотка" }` или диапазон под город.

### Содержание «После пожара»

Структура та же, по образцу существующих `krasnodar/posle-pozhara` и `rostov-na-donu/posle-pozhara`. Локальная специфика:
- Симферополь — старый фонд в центре, частный сектор Марьино/Каменка.
- Севастополь — пятиэтажки на Северной стороне, дачи Балаклавы.
- Сочи — высотки Адлера, гостевые дома, отели.

Все поля (`whenCalled`, `priceContext`, `caseScenario`, `faq`, `popularDistricts`, `localPricing`) заполняются под город.

---

## Sitemap

Никаких изменений не требуется — `getAllRoutes` уже фильтрует по `isReady !== false` и автоматически подхватит 6 новых пар (по умолчанию `isReady` не задан → попадают в sitemap). Дефолтные fallback-страницы из задачи 2 в `serviceInCity` не лежат, поэтому в sitemap не попадают — то, что нужно.

---

## Проверка после имплементации

1. `/cities/sochi` → клик по любой плитке в секции «Какие работы выполняем» → URL вида `/cities/sochi/...`, страница открывается.
2. `/cities/sochi/obrabotka-uchastkov-ot-kleschey` → уникальный H1 «… в Сочи», локальный кейс, упоминание борщевика, FAQ про субтропики.
3. `/cities/anapa/udalenie-pleseni` (пара без уникального контента) → раньше 404, теперь открывается с дефолтным шаблоном без секций «Кейс»/«Когда вызывают».
4. `/lp/simferopol/obrabotka-uchastkov-ot-kleschey` → рекламный лендинг рендерится (использует тот же `serviceInCity`).
5. `npm run build` зелёный, prerender 9 целевых URL завершается без ошибок.
