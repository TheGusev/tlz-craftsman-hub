import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { Card } from "@/components/ui/card";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/prices")({
  head: () => {
    const path = "/prices";
    const canonical = buildCanonical(path);
    const title = "Цены на санитарные работы — прайс-лист";
    const description = "Цены на уборку после пожара, потопа, удаление плесени, дезинфекцию, фумигацию. Бесплатный выезд для оценки.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: buildGraphHead([
            buildWebPageSchema({ path, name: title, description }),
            buildBreadcrumbSchema([{ label: "Цены", path }]),
          ]),
        },
      ],
    };
  },
  component: PricesPage,
});

const rows = [
  { service: "Уборка после пожара", from: "от 35 000 ₽", note: "квартира 50 м²" },
  { service: "Уборка после потопа, просушка", from: "от 25 000 ₽", note: "квартира 50 м²" },
  { service: "Удаление запаха гари (озонирование)", from: "от 12 000 ₽", note: "помещение до 50 м²" },
  { service: "Дезинфекция после смерти", from: "от 22 000 ₽", note: "1-комн. квартира" },
  { service: "Удаление трупного запаха", from: "от 15 000 ₽", note: "комната" },
  { service: "Фумигация", from: "от 80 000 ₽", note: "склад 500 м³" },
  { service: "Удаление плесени", from: "от 7 500 ₽", note: "санузел" },
  { service: "Санобработка помещений (дезинсекция)", from: "от 4 500 ₽", note: "квартира до 50 м²" },
  { service: "Очистка участков, вывоз мусора", from: "от 18 000 ₽", note: "до 100 м²" },
];

function PricesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: "Цены" }]} />
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Цены на санитарные работы</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">Цены ориентировочные. Точная стоимость зависит от объёма работ и согласовывается до выезда. Выезд для оценки — бесплатно.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Услуга</th>
                <th className="px-4 py-3 font-semibold">Стоимость</th>
                <th className="px-4 py-3 font-semibold">Базовый объём</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3">{r.service}</td>
                  <td className="px-4 py-3 font-semibold text-accent">{r.from}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div>
          <h2 className="mb-4 font-display text-xl font-bold">Получить точный расчёт</h2>
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
