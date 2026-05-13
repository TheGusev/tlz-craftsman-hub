import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Award, Users, Truck } from "lucide-react";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => {
    const path = "/about";
    const canonical = buildCanonical(path);
    const title = "О компании — Санитарные Решения РФ";
    const description = "Санитарные Решения РФ — лицензированная санитарная служба по ЮФО и Крыму. Сертифицированные препараты, опытные бригады, гарантия результата.";
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
            buildBreadcrumbSchema([{ label: "О компании", path }]),
          ]),
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <Breadcrumbs items={[{ label: "О компании" }]} />
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">О компании</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        «Санитарные Решения РФ» — специализированная санитарная служба, работающая по Южному федеральному округу и Крыму. Мы выполняем аварийную очистку, дезинфекцию, обеззараживание и устранение последствий биологических и чрезвычайных загрязнений.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ShieldCheck, t: "Лицензия", d: "Все необходимые разрешения на санитарную деятельность и работу с пестицидами." },
          { icon: Award, t: "Сертификация", d: "Только сертифицированные МЗ РФ препараты, разрешённые в жилых помещениях." },
          { icon: Users, t: "Опыт", d: "Бригады с многолетним опытом работы на сложных объектах любого масштаба." },
          { icon: Truck, t: "24/7", d: "Дежурные бригады работают круглосуточно во всех городах присутствия." },
        ].map((b, i) => (
          <Card key={i} className="p-6">
            <b.icon className="h-8 w-8 text-accent" />
            <h3 className="mt-3 font-display text-lg font-bold">{b.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
          </Card>
        ))}
      </div>
      <div className="mt-12 space-y-6 text-base">
        <h2 className="font-display text-2xl font-bold">Наши принципы</h2>
        <p>Каждая ситуация — это срочность. Поэтому мы держим бригады в режиме 24/7 и приезжаем в течение 1–3 часов в Краснодаре, Сочи, Ростове-на-Дону и в течение 2–5 часов по Крыму.</p>
        <p>Каждый объект — это здоровье и безопасность. Мы используем только сертифицированные препараты и работаем по протоколам, утверждённым санитарными нормами РФ.</p>
        <p>Каждая биосанитарная задача — это конфиденциальность. Мы выезжаем в немаркированных автомобилях, без формы, без контакта с соседями.</p>
      </div>
    </div>
  );
}
