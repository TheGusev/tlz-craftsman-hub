import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { services } from "@/data/services";
import { PageHero } from "@/components/site/PageHero";
import { Card } from "@/components/ui/card";
import { getServiceImage } from "@/lib/serviceImages";
import { ArrowRight } from "lucide-react";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () => {
    const path = "/services";
    const canonical = buildCanonical(path);
    const title = "Услуги — Санитарные Решения РФ";
    const description = "Каталог санитарных услуг: уборка после пожара, потопа, удаление плесени, дезинфекция, фумигация, очистка участков.";
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
            buildBreadcrumbSchema([{ label: "Услуги", path }]),
          ]),
        },
      ],
    };
  },
  component: ServicesIndex,
});

function ServicesIndex() {
  const { pathname } = useLocation();
  if (pathname.replace(/\/$/, "") !== "/services") {
    return <Outlet />;
  }
  const clusters = Array.from(new Set(services.map((s) => s.cluster)));
  return (
    <>
    <PageHero
      breadcrumbs={[{ label: "Услуги" }]}
      title="Все санитарные услуги"
      description="8 направлений работ — от аварийной уборки после ЧС до плановой дезинфекции и фумигации объектов любого масштаба."
    />
    <div className="container mx-auto px-4 py-10 md:py-12">
      {clusters.map((cluster) => (
        <div key={cluster} className="mt-10 md:mt-12 first:mt-0">
          <h2 className="font-display text-2xl font-bold">{cluster}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.filter((s) => s.cluster === cluster).map((s) => {
              const img = getServiceImage(s.slug);
              return (
                <Card key={s.slug} className="group flex flex-col overflow-hidden p-0 transition hover:border-accent hover:shadow-lg">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {img ? (
                      <img src={img} alt={s.shortName} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="font-display text-lg font-bold">{s.name}</h3>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{s.intro}</p>
                    <Link to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                      Подробнее <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    </>
  );
}
