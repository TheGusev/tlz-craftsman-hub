import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { services } from "@/data/services";
import { cities } from "@/data/cities";
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

import geographyImg from "@/assets/geography.jpg";
import heroCrimeaMountain from "@/assets/hero-crimea-mountain.png";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildLocalBusinessSchema,
  buildFAQSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const canonical = buildCanonical("/");
    const title = "Санитарные Решения РФ — аварийная санитарная служба 24/7 по ЮФО и Крыму";
    const description = "Аварийная санитарная очистка, дезинфекция, удаление плесени, фумигация. Краснодар, Сочи, Ростов-на-Дону, Крым. Выезд бригады 24/7.";
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
            buildWebPageSchema({ path: "/", name: title, description }),
            buildLocalBusinessSchema({
              path: "/",
              cityName: "ЮФО и Крым",
              description,
              areaServed: "ЮФО и Республика Крым",
            }),
            buildFAQSchema(generalFaq),
          ]),
        },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const heroImages = [geographyImg, heroCrimeaMountain];
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  return (
    <>
      <section className="relative min-h-[calc(100svh-76px)] overflow-hidden text-primary-foreground">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="ЮФО и Крым с высоты"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeHero ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="container relative mx-auto flex min-h-[calc(100svh-76px)] items-center px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-urgent px-3 py-1 text-xs font-semibold text-urgent-foreground shadow-lg shadow-urgent/30">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" /> Аварийная служба 24/7
            </div>
            <h1 className="mt-6 font-display text-[2rem] font-bold leading-[1.1] sm:text-4xl md:text-6xl">
              Срочные санитарные работы по ЮФО и Крыму
            </h1>
            <p className="mt-5 max-w-xl text-base opacity-90 md:text-lg">
              Уборка после пожара и потопа, дезинфекция, удаление плесени, фумигация. Выезд бригады в течение 1–3 часов. Лицензия, сертифицированные препараты, гарантия результата.
            </p>
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
                { icon: Clock, t: "1–3 часа", s: "до приезда бригады" },
                { icon: ShieldCheck, t: "Гарантия", s: "до 12 месяцев" },
                { icon: MapPin, t: "8 городов", s: "ЮФО и Крым" },
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
        <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 md:items-center">
          <div className="relative order-2 overflow-hidden rounded-2xl shadow-2xl md:order-1">
            <img src={geographyImg} alt="Побережье ЮФО и Крыма с воздуха" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="rounded-xl bg-background/95 px-3 py-2 text-foreground shadow-lg">
                <div className="font-display text-xl font-bold">8 городов</div>
                <div className="text-xs text-muted-foreground">Дежурные бригады 24/7</div>
              </div>
              <div className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-lg">ЮФО + Крым</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-display text-3xl font-bold md:text-4xl">География присутствия</h2>
            <p className="mt-3 text-muted-foreground">Дежурные бригады в Краснодаре, Сочи, Ростове-на-Дону. Региональный хаб по Крыму с выездом в Симферополь, Севастополь, Ялту, Евпаторию и Керчь.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {cities.map((c) => (
                <Link key={c.slug} to="/cities/$citySlug" params={{ citySlug: c.slug }} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-accent active:scale-[0.99]">
                  <div>
                    <div className="font-display text-sm font-bold">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.region}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-accent">{c.arrivalTime}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Когда обращаются к нам</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { t: "После пожара", d: "Удалить сажу, обработать стены, убрать запах гари — без ущерба для конструкций." },
            { t: "После потопа", d: "Откачать воду, просушить стены, не дать плесени поселиться в материалах." },
            { t: "Плесень и грибок", d: "Полное удаление с гарантией 12 месяцев и устранением источника влаги." },
            { t: "Биосанитарные случаи", d: "Конфиденциальная санация после смерти и устранение трупного запаха." },
            { t: "Фумигация", d: "Газовая обработка складов, элеваторов, подвалов от вредителей и грызунов." },
            { t: "Очистка территорий", d: "Расчистка после пожара, вывоз загрязнённого мусора, обработка грунта." },
          ].map((c, i) => (
            <Card key={i} className="p-6">
              <h3 className="font-display text-lg font-bold">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
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
