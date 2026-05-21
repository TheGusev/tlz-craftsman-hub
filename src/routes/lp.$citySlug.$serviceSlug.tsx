import { createFileRoute, notFound, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCity, type City } from "@/data/cities";
import { getService, type Service } from "@/data/services";
import { getServiceInCity, type ServiceInCity } from "@/data/serviceInCity";
import { LeadForm } from "@/components/site/LeadForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Check, Clock, ShieldCheck, BadgeCheck } from "lucide-react";
import { getServiceImage } from "@/lib/serviceImages";
import { PriceQuiz } from "@/components/site/PriceQuiz";
import { trackGoal } from "@/lib/analytics";
import { trackCityConversion } from "@/lib/conversions";

type LpSearch = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

export const Route = createFileRoute("/lp/$citySlug/$serviceSlug")({
  validateSearch: (s: Record<string, unknown>): LpSearch => ({
    utm_source: typeof s.utm_source === "string" ? s.utm_source : undefined,
    utm_medium: typeof s.utm_medium === "string" ? s.utm_medium : undefined,
    utm_campaign: typeof s.utm_campaign === "string" ? s.utm_campaign : undefined,
    utm_term: typeof s.utm_term === "string" ? s.utm_term : undefined,
    utm_content: typeof s.utm_content === "string" ? s.utm_content : undefined,
  }),
  loader: ({ params }) => {
    const city = getCity(params.citySlug);
    const service = getService(params.serviceSlug);
    if (!city || !service) throw notFound();
    const sc = getServiceInCity(params.citySlug, params.serviceSlug);
    return { city, service, sc };
  },
  head: ({ params, loaderData }) => {
    const canonical = `https://tlz-craftsman-hub.lovable.app/lp/${params.citySlug}/${params.serviceSlug}`;
    if (!loaderData)
      return {
        meta: [{ name: "robots", content: "noindex,nofollow" }],
        links: [{ rel: "canonical", href: canonical }],
      };
    const { city, service, sc } = loaderData;
    const title = `${service.shortName} ${city.nameLocative} — выезд за ${city.arrivalTime.split(",")[0]}`;
    const description = sc?.metaDescription ?? service.metaDescription;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex,nofollow" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: LandingPage,
});

function LandingPage() {
  const { city, service, sc } = Route.useLoaderData() as {
    city: City;
    service: Service;
    sc: ServiceInCity | undefined;
  };
  const search = useSearch({ from: "/lp/$citySlug/$serviceSlug" }) as LpSearch;
  const cover = getServiceImage(service.slug);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "lp_view",
      city: city.slug,
      service: service.slug,
      ...search,
    });
  }, [city.slug, service.slug, search]);

  const phoneRaw = (city.phone || "+78005551234").replace(/[^+\d]/g, "");
  const phoneHref = `tel:${phoneRaw}`;
  const phoneDisplay = city.phoneDisplay ?? "";
  const whatsappHref = `https://wa.me/${city.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Минимальный header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm font-semibold">Аварийная санслужба</span>
          <a
            href={phoneHref}
            className="text-sm font-semibold text-primary"
            aria-label="Позвонить"
            onClick={() => {
              trackGoal("lead_phone_click", { source: "lp_header", city: city.slug });
              trackCityConversion(city.slug, "phone", { source: "lp_header" });
            }}
          >
            {phoneDisplay || <Phone className="h-4 w-4" />}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-border"
        style={
          cover
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div className={cover ? "text-white" : ""}>
            <h1 className="text-3xl font-bold md:text-5xl">
              {service.shortName} {city.nameLocative}
            </h1>
            <p className="mt-4 text-base opacity-90 md:text-lg">
              {sc?.localOffer ?? service.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-semibold">
                <a
                  href={phoneHref}
                  onClick={() => {
                    trackGoal("lead_phone_click", { source: "lp_hero", city: city.slug });
                    trackCityConversion(city.slug, "phone", { source: "lp_hero" });
                  }}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Позвонить
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackGoal("lead_messenger_click", { source: "lp_hero", channel: "whatsapp", city: city.slug });
                    trackCityConversion(city.slug, "messenger", { source: "lp_hero", channel: "whatsapp" });
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm opacity-90">
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{city.arrivalTime}</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" />Сертификаты</span>
              <span className="inline-flex items-center gap-1"><BadgeCheck className="h-4 w-4" />Акт о работах</span>
            </div>
          </div>
          <div>
            <LeadForm defaultCity={city.slug} defaultProblem={service.slug} />
          </div>
        </div>
      </section>

      {/* Калькулятор */}
      {service.priceFrom ? (
        <section className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-2xl">
            <PriceQuiz
              basePrice={service.priceFrom}
              serviceName={service.slug}
              cityName={city.slug}
            />
          </div>
        </section>
      ) : null}

      {/* УТП */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Выезд 24/7", text: city.arrivalTime },
            { title: "Гарантия", text: "До 12 месяцев на результат обработки" },
            { title: "Сертификаты", text: "Препараты Минздрава РФ, акт о работах" },
          ].map((it) => (
            <Card key={it.title} className="p-6">
              <h3 className="text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Шаги */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold md:text-3xl">Как мы работаем</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {service.steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="text-sm font-semibold text-primary">Шаг {i + 1}</div>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Цены */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold md:text-3xl">Цена {city.nameLocative}</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          {sc?.priceContext ??
            (service.priceFrom
              ? `Стоимость от ${service.priceFrom.toLocaleString("ru-RU")} ₽. Точная цена — после осмотра.`
              : "Цена зависит от площади и типа объекта.")}
        </p>
      </section>

      {/* Кейсы */}
      {sc?.caseScenario && (
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold md:text-3xl">Пример выезда</h2>
            <Card className="mt-6 p-6">
              <h3 className="font-semibold">{sc.caseScenario.title}</h3>
              <p className="mt-3 text-muted-foreground">{sc.caseScenario.description}</p>
            </Card>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold md:text-3xl">Частые вопросы</h2>
        <div className="mt-6 grid gap-4">
          {(sc?.faq ?? service.faq).map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-card p-5"
            >
              <summary className="cursor-pointer list-none font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {f.q}
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Финальная форма */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold md:text-3xl">Оставьте заявку — перезвоним за 15 минут</h2>
          <div className="mt-6 max-w-2xl">
            <LeadForm defaultCity={city.slug} defaultProblem={service.slug} />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © Аварийная санслужба
      </footer>
    </div>
  );
}
