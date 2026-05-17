import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Award, FileBadge, ShieldCheck, Microscope } from "lucide-react";
import { buildCanonical } from "@/lib/seo";

const PATH = "/licenzii";
const TITLE = "Лицензии и сертификаты — Санитарные Решения РФ";
const DESC =
  "Свидетельства и допуски на санитарную обработку, фумигацию, биологическую очистку. Сертифицированные препараты и обученный персонал.";

export const Route = createFileRoute("/licenzii")({
  component: LicenziiPage,
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

const docs = [
  {
    icon: ShieldCheck,
    title: "Лицензия Роспотребнадзора",
    text: "№ 50.99.08.003.Л.000121.03.25 (ЕРУЛ № Л064-00111-50/01983212) от 12.03.2025 г. Выдана Управлением Роспотребнадзора по Московской области (приказ № 216 от 12.03.2025). Статус — действующая. Виды работ: дезинфекция, дезинсекция, дератизация.",
  },
  {
    icon: FileBadge,
    title: "Регистрация ИП",
    text: "Индивидуальный предприниматель Посохова Анна Николаевна. ОГРНИП 324508100153350, ИНН 503220067144. ОКВЭД 81.29.1 — деятельность по чистке и уборке прочая.",
  },
  {
    icon: Microscope,
    title: "Препараты и средства",
    text: "Используем только препараты, прошедшие государственную регистрацию в РФ и внесённые в Реестр Роспотребнадзора. На каждый препарат предоставляем паспорт безопасности по запросу.",
  },
  {
    icon: Award,
    title: "Договор и гарантии",
    text: "Работаем по официальному договору с актом выполненных работ. На каждый вид обработки выдаём гарантийный талон с описанием регламента и сроков.",
  },
];

function LicenziiPage() {
  return (
    <>
      <PageHero
        eyebrow="Лицензии"
        title="Работаем по лицензиям и сертификатам"
        description="Все обработки соответствуют действующим СанПиН. Применяем препараты, разрешённые в РФ."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Лицензии" }]}
      />
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {docs.map((d) => {
            const Icon = d.icon;
            return (
              <article key={d.title} className="rounded-2xl border border-border bg-card p-6">
                <Icon className="h-8 w-8 text-accent" aria-hidden />
                <h2 className="mt-3 font-display text-base font-semibold">{d.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d.text}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="font-display text-xl font-bold">Препараты и оборудование</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Используем только препараты, прошедшие государственную регистрацию в РФ
            и внесённые в Реестр Роспотребнадзора. На каждый препарат предоставляем паспорт безопасности.
            Оборудование — генераторы холодного и горячего тумана, парогенераторы,
            промышленные осушители, озонаторы, ULV-распылители — обслуживается по графику.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Сканы документов и сертификаты предоставляем по запросу — позвоните или
            оставьте заявку, отправим в WhatsApp или на e-mail.
          </p>
        </div>
      </section>
    </>
  );
}
