import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { buildCanonical } from "@/lib/seo";
import { SITE_NAME, SITE_PHONE, SITE_EMAIL } from "@/lib/site";

const PATH = "/rekvizity";
const TITLE = `Реквизиты ИП Посохова А. Н. — ${SITE_NAME}`;
const DESC = "Реквизиты индивидуального предпринимателя Посоховой А. Н. (ИНН 503220067144, ОГРНИП 324508100153350) и данные лицензии Роспотребнадзора для договоров и оплаты по безналу.";

export const Route = createFileRoute("/rekvizity")({
  component: RekvizityPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:url", content: buildCanonical(PATH) },
    ],
    links: [{ rel: "canonical", href: buildCanonical(PATH) }],
  }),
});

const rows: Array<[string, string]> = [
  ["Полное наименование", "ООО «Санитарные Решения РФ»"],
  ["Сокращённое наименование", "ООО «СР РФ»"],
  ["Юридический адрес", "350000, г. Краснодар, ул. Красная, 1, оф. 12"],
  ["Почтовый адрес", "350000, г. Краснодар, ул. Красная, 1, оф. 12"],
  ["ИНН", "2300000000"],
  ["КПП", "230001001"],
  ["ОГРН", "1232300000000"],
  ["ОКПО", "00000000"],
  ["ОКВЭД", "81.29.1 — Дезинфекция, дезинсекция, дератизация"],
  ["Расчётный счёт", "40702810800000000000"],
  ["Банк", "ПАО «Сбербанк»"],
  ["БИК", "040349602"],
  ["Корр. счёт", "30101810100000000602"],
  ["Генеральный директор", "Иванов И. И., действует на основании Устава"],
  ["Телефон", SITE_PHONE],
  ["E-mail", SITE_EMAIL],
];

function RekvizityPage() {
  return (
    <>
      <PageHero
        eyebrow="Документы"
        title="Реквизиты компании"
        description="Для оформления договоров, счетов и оплаты по безналичному расчёту."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Реквизиты" }]}
      />
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-border last:border-b-0">
                  <th scope="row" className="w-1/2 bg-muted/40 px-4 py-3 text-left font-semibold">
                    {k}
                  </th>
                  <td className="px-4 py-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Реквизиты для счетов и договоров вышлем в WhatsApp или на e-mail по запросу.
        </p>
      </section>
    </>
  );
}
