import { createFileRoute, Link, Outlet, notFound, useLocation } from "@tanstack/react-router";
import { getCity, type City } from "@/data/cities";
import { services, getService, type Service } from "@/data/services";
import { cases } from "@/data/cases";
import { getServiceInCityByCity } from "@/data/serviceInCity";
import { generalFaq } from "@/data/faq";
import { PageHero } from "@/components/site/PageHero";
import { LeadForm } from "@/components/site/LeadForm";
import { IntroAnswer } from "@/components/site/IntroAnswer";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Clock } from "lucide-react";
import { getCityServicePrice, formatPriceFrom } from "@/lib/cityPricing";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildLocalBusinessSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/cities/$citySlug")({
  loader: ({ params }): { city: City } => {
    const city = getCity(params.citySlug);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const c = loaderData.city;
    const path = `/cities/${c.slug}`;
    const canonical = buildCanonical(path);
    return {
      meta: [
        { title: c.metaTitle },
        { name: "description", content: c.metaDescription },
        { property: "og:title", content: c.metaTitle },
        { property: "og:description", content: c.metaDescription },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: buildGraphHead([
            buildWebPageSchema({ path, name: c.metaTitle, description: c.metaDescription }),
            buildBreadcrumbSchema([
              { label: "Города", path: "/cities" },
              { label: c.name, path },
            ]),
            buildLocalBusinessSchema({
              path,
              cityName: c.name,
              description: c.intro,
              address: c.address,
              phone: c.phone,
              coordinates: c.coordinates,
              areaServed: c.region,
            }),
          ]),
        },
      ],
    };
  },
  notFoundComponent: () => <div className="container py-20 text-center">Город не найден</div>,
  component: CityPage,
});

function CityPage() {
  const { city }: { city: City } = Route.useLoaderData();
  const { pathname } = useLocation();
  if (pathname.replace(/\/$/, "") !== `/cities/${city.slug}`) {
    return <Outlet />;
  }
  const popular = city.popularServices.map(getService).filter(Boolean);
  const cityLinks = getServiceInCityByCity(city.slug);
  const cityCases = cases.filter((c) => c.city === city.slug);

  return (
    <article>
      <PageHero
        breadcrumbs={[{ label: "Города", to: "/cities" }, { label: city.name }]}
        eyebrow={city.region}
        title={`Санитарные услуги ${city.nameLocative}`}
        description={city.intro}
        meta={
          <>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" />{city.arrivalTime}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />{city.districts.length} районов выезда</span>
          </>
        }
      />

      <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-12">
          {city.introAnswer && <IntroAnswer>{city.introAnswer}</IntroAnswer>}
          <section>
            <h2 className="font-display text-2xl font-bold">Какие работы выполняем {city.nameLocative}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {services.map((s) => (
                <Link key={s.slug} to="/cities/$citySlug/$serviceSlug" params={{ citySlug: city.slug, serviceSlug: s.slug }} className="rounded-xl border border-border bg-card p-4 hover:border-accent">
                  <div className="font-display text-base font-bold">{s.shortName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.cluster}</div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Популярные услуги {city.nameLocative}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{city.localContext}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {popular.map((s: Service | undefined) => s && (
                <Link key={s.slug} to="/cities/$citySlug/$serviceSlug" params={{ citySlug: city.slug, serviceSlug: s.slug }} className="rounded-xl border border-accent/40 bg-accent/5 p-4 hover:border-accent">
                  <div className="font-display text-base font-bold">{s.shortName} {city.nameLocative}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.intro}</div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Районы и зоны выезда</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {city.districts.map((d: string) => (
                <span key={d} className="rounded-full border border-border bg-card px-3 py-1 text-sm">{d}</span>
              ))}
            </div>
          </section>

          {cityCases.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold">Локальные кейсы</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {cityCases.map((c) => (
                  <Card key={c.slug} className="p-5">
                    <div className="text-xs text-accent">{c.objectType}</div>
                    <h3 className="mt-1 font-display text-base font-bold">{c.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.problem}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-2xl font-bold">FAQ по {city.name}</h2>
            <Accordion type="single" collapsible className="mt-4">
              {generalFaq.slice(0, 5).map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 font-display text-xl font-bold">Срочный выезд {city.nameLocative}</h2>
          <LeadForm defaultCity={city.slug} />
        </aside>
      </div>

      {cityLinks.length > 0 && (
        <section className="bg-surface py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold">Приоритетные направления {city.nameLocative}</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {cityLinks.map((sc) => {
                const s = getService(sc.serviceSlug);
                if (!s) return null;
                return (
                  <Link key={sc.serviceSlug} to="/cities/$citySlug/$serviceSlug" params={{ citySlug: city.slug, serviceSlug: sc.serviceSlug }} className="rounded-xl border border-border bg-card p-4 hover:border-accent">
                    <div className="font-display text-sm font-bold">{s.shortName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{city.nameLocative}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
