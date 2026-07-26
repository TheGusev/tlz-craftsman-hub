import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import geographyImg from "@/assets/regions-cover.jpg";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/regions")({
  head: () => {
    const path = "/regions";
    const canonical = buildCanonical(path);
    const title = "Регионы присутствия — Санитарные Решения РФ";
    const description = "Региональные хабы санитарной службы: ЮФО (Краснодарский край, Ростовская область) и Республика Крым.";
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
            buildBreadcrumbSchema([{ label: "Регионы", path }]),
          ]),
        },
      ],
    };
  },
  component: RegionsHub,
});

const regions = [
  {
    slug: "moskva-mo",
    name: "Москва и Московская область",
    description:
      "Столичный филиал и региональные бригады по Подмосковью. Выезд по всем округам Москвы и городам МО 24/7.",
    cities: ["Москва", "Химки", "Балашиха", "Мытищи", "Подольск", "Королёв", "Одинцово", "Красногорск"],
    to: "/regions/moskva-mo" as const,
  },
];

function RegionsHub() {
  const { pathname } = useLocation();
  if (pathname.replace(/\/$/, "") !== "/regions") {
    return <Outlet />;
  }
  return (
    <main>
      <PageHero
        backgroundImage={geographyImg}
        title="Регионы присутствия"
        description="Работаем по Москве и Московской области. Дежурные бригады, выезд 24/7, единый стандарт обслуживания."
      />

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
        </div>
      </section>
    </main>
  );
}
