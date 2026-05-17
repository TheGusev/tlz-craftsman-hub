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
  ["Полное наименование", "Индивидуальный предприниматель Посохова Анна Николаевна"],
  ["Сокращённое наименование", "ИП Посохова А. Н."],
  ["Юридический адрес", "143072, Московская обл., г. Одинцово, п. ВНИИССОК, ул. Берёзовая, д. 4, кв. 9"],
  ["Адрес осуществления деятельности", "Московская обл., Одинцовский г.о., г. Одинцово, ул. Садовая, д. 3Б, пом. № 912"],
  ["ИНН", "503220067144"],
  ["ОГРНИП", "324508100153350"],
  ["ОКВЭД (осн.)", "81.29.1 — Дезинфекция, дезинсекция, дератизация"],
  [
    "Лицензия",
    "№ 50.99.08.003.Л.000121.03.25 (ЕРУЛ № Л064-00111-50/01983212) от 12.03.2025 г., статус — действующая",
  ],
  ["Лицензирующий орган", "Управление Роспотребнадзора по Московской области"],
  ["Приказ о выдаче лицензии", "№ 216 от 12.03.2025 г."],
  [
    "Виды лицензируемых работ",
    "Услуги по дезинфекции, дезинсекции и дератизации в целях обеспечения санитарно-эпидемиологического благополучия населения",
  ],
  ["Банковские реквизиты", "Предоставляются по запросу для оплаты по безналичному расчёту"],
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
