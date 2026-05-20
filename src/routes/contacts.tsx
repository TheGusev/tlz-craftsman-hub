import { createFileRoute } from "@tanstack/react-router";
import { cities } from "@/data/cities";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/contacts")({
  head: () => {
    const path = "/contacts";
    const canonical = buildCanonical(path);
    const title = "Контакты — Санитарные Решения РФ";
    const description = "Контакты санитарной службы: телефон 24/7, WhatsApp, email. Краснодар, Сочи, Ростов-на-Дону, Крым.";
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
            buildBreadcrumbSchema([{ label: "Контакты", path }]),
          ]),
        },
      ],
    };
  },
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Контакты" }]} />
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Контакты</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">Дежурная бригада на линии круглосуточно. Перезваниваем в течение 15 минут после заявки.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Card className="p-6">
            <a href="tel:+78005551234" aria-label="Позвонить" className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Единый телефон</div>
                <div className="text-xs text-muted-foreground">Круглосуточно, без выходных</div>
              </div>
            </a>
          </Card>
          <Card className="p-6">
            <a href="https://wa.me/78005551234" aria-label="Написать в WhatsApp" className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">WhatsApp</div>
                <div className="text-xs text-muted-foreground">Можно отправить фото и видео объекта</div>
              </div>
            </a>
          </Card>
          <Card className="p-6">
            <Mail className="h-6 w-6 text-accent" />
            <div className="mt-3 text-sm text-muted-foreground">Email</div>
            <a href="mailto:info@sanresheniya.ru" className="mt-1 block font-display text-xl font-bold">info@sanresheniya.ru</a>
          </Card>
          <Card className="p-6">
            <MapPin className="h-6 w-6 text-accent" />
            <div className="mt-3 font-display text-lg font-bold">Города присутствия</div>
            <ul className="mt-3 space-y-1 text-sm">
              {cities.map((c) => <li key={c.slug}>— {c.name} ({c.region})</li>)}
            </ul>
          </Card>
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-bold">Оставить заявку</h2>
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
