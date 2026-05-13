import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { cities } from "@/data/cities";
import { PageHero } from "@/components/site/PageHero";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/cities")({
  head: () => ({
    meta: [
      { title: "Города присутствия — Санитарные Решения РФ" },
      { name: "description", content: "Санитарная служба в Краснодаре, Сочи, Ростове-на-Дону и по всему Крыму. Дежурные бригады 24/7." },
      { property: "og:title", content: "Города присутствия санитарной службы" },
      { property: "og:description", content: "ЮФО и Крым — 8 городов, выезд бригады 1–5 часов." },
    ],
    links: [{ rel: "canonical", href: "/cities" }],
  }),
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
      description="Дежурные бригады в Краснодарском крае, Ростовской области и Республике Крым. Региональный хаб по Крыму обеспечивает выезд во все ключевые города полуострова."
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
  );
}
