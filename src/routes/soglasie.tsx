import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { buildCanonical } from "@/lib/seo";
import { SITE_NAME, SITE_EMAIL } from "@/lib/site";

const PATH = "/soglasie";
const TITLE = `Согласие на обработку персональных данных — ${SITE_NAME}`;
const DESC = "Согласие на обработку персональных данных по ФЗ-152 «О персональных данных»: цели, состав сведений, срок действия и порядок отзыва согласия.";

export const Route = createFileRoute("/soglasie")({
  component: SoglasiePage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:url", content: buildCanonical(PATH) },
      { name: "robots", content: "noindex, follow" },

    ],
    links: [{ rel: "canonical", href: buildCanonical(PATH) }],
  }),
});

function SoglasiePage() {
  return (
    <>
      <PageHero
        eyebrow="Документы"
        title="Согласие на обработку персональных данных"
        description="В соответствии с Федеральным законом № 152-ФЗ «О персональных данных»."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Согласие на ОПД" }]}
      />
      <section className="container mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed">
        <article className="space-y-5">
          <p>
            Оставляя заявку, оформляя обратный звонок или отправляя сообщение через формы на сайте
            {" "}{SITE_NAME}, вы выражаете согласие на обработку персональных данных в порядке и на условиях,
            установленных Федеральным законом № 152-ФЗ.
          </p>

          <h2 className="font-display text-lg font-bold">1. Состав данных</h2>
          <p>
            Обрабатываются: имя, контактный телефон, e-mail, адрес объекта, сведения об оказываемой
            услуге, текст сообщения, технические данные браузера (cookies, IP, UTM-метки).
          </p>

          <h2 className="font-display text-lg font-bold">2. Цели обработки</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>обработка обращения и согласование оказания услуги;</li>
            <li>заключение и исполнение договора, выставление счетов и закрывающих документов;</li>
            <li>информирование о статусе заявки, акциях и сезонных предложениях;</li>
            <li>аналитика эффективности рекламы (Яндекс.Метрика, Google Analytics).</li>
          </ul>

          <h2 className="font-display text-lg font-bold">3. Срок и способ хранения</h2>
          <p>
            Данные хранятся в защищённых информационных системах Исполнителя в течение 3 лет
            с момента последнего обращения. По истечении срока — обезличиваются или удаляются.
          </p>

          <h2 className="font-display text-lg font-bold">4. Передача третьим лицам</h2>
          <p>
            Данные не передаются третьим лицам, кроме операторов связи и платёжных систем
            (для подтверждения коммуникации и платежей), а также при наличии законного запроса
            уполномоченных органов.
          </p>

          <h2 className="font-display text-lg font-bold">5. Отзыв согласия</h2>
          <p>
            Вы вправе отозвать согласие в любой момент, направив запрос на e-mail{" "}
            <a href={`mailto:${SITE_EMAIL}`} className="text-accent hover:underline">
              {SITE_EMAIL}
            </a>
            . Согласие отзывается в течение 10 рабочих дней.
          </p>
        </article>
      </section>
    </>
  );
}
