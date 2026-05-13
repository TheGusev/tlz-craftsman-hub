import { createFileRoute, Link } from "@tanstack/react-router";
import { cities } from "@/data/cities";
import { PageHero } from "@/components/site/PageHero";
import { Card } from "@/components/ui/card";
import geographyImg from "@/assets/geography.jpg";

export const Route = createFileRoute("/regions/krym")({
  head: () => ({
    meta: [
      { title: "Санитарные услуги в Крыму — региональный хаб" },
      { name: "description", content: "Санитарная служба по всему Крыму: Симферополь, Севастополь, Ялта, Евпатория, Керчь. Дежурные бригады, выезд 24/7." },
      { property: "og:title", content: "Санитарные услуги в Крыму" },
      { property: "og:description", content: "Региональный хаб с выездом по всему полуострову." },
      { property: "og:image", content: geographyImg },
    ],
    links: [{ rel: "canonical", href: "/regions/krym" }],
  }),
  component: KrymPage,
});

function KrymPage() {
  const krym = cities.filter((c) => c.region === "Республика Крым");
  return (
    <article>
      <PageHero
        backgroundImage={geographyImg}
        breadcrumbs={[{ label: "Регионы" }, { label: "Крым" }]}
        title="Санитарные услуги в Крыму"
        description="Симферополь — наш региональный хаб. Из него оперативно выезжаем по всему полуострову. Дежурная бригада 24/7. Работаем с частными лицами, УК, гостиничным сектором и промышленностью."
      />
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {krym.map((c) => (
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
