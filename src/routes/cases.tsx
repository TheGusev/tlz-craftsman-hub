import { createFileRoute, Link } from "@tanstack/react-router";
import { cases } from "@/data/cases";
import { getCity } from "@/data/cities";
import { getService } from "@/data/services";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { getCaseImage } from "@/lib/caseImages";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/cases")({
  head: () => {
    const path = "/cases";
    const canonical = buildCanonical(path);
    const title = "Кейсы — реальные работы санитарной службы";
    const description = "Реальные кейсы санитарных работ: уборка после пожара, потопа, удаление плесени, дезинфекция. Краснодар, Сочи, Ростов, Крым.";
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
            buildBreadcrumbSchema([{ label: "Кейсы", path }]),
          ]),
        },
      ],
    };
  },
  component: CasesPage,
});

function CasesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: "Кейсы" }]} />
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Реальные кейсы</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">Подборка реальных работ с описанием задачи, объёма работ и результата.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {cases.map((c) => {
          const city = getCity(c.city);
          const service = getService(c.service);
          const image = getCaseImage(c.slug);
          return (
            <Card key={c.slug} className="overflow-hidden p-0">
              {image && <img src={image} alt={c.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 text-xs">
                  {service && <Link to="/services/$serviceSlug" params={{ serviceSlug: service.slug }} className="rounded-full bg-accent/10 px-3 py-1 text-accent">{service.shortName}</Link>}
                  {city && <Link to="/cities/$citySlug" params={{ citySlug: city.slug }} className="rounded-full bg-secondary/10 px-3 py-1 text-secondary">{city.name}</Link>}
                </div>
                <h2 className="mt-3 font-display text-lg font-bold">{c.title}</h2>
                <div className="mt-1 text-xs text-muted-foreground">{c.objectType}</div>
                <p className="mt-3 text-sm"><span className="font-semibold">Проблема:</span> {c.problem}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {c.works.map((w, i) => <li key={i}>— {w}</li>)}
                </ul>
                <div className="mt-3 text-xs text-muted-foreground">Срок: {c.duration}</div>
                <p className="mt-3 text-sm"><span className="font-semibold">Результат:</span> {c.result}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
