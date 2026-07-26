import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { visibleCities as cities } from "@/data/cities";
import { PageHero } from "@/components/site/PageHero";
import { Card } from "@/components/ui/card";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/cities")({
  head: () => {
    const path = "/cities";
    const canonical = buildCanonical(path);
    const title = "Города присутствия: Москва и МО — Санитарные Решения";
    const description = "Санитарная служба в Москве и Московской области. Дежурные бригады 24/7, выезд от 60 минут, договор и гарантия.";
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
            buildBreadcrumbSchema([{ label: "Города", path }]),
          ]),
        },
      ],
    };
  },
  component: CitiesIndex,
});

function CitiesIndex() {
  const { pathname } = useLocation();
  if (pathname.replace(/\/$/, "") !== "/cities") {
    return <Outlet />;
  }
  return (
    <>
    <PageHero
      breadcrumbs={[{ label: "Города" }]}
      title="Города присутствия"
      description="Дежурные бригады в Москве и Московской области. Столичный филиал работает круглосуточно: выезд по всем округам Москвы и городам Подмосковья."
    />
    <div className="container mx-auto px-4 py-10 md:py-12">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => (
          <Link key={c.slug} to="/cities/$citySlug" params={{ citySlug: c.slug }}>
            <Card className="p-6 transition hover:border-accent">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">{c.region}</div>
              <h2 className="mt-2 font-display text-xl font-bold">{c.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.intro}</p>
              <div className="mt-3 text-xs text-muted-foreground">Выезд: {c.arrivalTime}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
