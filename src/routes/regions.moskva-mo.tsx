import { createFileRoute, Link } from "@tanstack/react-router";
import { cities } from "@/data/cities";
import { PageHero } from "@/components/site/PageHero";
import { Card } from "@/components/ui/card";
import geographyImg from "@/assets/regions-cover.jpg";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/regions/moskva-mo")({
  head: () => {
    const path = "/regions/moskva-mo";
    const canonical = buildCanonical(path);
    const title = "Санитарные услуги в Москве и Московской области — 24/7";
    const description =
      "Санитарная служба по Москве и МО: уборка после пожара, дезинфекция после смерти, фумигация, удаление плесени. Дежурные бригады, выезд 24/7.";
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
            buildBreadcrumbSchema([
              { label: "Регионы", path: "/regions" },
              { label: "Москва и МО", path },
            ]),
          ]),
        },
      ],
    };
  },
  component: MoskvaMoPage,
});

function MoskvaMoPage() {
  const list = cities.filter(
    (c) => c.region === "Москва" || c.region === "Московская область",
  );
  return (
    <article>
      <PageHero
        backgroundImage={geographyImg}
        breadcrumbs={[{ label: "Регионы" }, { label: "Москва и МО" }]}
        title="Санитарные услуги в Москве и Московской области"
        description="Столичный филиал и региональные бригады по Подмосковью. Выезд 24/7 по всем округам Москвы и городам МО — от Химок и Балашихи до Сергиева Посада. Работаем с УК, страховыми, коммерческой недвижимостью и частным сектором."
      />
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Link key={c.slug} to="/cities/$citySlug" params={{ citySlug: c.slug }}>
              <Card className="h-full p-6 transition hover:border-accent hover:shadow-lg">
                <h2 className="font-display text-xl font-bold">{c.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.intro}</p>
                <div className="mt-3 text-xs text-accent">Выезд: {c.arrivalTime}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
