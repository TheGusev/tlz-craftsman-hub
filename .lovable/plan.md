## Подтверждение прав в Яндекс.Вебмастере для sanitarnyeresheniya.ru

### Изменение

Создать файл `public/yandex_8f3e37822bd87898.html`:

```html
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: 8f3e37822bd87898</body>
</html>
```

Всё, что лежит в `public/`, раздаётся из корня сайта на всех подключённых доменах.

### Дальше (вне кода)

1. Нажать **Publish / Update** — без публикации новый файл не появится на проде.
2. Проверить, что открывается: `https://sanitarnyeresheniya.ru/yandex_8f3e37822bd87898.html` — должна быть строка `Verification: 8f3e37822bd87898`.
3. В Яндекс.Вебмастере нажать **«Подтвердить»**.

### Запасной вариант

В `src/routes/__root.tsx` уже подключён meta-тег `yandex-verification` через переменную `VITE_YANDEX_VERIFICATION`. Если по какой-то причине файл не подойдёт, можно задать `VITE_YANDEX_VERIFICATION=8f3e37822bd87898` в `.env` и выбрать в Вебмастере способ подтверждения через meta-тег. Но при наличии HTML-файла этого не требуется.
