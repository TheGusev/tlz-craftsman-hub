import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { LeadForm } from "@/components/site/LeadForm";
import { ShieldCheck, FileCheck2, RotateCcw, Award } from "lucide-react";
import { buildCanonical } from "@/lib/seo";

const PATH = "/garantii";
const TITLE = "Гарантии на санитарные работы — 6 и 12 месяцев | Санитарные Решения РФ";
const DESC =
  "Гарантия 6–12 месяцев на дезинфекцию, фумигацию, удаление плесени и запахов. Повторный выезд за наш счёт. Договор и акт выполненных работ.";

export const Route = createFileRoute("/garantii")({
  component: GarantiiPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: buildCanonical(PATH) },
    ],
    links: [{ rel: "canonical", href: buildCanonical(PATH) }],
  }),
});

const items = [
  {
    icon: ShieldCheck,
    title: "Гарантия 6 месяцев на стандартные обработки",
    text: "Дезинсекция, дератизация, ароматизация, ультразвуковая обработка — гарантия 6 месяцев с момента подписания акта. Если в течение срока проблема возвращается — выезжаем повторно бесплатно.",
  },
  {
    icon: Award,
    title: "Гарантия 12 месяцев на комплексные работы",
    text: "Удаление плесени с обработкой каркаса, фумигация трюма, биологическая очистка после ЧС — гарантия 12 месяцев. Включает контрольный замер и фотофиксацию.",
  },
  {
    icon: RotateCcw,
    title: "Повторный выезд за наш счёт",
    text: "Если результат не достигнут или насекомые/грибок появились снова в гарантийный срок — приезжаем бесплатно, перепроверяем условия эксплуатации, проводим повторную обработку без доплат.",
  },
  {
    icon: FileCheck2,
    title: "Договор и акт выполненных работ",
    text: "Заключаем письменный договор. По окончании выдаём акт, чек ОФД, фото «до/после», паспорта применённых препаратов. Для юр.лиц — пакет закрывающих документов, в т.ч. УПД.",
  },
];

function GarantiiPage() {
  return (
    <>
      <PageHero
        eyebrow="Гарантии"
        title="Отвечаем за результат — гарантия до 12 месяцев"
        description="Подписываем договор, фиксируем результат, при необходимости приезжаем повторно бесплатно."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Гарантии" }]}
      />
      <section className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <article key={it.title} className="rounded-2xl border border-border bg-card p-6">
                  <Icon className="h-8 w-8 text-accent" aria-hidden />
                  <h2 className="mt-3 font-display text-lg font-semibold">{it.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{it.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="font-display text-xl font-bold">Что не входит в гарантию</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Повторное заражение по причине внешних источников (соседи, протечки, нарушение санитарных норм после обработки).</li>
              <li>• Самостоятельные дополнительные обработки бытовыми средствами в гарантийный срок.</li>
              <li>• Изменение условий эксплуатации (затопление, пожар, перепланировка) после сдачи работ.</li>
            </ul>
            <p className="mt-4 text-sm">
              Полные условия гарантии — в{" "}
              <Link to="/oferta" className="text-accent hover:underline">
                публичной оферте
              </Link>
              .
            </p>
          </div>
        </div>
        <aside>
          <div className="sticky top-24">
            <h2 className="font-display text-lg font-semibold">Получить расчёт с гарантией</h2>
            <div className="mt-3">
              <LeadForm source="garantii_page" />
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
