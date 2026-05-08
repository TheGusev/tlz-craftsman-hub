import { createFileRoute, Link } from "@tanstack/react-router";
import { cities } from "@/data/cities";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/regions/krym")({
  head: () => ({
    meta: [
      { title: "Санитарные услуги в Крыму — региональный хаб" },
      { name: "description", content: "Санитарная служба по всему Крыму: Симферополь, Севастополь, Ялта, Евпатория, Керчь. Дежурные бригады, выезд 24/7." },
      { property: "og:title", content: "Санитарные услуги в Крыму" },
      { property: "og:description", content: "Региональный хаб с выездом по всему полуострову." },
    ],
    links: [{ rel: "canonical", href: "/regions/krym" }],
  }),
  component: KrymPage,
});

function KrymPage() {
  const krym = cities.filter((c) => c.region === "Республика Крым");
  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: "Регионы" }, { label: "Крым" }]} />
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Санитарные услуги в Крыму</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">Симферополь — наш региональный хаб. Из него оперативно выезжаем по всему полуострову. Дежурная бригада 24/7. Работаем с частными лицами, УК, гостиничным сектором и промышленностью.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {krym.map((c) => (
          <Link key={c.slug} to="/cities/$citySlug" params={{ citySlug: c.slug }}>
            <Card className="p-6 transition hover:border-accent">
              <h2 className="font-display text-xl font-bold">{c.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.intro}</p>
              <div className="mt-3 text-xs text-accent">Выезд: {c.arrivalTime}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
