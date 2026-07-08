## Цель

1. Добавить на каждой city×service странице два блока внутренней перелинковки:
   - «Другие услуги {в городе}» — 4–6 карточек-ссылок на релевантные услуги того же города (`/cities/{citySlug}/{otherService}`), с человекочитаемыми анкорами.
   - «Читайте в блоге» — 2–3 ссылки на посты из `src/data/blog.ts`, релевантные текущей услуге, с якорями к конкретным разделам постов (`#kak-razvivaetsya-plesen` и т.п.).
2. Провести аудит вхождения GEO-запросов (частота, склонения, переспам) в шаблонных текстах city×service и в 4 постах блога, устранить перекосы.

## 1. Внутренние ссылки на city×service

### 1a. Блок «Другие услуги {в городе}»

- Новый компонент `src/components/site/RelatedCityServices.tsx`.
- Логика выбора релевантных услуг — новая функция `getRelatedServices(currentServiceSlug)` в `src/lib/relatedContent.ts`, основана на явной таблице соседей по кластерам (уборка↔дезинфекция↔запах, потоп↔плесень↔запах, пожар↔запах↔сажа, дезинсекция↔дератизация↔дезинфекция и т.д.). Возвращает 4–6 услуг, отсортированных по релевантности.
- Ссылки строятся как `/cities/{city.slug}/{other.slug}` только если для данного города есть маршрут (в `router` уже все city×service активны, дополнительной проверки не нужно).
- Анкор — «{shortName} {city.nameLocative}» (например, «Удаление плесени в Сочи», «Дезинфекция после потопа в Ялте»), плюс подпись `service.tagline`/first-line intro.

### 1b. Блок «Читайте в блоге»

- В `src/lib/relatedContent.ts` — таблица `SERVICE_TO_BLOG` вида
  ```
  posle-potopa      → [plesen-posle-zatopleniya#kak-razvivaetsya, plesen-posle-zatopleniya#kakie-materialy]
  udalenie-pleseni  → [plesen-posle-zatopleniya#chem-opasna, plesen-posle-zatopleniya#kakie-materialy]
  posle-pozhara     → [chto-delat-posle-pozhara#pervye-24-chasa, chto-delat-posle-pozhara#akt-mchs]
  udalenie-zapaxov  → [chto-delat-posle-pozhara#..., kak-ubrat-zapah-posle-smerti#...]
  fumigaciya, dezinsekciya, dezinfekciya → kogda-nuzhna-fumigaciya + kak-ubrat-zapah-posle-smerti
  ```
- Пост-хединги в `src/data/blog.ts` получат стабильные `id` (slug от `heading`): расширяем тип `body[]` полем `id?: string` и рендерим `<h2 id=…>` в `src/routes/blog.$slug.tsx`.
- В блоке рендерим 2–3 карточки: заголовок = раздел поста, анкор = «Читать: {section} — {postTitle}». `href={/blog/{slug}#{id}}`.

### 1c. Интеграция в `src/routes/cities.$citySlug.$serviceSlug.tsx`

- Вставить оба блока **перед** финальным «Подробнее» и после FAQ, отдельными `<section>` с `h2`.
- Никаких изменений в JSON-LD.
- `trackCityConversion` не задеваем — это не CTA, а SEO-перелинковка.

## 2. Аудит GEO-частот

### 2a. Скрипт `scripts/audit-geo.ts`

Автономный ts-скрипт (запуск: `bunx tsx scripts/audit-geo.ts`), без вмешательства в рантайм. Считает:

- Для каждой из 285 (или сколько сейчас активных) city×service страниц собирает финальный текст, как он рендерится (IntroAnswer + whenCalled + extraSections + priceContext + FAQ) через существующий `buildCityServiceContent` + `getServiceInCity`/`buildDefaultServiceInCity`.
- Токенизирует по нижнему регистру, снимает пунктуацию.
- Метрики:
  - **word count** (уже проверяли — оставим для контроля).
  - **частота топонима** для каждой формы (`{city.name}`, `{city.nameLocative}`, `{city.nameGenitive}` если есть) — считает нормализованное число вхождений на 100 слов.
  - **частота названия услуги** (`service.shortName` в разных склонениях по простому шаблону).
  - **top-10 биграмм** — для быстрого обнаружения переспама («в сочи в сочи», «плесень плесень» и пр.).
- Правила флагов:
  - топоним встречается >2.5% слов → «keyword stuffing city»,
  - услуга встречается >3% → «keyword stuffing service»,
  - любая биграмма >1% → «phrase stuffing»,
  - **отсутствие** топонима в первых 100 словах → «geo signal weak».
- Аналогично прогоняет 4 поста из `blog.ts` — регион («юфо», «крым», «краснодарский край») и города (Сочи, Ростов, Ялта…) — с теми же порогами.
- Печатает отчёт `scripts/audit-geo.report.md` (список страниц/постов, значение метрики, диагноз).

### 2b. Исправление перекосов

- Правки только в `src/lib/cityServiceContent.ts` (шаблоны city×service) и `src/data/blog.ts` (тексты постов) — заменяем повторы синонимами:
  - «{город в локативе}» → часть замен на «в этом районе», «на объекте», «на месте», «у клиента», «в нашей практике {region}» — там, где топоним идёт >2 раз в одном абзаце.
  - имя услуги — часть замен на местоимение/родовое слово («работы», «обработка», «выезд», «бригада»).
  - если GEO-сигнал слабый в начале — добавить топоним в первый абзац `buildFeatures` и в первый параграф каждого поста.
- Целевые пороги после правок:
  - топоним 1.0–2.5% от слов,
  - услуга 1.5–3.0%,
  - максимальная биграмма ≤0.8%,
  - топоним встречается хотя бы 1 раз в первых 80 словах.

### 2c. Валидация

- Повторный прогон `scripts/audit-geo.ts` — должен показать 0 флагов на всех страницах и постах.
- `tsgo --noEmit`.
- Визуальный спот-чек 3 страниц (Сочи/Плесень, Ростов/Потоп, Ялта/Пожар) — тексты читаются естественно.

## Файлы

- **Новые:** `src/lib/relatedContent.ts`, `src/components/site/RelatedCityServices.tsx`, `scripts/audit-geo.ts`.
- **Правки:** `src/routes/cities.$citySlug.$serviceSlug.tsx` (вставка двух блоков), `src/data/blog.ts` (id для заголовков + GEO-балансировка), `src/routes/blog.$slug.tsx` (рендер `id` на h2), `src/lib/cityServiceContent.ts` (снятие переспама).

## Не входит в план

- Не меняю метаданные, canonical, JSON-LD, sitemap.
- Не переписываю услуги (`services.$serviceSlug`) и не трогаю LP-лендинги (`/lp/...`, `noindex`).
- Не добавляю новые посты в блог — работаем с четырьмя существующими.
