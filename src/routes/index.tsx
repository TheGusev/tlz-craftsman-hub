import { createFileRoute, Link } from "@tanstack/react-router";
import { services } from "@/data/services";
import { cities } from "@/data/cities";
import { cases } from "@/data/cases";
import { generalFaq } from "@/data/faq";
import { LeadForm } from "@/components/site/LeadForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Clock, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { getServiceImage } from "@/lib/serviceImages";
import geographyImg from "@/assets/geography.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Санитарные Решения РФ — аварийная санитарная служба 24/7 по ЮФО и Крыму" },
      { name: "description", content: "Аварийная санитарная очистка, дезинфекция, удаление плесени, фумигация. Краснодар, Сочи, Ростов-на-Дону, Крым. Выезд бригады 24/7." },
      { property: "og:title", content: "Санитарные Решения РФ — аварийная санитарная служба 24/7" },
      { property: "og:description", content: "Аварийная санобработка по ЮФО и Крыму. Выезд бригады в течение 1–3 часов." },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Санитарные Решения РФ",
          description:
            "Аварийная санитарная служба 24/7: дезинфекция, удаление плесени, фумигация, очистка после ЧС.",
          telephone: "+7-800-555-12-34",
          areaServed: [
            "Краснодар",
            "Сочи",
            "Ростов-на-Дону",
            "Симферополь",
            "Севастополь",
            "Ялта",
            "Евпатория",
            "Керчь",
          ],
          openingHours: "Mo-Su 00:00-23:59",
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100svh-76px)] overflow-hidden text-primary-foreground">
        <img
          src={geographyImg}
          alt="ЮФО и Крым с высоты"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/45 to-transparent" aria-hidden />
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
              <Button asChild size="lg" className="bg-urgent text-urgent-foreground hover:bg-urgent/90 shadow-lg shadow-urgent/30">
                <a href="tel:+78005551234"><Phone className="mr-2 h-4 w-4" />Срочный выезд</a>
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

      {/* Services */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
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

      {/* Geography */}
      <section className="relative overflow-hidden bg-surface py-16 md:py-24">
        <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 md:items-center">
          <div className="relative order-2 overflow-hidden rounded-2xl shadow-2xl md:order-1">
            <img src={geographyImg} alt="Побережье ЮФО и Крыма с воздуха" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-primary-foreground">
              <div>
                <div className="font-display text-xl font-bold">8 городов</div>
                <div className="text-xs opacity-80">Дежурные бригады 24/7</div>
              </div>
              <div className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">ЮФО + Крым</div>
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

      {/* When called */}
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

      {/* Steps */}
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

      {/* Cases */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Реальные кейсы</h2>
          <Link to="/cases" className="hidden text-sm font-semibold text-accent hover:underline md:inline">Все кейсы →</Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cases.slice(0, 6).map((c) => (
            <Card key={c.slug} className="p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">{c.objectType}</div>
              <h3 className="mt-2 font-display text-base font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.problem}</p>
              <div className="mt-4 text-xs text-muted-foreground">Срок: {c.duration}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-10 rounded-3xl border border-border bg-surface p-8 text-foreground md:grid-cols-2 md:p-14">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Нужен срочный выезд?</h2>
            <p className="mt-4 text-muted-foreground">Звоните в любое время — дежурная бригада на линии 24/7. Перезвоним за 15 минут после заявки.</p>
            <a href="tel:+78005551234" className="mt-6 inline-block font-display text-3xl font-bold text-accent">+7 (800) 555-12-34</a>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  );
}
