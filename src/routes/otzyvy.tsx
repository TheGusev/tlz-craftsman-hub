import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Star, Quote } from "lucide-react";
import { buildCanonical } from "@/lib/seo";
import { reviews, AGGREGATE_RATING } from "@/data/reviews";

const PATH = "/otzyvy";
const TITLE = "Отзывы клиентов о санитарной службе — реальные кейсы и оценки";
const DESC =
  "Реальные отзывы клиентов о работе аварийной санитарной службы: дезинфекция, удаление плесени, фумигация, очистка после ЧС. Рейтинг 4.9 / 5 на основе 217 оценок.";

export const Route = createFileRoute("/otzyvy")({
  component: OtzyvyPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: buildCanonical(PATH) },
    ],
    links: [{ rel: "canonical", href: buildCanonical(PATH) }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Санитарные Решения РФ",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: AGGREGATE_RATING.value,
            reviewCount: AGGREGATE_RATING.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.text,
          })),
        }),
      },
    ],
  }),
});

function OtzyvyPage() {
  return (
    <>
      <PageHero
        eyebrow="Отзывы"
        title="Реальные отзывы клиентов"
        description={`Средняя оценка ${AGGREGATE_RATING.value} / 5 на основе ${AGGREGATE_RATING.count} отзывов с Яндекс.Карт, 2ГИС и личных обращений.`}
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Отзывы" }]}
      />
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < r.rating ? "fill-current" : "opacity-30"}`}
                    aria-hidden
                  />
                ))}
              </div>
              <Quote className="mt-3 h-5 w-5 text-muted-foreground" aria-hidden />
              <p className="mt-2 flex-1 text-sm leading-relaxed">{r.text}</p>
              <footer className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground">{r.author}</div>
                <div>
                  {r.city} · {r.service} · {r.date}
                </div>
                {r.source && <div className="mt-1 opacity-70">Источник: {r.source}</div>}
              </footer>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
