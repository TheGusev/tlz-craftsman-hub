import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { services } from "@/data/services";
import { visibleCities as cities } from "@/data/cities";
import { cases } from "@/data/cases";
import { generalFaq } from "@/data/faq";
import { MobileQuickLead } from "@/components/site/MobileQuickLead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Clock, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { SITE_PHONE, SITE_PHONE_RAW } from "@/lib/site";
import { trackGoal } from "@/lib/analytics";
import { getServiceImage } from "@/lib/serviceImages";
import { getCaseGallery } from "@/lib/caseGallery";

import geographyImg from "@/assets/geography.webp";
import heroCrimeaMountain from "@/assets/hero-crimea-mountain.webp";
import heroMoscowNight from "@/assets/hero-moscow-night.jpg";
import heroMoscowTeam from "@/assets/hero-moscow-team.jpg";
import moscowDistrict from "@/assets/moscow-district.jpg";
import mskOfficeTeam from "@/assets/msk-office-team.jpg";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildLocalBusinessSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const canonical = buildCanonical("/");
    const title = "Аварийная санитарная служба в Москве и МО — выезд 24/7 | Санитарные Решения РФ";
    const description = "Аварийная санитарная служба в Москве и Московской области: уборка после пожара и потопа, дезинфекция, удаление плесени, фумигация. Выезд бригады за 60 минут. Также работаем в ЮФО и Крыму.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "preload", as: "image", href: heroMoscowNight, fetchpriority: "high" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: buildGraphHead([
            buildWebPageSchema({ path: "/", name: title, description }),
            buildBreadcrumbSchema([]),
            buildLocalBusinessSchema({
              path: "/",
              cityName: "Москва, МО, ЮФО и Крым",
              description,
              areaServed: "Москва, Московская область, ЮФО и Республика Крым",
            }),
            ...services.map((s) =>
              buildServiceSchema({
                path: `/services/${s.slug}`,
                name: s.name,
                description: s.metaDescription,
                serviceType: s.cluster,
                priceFrom: s.priceFrom,
                areaServed: "Москва, Московская область, ЮФО и Республика Крым",
              }),
            ),
            buildFAQSchema(generalFaq),
          ]),
        },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const heroImages = [heroMoscowNight, heroMoscowTeam, moscowDistrict];
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroImages.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  return (
    <>
      <section className="relative min-h-[calc(100svh-76px)] overflow-hidden text-primary-foreground">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Аварийная санитарная бригада в Москве"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeHero ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/70 to-primary/40" aria-hidden />
        <div className="container relative mx-auto flex min-h-[calc(100svh-76px)] items-center px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-urgent px-3 py-1 text-xs font-semibold text-urgent-foreground shadow-lg shadow-urgent/30">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" /> Аварийная служба 24/7
            </div>
            <h1 className="mt-6 font-display text-[2rem] font-bold leading-[1.1] sm:text-4xl md:text-6xl">
              Аварийная санитарная служба в Москве и Московской области
            </h1>
            <p className="mt-5 max-w-xl text-base opacity-90 md:text-lg">
              Уборка после пожара и потопа, дезинфекция, удаление плесени, фумигация. Столичная бригада выезжает за 60 минут по всем округам Москвы и городам МО. Лицензия, сертифицированные препараты, гарантия результата.
            </p>
            <p className="mt-2 text-xs opacity-70">Также работаем в ЮФО и Республике Крым — региональные бригады 24/7.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="bg-[linear-gradient(110deg,var(--urgent),var(--accent),var(--urgent))] bg-[length:200%_auto] animate-shimmer text-urgent-foreground shadow-lg shadow-urgent/40 hover:opacity-90">
                <a
                  href={`tel:${SITE_PHONE_RAW}`}
                  onClick={() => trackGoal("lead_phone_click", { source: "hero_urgent" })}
                >
                  <Phone className="mr-2 h-4 w-4" />Срочный выезд
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-background/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground">
                <Link to="/services">Все услуги</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
              {[
                { icon: Clock, t: "от 60 мин", s: "до приезда в МСК" },
                { icon: ShieldCheck, t: "Гарантия", s: "до 12 месяцев" },
                { icon: MapPin, t: "Москва и МО", s: "+ ЮФО и Крым" },
              ].map((b, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <b.icon className="h-5 w-5 text-accent" />
                  <div className="font-display text-base font-bold sm:text-lg">{b.t}</div>
                  <div className="text-[11px] opacity-70 sm:text-xs">{b.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="bg-surface py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <MobileQuickLead />
        </div>
      </section>


      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ключевые услуги</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">8 направлений санитарных работ — от аварийной уборки после ЧС до плановой дезинфекции объектов.</p>
          </div>
          <Link to="/services" className="hidden text-sm font-semibold text-accent hover:underline md:inline">Все услуги →</Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const img = getServiceImage(s.slug);
            return (
              <Card key={s.slug} className="group flex flex-col overflow-hidden p-0 transition hover:border-accent hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/10]">
                  {img ? (
                    <img src={img} alt={s.shortName} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary" />
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">{s.cluster}</div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-display text-lg font-bold">{s.shortName}</h3>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{s.intro}</p>
                  <Link to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-secondary group-hover:text-accent">
                    Подробнее <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Три филиала — один стандарт</h2>
            <p className="mt-3 text-muted-foreground">Основной штаб — в Москве. Дежурные бригады по МО и Подмосковью работают из столичного филиала. Также обслуживаем ЮФО и Крым региональными командами.</p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Link to="/regions/moskva-mo" className="group relative overflow-hidden rounded-2xl shadow-xl lg:col-span-2 lg:row-span-2">
              <img src={heroMoscowNight} alt="Ночная Москва — столичная санитарная служба" loading="lazy" className="aspect-[16/10] h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground md:p-8">
                <div className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Основной филиал</div>
                <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">Москва и Московская область</h3>
                <p className="mt-2 max-w-xl text-sm opacity-90 md:text-base">Выезд от 60 минут по всем округам Москвы и городам МО. Работаем с УК, страховыми, коммерческой недвижимостью и частным сектором.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {["ЦАО", "ЗАО", "САО", "Химки", "Балашиха", "Подольск", "Мытищи"].map((d) => (
                    <span key={d} className="rounded-full bg-background/20 px-3 py-1 backdrop-blur-sm">{d}</span>
                  ))}
                </div>
              </div>
            </Link>

            <Link to="/regions/krym" className="group relative overflow-hidden rounded-2xl shadow-xl">
              <img src={heroCrimeaMountain} alt="Крым — региональный хаб" loading="lazy" className="aspect-[16/10] h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent">Региональный хаб</div>
                <h3 className="mt-2 font-display text-xl font-bold">Республика Крым</h3>
                <p className="mt-1 text-xs opacity-90">Симферополь, Севастополь, Ялта, Евпатория, Керчь</p>
              </div>
            </Link>

            <Link to="/cities" className="group relative overflow-hidden rounded-2xl shadow-xl">
              <img src={geographyImg} alt="ЮФО — дежурные бригады" loading="lazy" className="aspect-[16/10] h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent">Южный округ</div>
                <h3 className="mt-2 font-display text-xl font-bold">Краснодар, Сочи, Ростов-на-Дону</h3>
                <p className="mt-1 text-xs opacity-90">Дежурные бригады круглосуточно</p>
              </div>
            </Link>
          </div>

          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <Link key={c.slug} to="/cities/$citySlug" params={{ citySlug: c.slug }} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-accent">
                <div>
                  <div className="font-display text-sm font-bold">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.region}</div>
                </div>
                <div className="text-[11px] font-semibold text-accent">{c.arrivalTime}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Когда обращаются к нам</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Реальные фото с выездов бригады. Работаем аккуратно, конфиденциально и с полным циклом восстановления объекта.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: "После пожара", d: "Уборка сажи и копоти, вывоз обгоревшего мусора, обработка от запаха гари, восстановление помещения.", img: getServiceImage("posle-pozhara") },
            { t: "После потопа", d: "Откачка воды, просушка конструкций, антиплесневая обработка, дезинфекция.", img: getServiceImage("posle-potopa") },
            { t: "Плесень и грибок", d: "Полное удаление с гарантией 12 месяцев и устранением источника влаги.", img: getServiceImage("udalenie-pleseni") },
            { t: "Биосанитарные случаи", d: "Конфиденциальная уборка после смерти, вывоз мусора, устранение трупного запаха.", img: getServiceImage("dezinfekciya-posle-smerti") },
            { t: "Фумигация", d: "Газовая обработка складов, элеваторов, подвалов от вредителей и грызунов.", img: getServiceImage("fumigaciya") },
            { t: "Очистка территорий", d: "Расчистка после пожара, вывоз загрязнённого мусора, обработка грунта.", img: getServiceImage("ochistka-uchastkov") },
          ].map((c, i) => (
            <Card key={i} className="overflow-hidden p-0">
              {c.img && (
                <img src={c.img} alt={c.t} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
              )}
              <div className="p-5">
                <h3 className="font-display text-lg font-bold">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>


      <section className="bg-surface py-16 text-foreground md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Этапы работы</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { n: "01", t: "Заявка", d: "Принимаем звонок или форму, согласуем выезд." },
              { n: "02", t: "Выезд", d: "Бригада приезжает в течение 1–3 часов." },
              { n: "03", t: "Работы", d: "Полный цикл санобработки по протоколу." },
              { n: "04", t: "Сдача", d: "Контроль качества, акт, гарантия." },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-display text-5xl font-bold text-accent">{s.n}</div>
                <h3 className="mt-3 font-display text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Реальные кейсы</h2>
          <Link to="/cases" className="hidden text-sm font-semibold text-accent hover:underline md:inline">Все кейсы →</Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cases.slice(0, 6).map((c) => {
            const photo = getCaseGallery(c.slug)[0];
            return (
              <Card key={c.slug} className="overflow-hidden p-0">
                {photo && <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
                <div className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">{c.objectType}</div>
                  <h3 className="mt-2 font-display text-base font-bold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.problem}</p>
                  <div className="mt-4 text-xs text-muted-foreground">Срок: {c.duration}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Частые вопросы</h2>
          <Accordion type="single" collapsible className="mt-8">
            {generalFaq.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

    </>
  );
}
