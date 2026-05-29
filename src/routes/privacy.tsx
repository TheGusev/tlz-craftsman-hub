import { createFileRoute } from "@tanstack/react-router";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const canonical = buildCanonical("/privacy");
    return {
      meta: [
        { title: "Политика конфиденциальности — Санитарные Решения РФ" },
        {
          name: "description",
          content: "Политика обработки персональных данных пользователей сайта Санитарные Решения РФ: цели сбора, состав данных, сроки хранения и права субъекта.",
        },
        { name: "robots", content: "noindex, follow" },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
      <h1 className="font-display text-3xl font-bold md:text-4xl">
        Политика конфиденциальности
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Редакция от {new Date().toLocaleDateString("ru-RU")}
      </p>

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <h2>1. Общие положения</h2>
        <p>
          Настоящая Политика регулирует обработку персональных данных
          пользователей сайта Санитарные Решения РФ в соответствии с
          Федеральным законом № 152-ФЗ «О персональных данных».
        </p>

        <h2>2. Какие данные мы собираем</h2>
        <ul>
          <li>имя и контактный телефон, указанные в форме заявки;</li>
          <li>город, тип объекта, описание проблемы и фото / видео;</li>
          <li>технические данные: IP-адрес, cookie, источник перехода.</li>
        </ul>

        <h2>3. Цели обработки</h2>
        <ul>
          <li>обработка заявки и согласование выезда бригады;</li>
          <li>обратный звонок и переписка в WhatsApp;</li>
          <li>аналитика качества сервиса и каналов привлечения.</li>
        </ul>

        <h2>4. Передача данных третьим лицам</h2>
        <p>
          Данные не передаются третьим лицам, кроме операторов связи и
          сервисов аналитики (Яндекс.Метрика, Google Analytics) в обезличенном
          виде.
        </p>

        <h2>5. Хранение и удаление</h2>
        <p>
          Данные хранятся не дольше, чем требуется для исполнения договора и
          выполнения требований законодательства. По запросу пользователь может
          потребовать удаления своих данных.
        </p>

        <h2>6. Контакты</h2>
        <p>
          Запросы по обработке данных направляйте на электронную почту,
          указанную на странице{" "}
          <a className="text-accent hover:underline" href="/contacts">
            контактов
          </a>
          .
        </p>
      </div>
    </main>
  );
}
