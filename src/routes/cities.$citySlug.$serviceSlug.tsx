import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCity, type City } from "@/data/cities";
import { getService, type Service } from "@/data/services";
import { getServiceInCity, type ServiceInCity } from "@/data/serviceInCity";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";

export const Route = createFileRoute("/cities/$citySlug/$serviceSlug")({
  loader: ({ params }) => {
    const city = getCity(params.citySlug);
    const service = getService(params.serviceSlug);
    const sc = getServiceInCity(params.citySlug, params.serviceSlug);
    if (!city || !service || !sc) throw notFound();
    return { city, service, sc };
  },
  head: ({ loaderData }) => loaderData ? ({
    meta: [
      { title: loaderData.sc.metaTitle },
      { name: "description", content: loaderData.sc.metaDescription },
      { property: "og:title", content: loaderData.sc.metaTitle },
      { property: "og:description", content: loaderData.sc.metaDescription },
    ],
    links: [{ rel: "canonical", href: `/cities/${loaderData.city.slug}/${loaderData.service.slug}` }],
  }) : { meta: [] },
  notFoundComponent: () => <div className="container py-20 text-center">Страница не найдена</div>,
  component: ServiceInCityPage,
});

function ServiceInCityPage() {
  const { city, service, sc }: { city: City; service: Service; sc: ServiceInCity } = Route.useLoaderData();
  return (
    <article>
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Breadcrumbs items={[
            { label: "Города", to: "/cities" },
            { label: city.name, to: `/cities/${city.slug}` },
            { label: service.shortName },
          ]} />
          <h1 className="mt-4 font-display text-3xl font-bold md:text-5xl">{sc.h1}</h1>
          <p className="mt-4 max-w-3xl opacity-90">{sc.localOffer}</p>
        </div>
      </header>

      <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-12">
          <section>
            <h2 className="font-display text-2xl font-bold">Когда вызывают {city.nameLocative}</h2>
            <ul className="mt-4 space-y-2">
              {sc.whenCalled.map((it: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{it}</li>
              ))}
            </ul>
          </section>

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
            <ul className="mt-3 space-y-1">
              {service.priceFactors.map((it: string, i: number) => <li key={i} className="text-sm">— {it}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Районы выезда</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {city.districts.map((d: string) => (
                <span key={d} className="rounded-full border border-border bg-card px-3 py-1 text-sm">{d}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Реальный сценарий</h2>
            <Card className="mt-4 p-6">
              <h3 className="font-display text-lg font-bold">{sc.caseScenario.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{sc.caseScenario.description}</p>
            </Card>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">FAQ по {service.shortName.toLowerCase()} {city.nameLocative}</h2>
            <Accordion type="single" collapsible className="mt-4">
              {[...sc.faq, ...service.faq.slice(0, 2)].map((f, i) => (
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
