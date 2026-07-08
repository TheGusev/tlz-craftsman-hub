import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCity, type City } from "@/data/cities";
import { getService, type Service } from "@/data/services";
import { getServiceInCity, type ServiceInCity } from "@/data/serviceInCity";
import { PageHero } from "@/components/site/PageHero";
import { LeadForm } from "@/components/site/LeadForm";
import { IntroAnswer } from "@/components/site/IntroAnswer";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Phone, MessageCircle } from "lucide-react";
import { trackCityConversion } from "@/lib/conversions";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
  buildLocalBusinessSchema,
  buildFAQSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";
import { getServiceImage } from "@/lib/serviceImages";
import { PriceNote } from "@/components/site/PriceNote";
import { buildCityServiceContent } from "@/lib/cityServiceContent";

function clamp(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function buildDefaultServiceInCity(city: City, service: Service): ServiceInCity {
  const phoneText = city.phoneDisplay || city.phone;
  const districts = city.districts.slice(0, 2).join(", ");
  const priceTitle = service.priceFrom
    ? `${service.shortName} ${city.nameLocative} — ${service.priceFrom.toLocaleString("ru-RU")} ₽, выезд 24/7`
    : `${service.shortName} ${city.nameLocative} — выезд 24/7, договор и гарантия`;
  const metaTitle = clamp(priceTitle, 60);

  const descBase = `${service.shortName} ${city.nameLocative}: выезд за ${city.arrivalTime}, договор, гарантия, СЭС-сертификаты.`;
  const descGeo = districts ? ` Работаем по районам: ${districts}.` : "";
  const descPhone = phoneText ? ` Тел. ${phoneText}.` : "";
  const metaDescription = clamp(descBase + descGeo + descPhone, 160);

  const introAnswer = service.priceFrom
    ? `Вызвать ${service.shortName.toLowerCase()} ${city.nameLocative} можно круглосуточно. Цена ${service.shortName.toLowerCase()} ${city.nameLocative} — ${service.priceFrom.toLocaleString("ru-RU")} ₽ (точная — после осмотра), выезд бригады — ${city.arrivalTime}. Работаем по договору, выдаём акт и гарантию.`
    : `Вызвать ${service.shortName.toLowerCase()} ${city.nameLocative} можно круглосуточно. Выезд бригады — ${city.arrivalTime}. Работаем по договору, выдаём акт, гарантию и СЭС-сертификаты.`;

  return {
    citySlug: city.slug,
    serviceSlug: service.slug,
    h1: `${service.name} ${city.nameLocative}`,
    metaTitle,
    metaDescription,
    introAnswer,
    localOffer: `Бригада дежурит ${city.nameLocative} 24/7. Выезд по графику: ${city.arrivalTime}.`,
    whenCalled: [],
    priceContext: service.priceFrom
      ? `${city.nameLocative} — ${service.priceFrom.toLocaleString("ru-RU")} ₽. Точная цена после осмотра — зависит от площади, объёма работ и срочности.`
      : "Стоимость рассчитывается индивидуально по объёму работ. Замер и смета — бесплатно.",
    caseScenario: { title: "", description: "" },
    faq: service.faq.slice(0, 3),
    popularDistricts: city.districts,
  };
}


export const Route = createFileRoute("/cities/$citySlug/$serviceSlug")({

  loader: ({ params }) => {
    const city = getCity(params.citySlug);
    const service = getService(params.serviceSlug);
    if (!city || !service) throw notFound();
    const sc = getServiceInCity(params.citySlug, params.serviceSlug)
      ?? buildDefaultServiceInCity(city, service);
    return { city, service, sc };
  },

  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { city, service, sc } = loaderData;
    const path = `/cities/${city.slug}/${service.slug}`;
    const canonical = buildCanonical(path);
    const img = getServiceImage(service.slug);
    return {
      meta: [
        { title: sc.metaTitle },
        { name: "description", content: sc.metaDescription },
        { property: "og:title", content: sc.metaTitle },
        { property: "og:description", content: sc.metaDescription },
        { property: "og:url", content: canonical },
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
            buildWebPageSchema({ path, name: sc.metaTitle, description: sc.metaDescription }),
            buildBreadcrumbSchema([
              { label: "Города", path: "/cities" },
              { label: city.name, path: `/cities/${city.slug}` },
              { label: service.shortName, path },
            ]),
            buildServiceSchema({
              path,
              name: sc.h1,
              description: sc.metaDescription,
              serviceType: service.cluster,
              priceFrom: sc.localPricing?.from ?? service.priceFrom,
              areaServed: city.name,
            }),
            buildLocalBusinessSchema({
              path,
              cityName: city.name,
              description: sc.localOffer,
              address: city.address,
              phone: city.phone,
              coordinates: city.coordinates,
              areaServed: city.region,
            }),
            buildFAQSchema(sc.faq),
          ]),
        },
      ],
    };
  },
  notFoundComponent: () => <div className="container py-20 text-center">Страница не найдена</div>,
  component: ServiceInCityPage,
});

