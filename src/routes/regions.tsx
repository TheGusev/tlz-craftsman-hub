import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import geographyImg from "@/assets/geography.jpg";

export const Route = createFileRoute("/regions")({
  head: () => ({
    meta: [
      { title: "Регионы присутствия — Санитарные Решения РФ" },
      {
        name: "description",
        content:
          "Региональные хабы санитарной службы: ЮФО (Краснодарский край, Ростовская область) и Республика Крым.",
      },
      {
        property: "og:title",
        content: "Регионы присутствия — Санитарные Решения РФ",
      },
      {
        property: "og:description",
        content:
          "Дежурные бригады по ЮФО и Крыму. Региональные хабы с выездом 24/7.",
      },
    ],
    links: [{ rel: "canonical", href: "/regions" }],
  }),
  component: RegionsHub,
});

const regions = [
  {
    slug: "krym",
    name: "Республика Крым",
    description:
      "Региональный хаб по Крыму с выездом в Симферополь, Севастополь, Ялту, Евпаторию и Керчь.",
    cities: ["Симферополь", "Севастополь", "Ялта", "Евпатория", "Керчь"],
    to: "/regions/krym" as const,
  },
];

function RegionsHub() {
  return (
    <main>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${geographyImg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/85 to-primary" />
        <div className="container relative mx-auto px-4 py-14 md:py-20">
          <h1 className="font-display text-3xl font-bold md:text-5xl">
            Регионы присутствия
          </h1>
          <p className="mt-4 max-w-2xl text-base opacity-90 md:text-lg">
            Работаем по ЮФО и Крыму. Региональные хабы с дежурными бригадами,
            выезд 24/7, единый стандарт обслуживания.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((r) => (
            <Card key={r.slug} className="flex flex-col p-6">
              <h2 className="font-display text-xl font-bold">{r.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {r.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                {r.cities.map((c) => (
                  <li
                    key={c}
                    className="rounded-full bg-muted px-3 py-1 text-muted-foreground"
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <Link
                to={r.to}
                className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-secondary hover:text-accent"
              >
                Перейти в региональный хаб <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
          <Card className="flex flex-col justify-center border-dashed p-6 text-center">
            <h2 className="font-display text-base font-bold text-muted-foreground">
              Краснодарский край и Ростовская область
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Пока представлены через хаб{" "}
              <Link to="/cities" className="text-accent hover:underline">
                городов
              </Link>{" "}
              — Краснодар, Сочи, Ростов-на-Дону.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
