import { createFileRoute, Link } from "@tanstack/react-router";
import { services } from "@/data/services";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги — Санитарные Решения РФ" },
      { name: "description", content: "Каталог санитарных услуг: уборка после пожара, потопа, удаление плесени, дезинфекция, фумигация, очистка участков." },
      { property: "og:title", content: "Услуги санитарной службы" },
      { property: "og:description", content: "8 направлений санитарных работ по ЮФО и Крыму." },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  const clusters = Array.from(new Set(services.map((s) => s.cluster)));
  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: "Услуги" }]} />
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Все санитарные услуги</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">8 направлений работ — от аварийной уборки после ЧС до плановой дезинфекции и фумигации объектов любого масштаба.</p>
      {clusters.map((cluster) => (
        <div key={cluster} className="mt-12">
          <h2 className="font-display text-2xl font-bold">{cluster}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.filter((s) => s.cluster === cluster).map((s) => (
              <Card key={s.slug} className="flex flex-col gap-3 p-6 transition hover:border-accent">
                <h3 className="font-display text-lg font-bold">{s.name}</h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">{s.intro}</p>
                <Link to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} className="mt-auto text-sm font-semibold text-accent hover:underline">Подробнее →</Link>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
