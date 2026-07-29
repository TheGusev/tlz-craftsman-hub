import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getService, services, type Service } from "@/data/services";
import { visibleCities as cities, isVisibleCity } from "@/data/cities";
import { publicCases as cases } from "@/data/cases";
import { getServiceInCityByService } from "@/data/serviceInCity";
import { PageHero } from "@/components/site/PageHero";
import { LeadForm } from "@/components/site/LeadForm";
import { IntroAnswer } from "@/components/site/IntroAnswer";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, AlertTriangle } from "lucide-react";
import { getServiceImage } from "@/lib/serviceImages";
import { getCaseGallery } from "@/lib/caseGallery";
import { BeforeAfterGallery } from "@/components/site/BeforeAfterGallery";
import { getFloodGallery, getFloodVideo, FLOOD_SERVICE_SLUG } from "@/lib/floodGallery";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
  buildFAQSchema,
  buildVideoObjectSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/services/$serviceSlug")({
  loader: ({ params }): { service: Service } => {
    const service = getService(params.serviceSlug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const s = loaderData.service;
    const img = getServiceImage(s.slug);
    const path = `/services/${s.slug}`;
    const canonical = buildCanonical(path);
    return {
      meta: [
        { title: s.metaTitle },
        { name: "description", content: s.metaDescription },
        { property: "og:title", content: s.metaTitle },
        { property: "og:description", content: s.metaDescription },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        ...(img
          ? [
              { property: "og:image", content: img },
              { name: "twitter:image", content: img },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: buildGraphHead([
            buildWebPageSchema({ path, name: s.metaTitle, description: s.metaDescription }),
            buildBreadcrumbSchema([
              { label: "Услуги", path: "/services" },
              { label: s.shortName, path },
            ]),
            buildServiceSchema({
              path,
              name: s.name,
              description: s.metaDescription,
              serviceType: s.cluster,
              priceFrom: s.priceFrom,
            }),
            buildFAQSchema(s.faq),
          ]),
        },
      ],
    };
  },
  notFoundComponent: () => <div className="container py-20 text-center">Услуга не найдена</div>,
  component: ServicePage,
});

function ServicePage() {
  const { service }: { service: Service } = Route.useLoaderData();
  const cityLinks = getServiceInCityByService(service.slug).filter((sc) => isVisibleCity(sc.citySlug));
  const serviceCases = cases.filter((c) => c.service === service.slug);

  const cover = getServiceImage(service.slug);
  return (
    <article>
      <PageHero
        backgroundImage={cover ?? undefined}
        breadcrumbs={[{ label: "Услуги", to: "/services" }, { label: service.shortName }]}
        eyebrow={service.cluster}
        title={service.h1}
        description={service.intro}
      />

      <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-12">
          {service.introAnswer && <IntroAnswer>{service.introAnswer}</IntroAnswer>}
          <section>
            <h2 className="font-display text-2xl font-bold">Что входит в работу</h2>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {service.includes.map((it: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{it}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Для каких объектов подходит</h2>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {service.objects.map((it: string, i: number) => (
                <li key={i} className="rounded-md border border-border bg-card px-3 py-2 text-sm">{it}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-urgent/30 bg-urgent/5 p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-urgent"><AlertTriangle className="h-6 w-6" />Чем опасно промедление</h2>
            <ul className="mt-4 space-y-2">
              {service.dangers.map((it: string, i: number) => <li key={i} className="text-sm text-foreground/80">— {it}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Этапы работ</h2>
            <ol className="mt-4 space-y-4">
              {service.steps.map((step: Service["steps"][number], i: number) => (
                <li key={i} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="font-display text-2xl font-bold text-accent">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Оборудование и методы</h2>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {service.equipment.map((it: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{it}</li>
              ))}
            </ul>
          </section>

          {service.slug === FLOOD_SERVICE_SLUG && (
            <BeforeAfterGallery
              photos={getFloodGallery("в Москве")}
              video={getFloodVideo("в Москве")}
              footnote="Кадры сделаны на одном объекте: слева — состояние до работ, справа — после сдачи."
            />
          )}

          <section>
            <h2 className="font-display text-2xl font-bold">От чего зависит цена</h2>
            <ul className="mt-4 space-y-2">
              {service.priceFactors.map((it: string, i: number) => <li key={i} className="text-sm">— {it}</li>)}
            </ul>
          </section>

          {cityLinks.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold">Города оказания услуги</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {cityLinks.map((sc) => {
                  const city = cities.find((c) => c.slug === sc.citySlug);
                  if (!city) return null;
                  return (
                    <Link key={sc.citySlug} to="/cities/$citySlug/$serviceSlug" params={{ citySlug: sc.citySlug, serviceSlug: service.slug }} className="rounded-xl border border-border bg-card p-4 transition hover:border-accent">
                      <div className="font-display text-base font-bold">{service.shortName} в {city.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{city.region}</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {serviceCases.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold">Кейсы по услуге</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {serviceCases.slice(0, 4).map((c) => {
                  const photo = getCaseGallery(c.slug)[0];
                  return (
                    <Card key={c.slug} className="overflow-hidden p-0">
                      {photo && <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
                      <div className="p-5">
                        <div className="text-xs text-accent">{c.objectType}</div>
                        <h3 className="mt-1 font-display text-base font-bold">{c.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.problem}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-2xl font-bold">FAQ по услуге</h2>
            <Accordion type="single" collapsible className="mt-4">
              {service.faq.map((f: Service["faq"][number], i: number) => (
                <AccordionItem key={i} value={`f-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 font-display text-xl font-bold">Получить расчёт</h2>
          <LeadForm defaultProblem={service.shortName} />
        </aside>
      </div>

      {/* Related services */}
      <section className="bg-surface py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold">Связанные услуги</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {services.filter((s) => s.slug !== service.slug).slice(0, 4).map((s) => (
              <Link key={s.slug} to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} className="rounded-xl border border-border bg-card p-4 hover:border-accent">
                <div className="font-display text-base font-bold">{s.shortName}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.intro}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
