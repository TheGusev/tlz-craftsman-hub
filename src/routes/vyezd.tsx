import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { LeadForm } from "@/components/site/LeadForm";
import { Truck, Clock, MapPin } from "lucide-react";
import { buildCanonical } from "@/lib/seo";
import { visibleCities as cities } from "@/data/cities";

const PATH = "/vyezd";
const TITLE = "Выезд бригады — зоны, время, стоимость доезда | Санитарные Решения РФ";
const DESC =
  "Аварийные выезды по ЮФО и Крыму. По городу — бесплатно, в радиусе 30 км — фиксированный доезд. Время прибытия от 30 минут.";

export const Route = createFileRoute("/vyezd")({
  component: VyezdPage,
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

const zones = [
  { icon: MapPin, title: "По городу", text: "Бесплатный выезд по черте города в любой район. Время прибытия от 30 минут до 2 часов в зависимости от загрузки." },
  { icon: Truck, title: "Радиус 30 км", text: "Доезд по согласованной ставке (800 ₽). Прибытие в среднем 1–2 часа." },
  { icon: Clock, title: "Радиус 30–150 км", text: "Расчёт индивидуально по километражу и времени. Прибытие 2–4 часа. Для регионов Крыма — отдельные ставки." },
];

function VyezdPage() {
  return (
    <>
      <PageHero
        eyebrow="Выезд бригады"
        title="Аварийные выезды 24/7 по ЮФО и Крыму"
        description="Дежурные бригады в каждом крупном городе региона. Прибытие от 30 минут."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Выезд бригады" }]}
      />
      <section className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {zones.map((z) => {
              const Icon = z.icon;
              return (
                <article key={z.title} className="rounded-2xl border border-border bg-card p-5">
                  <Icon className="h-7 w-7 text-accent" aria-hidden />
                  <h2 className="mt-3 font-display text-base font-semibold">{z.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{z.text}</p>
                </article>
              );
            })}
          </div>

          <div>
            <h2 className="font-display text-xl font-bold">Города выезда</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Дежурные бригады работают в крупнейших городах ЮФО и Крыма. В каждом городе — свой автопарк, склад препаратов и оборудование.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {cities.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/cities/${c.slug}`}
                    className="block rounded-lg border border-border bg-card px-3 py-2 hover:border-accent hover:text-accent"
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="font-display text-xl font-bold">Как мы работаем при экстренных вызовах</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Принимаем звонок 24/7, диспетчер в течение 5 минут оценивает ситуацию.</li>
              <li>Подбираем ближайшую бригаду с нужным оборудованием и препаратами.</li>
              <li>Согласовываем время приезда и ориентировочную стоимость.</li>
              <li>Прибываем, обследуем объект, окончательно фиксируем смету в договоре.</li>
              <li>Выполняем работы, сдаём по акту, выдаём чек ОФД и фото «до/после».</li>
            </ol>
          </div>
        </div>
        <aside>
          <div className="sticky top-24">
            <h2 className="font-display text-lg font-semibold">Вызвать бригаду</h2>
            <div className="mt-3">
              <LeadForm source="vyezd_page" />
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