function ServiceInCityPage() {
  const { city, service, sc }: { city: City; service: Service; sc: ServiceInCity } = Route.useLoaderData();
  const cover = getServiceImage(service.slug);
  const phoneDisplay = city.phoneDisplay || city.phone;
  const heroActions = (city.phone || city.whatsapp) ? (
    <>
      {city.phone && (
        <a
          href={`tel:${city.phone}`}
          onClick={() => trackCityConversion(city.slug, service.slug, "phone", { place: "service_in_city_hero" })}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-elegant transition hover:opacity-90"
        >
          <Phone className="h-5 w-5" />
          <span>Позвонить {phoneDisplay}</span>
        </a>
      )}
      {city.whatsapp && (
        <a
          href={`https://wa.me/${city.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Здравствуйте! Нужна услуга «${service.shortName}» ${city.nameLocative}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCityConversion(city.slug, service.slug, "messenger", { channel: "whatsapp", place: "service_in_city_hero" })}
          className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-foreground/20"
        >
          <MessageCircle className="h-5 w-5" />
          <span>WhatsApp</span>
        </a>
      )}
    </>
  ) : null;
  return (
    <article>
      <PageHero
        backgroundImage={cover ?? undefined}
        breadcrumbs={[
          { label: "Города", to: "/cities" },
          { label: city.name, to: `/cities/${city.slug}` },
          { label: service.shortName },
        ]}
        eyebrow={`${service.cluster} · ${city.name}`}
        title={sc.h1}
        description={sc.localOffer}
        actions={heroActions}
      />


      <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-12">
          {sc.introAnswer && <IntroAnswer>{sc.introAnswer}</IntroAnswer>}
          {sc.whenCalled.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold">Когда вызывают {city.nameLocative}</h2>
              <ul className="mt-4 space-y-2">
                {sc.whenCalled.map((it: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{it}</li>
                ))}
              </ul>
            </section>
          )}


          <section>
            <h2 className="font-display text-2xl font-bold">Этапы работ</h2>
            <ol className="mt-4 space-y-3">
              {service.steps.map((step: Service["steps"][number], i: number) => (
                <li key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="font-display text-sm font-bold text-accent">Этап {i + 1}</div>
                  <div className="mt-1 font-semibold">{step.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Что влияет на цену {city.nameLocative}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{sc.priceContext}</p>
            <PriceNote className="mt-2" />
            <ul className="mt-3 space-y-1">
              {service.priceFactors.map((it: string, i: number) => <li key={i} className="text-sm">— {it}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Районы выезда</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(sc.popularDistricts ?? city.districts).map((d: string) => (
                <span key={d} className="rounded-full border border-border bg-card px-3 py-1 text-sm">{d}</span>
              ))}
            </div>
          </section>

          {sc.caseScenario.title && (
            <section>
              <h2 className="font-display text-2xl font-bold">Реальный сценарий</h2>
              <Card className="mt-4 p-6">
                <h3 className="font-display text-lg font-bold">{sc.caseScenario.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{sc.caseScenario.description}</p>
              </Card>
            </section>
          )}


          <section>
            <h2 className="font-display text-2xl font-bold">FAQ по {service.shortName.toLowerCase()} {city.nameLocative}</h2>
            <Accordion type="single" collapsible className="mt-4">
              {[...sc.faq, ...service.faq.slice(0, 2)].map((f: Service["faq"][number], i: number) => (
                <AccordionItem key={i} value={`f-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl font-bold">Подробнее</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/services/$serviceSlug" params={{ serviceSlug: service.slug }} className="rounded-xl border border-border bg-card p-4 hover:border-accent">
                <div className="text-xs text-accent">Услуга</div>
                <div className="mt-1 font-display font-bold">{service.name}</div>
              </Link>
              <Link to="/cities/$citySlug" params={{ citySlug: city.slug }} className="rounded-xl border border-border bg-card p-4 hover:border-accent">
                <div className="text-xs text-accent">Город</div>
                <div className="mt-1 font-display font-bold">Все услуги {city.nameLocative}</div>
              </Link>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 font-display text-xl font-bold">Заявка {city.nameLocative}</h2>
          <LeadForm defaultCity={city.slug} defaultProblem={service.shortName} />
        </aside>
      </div>
    </article>
  );
}
