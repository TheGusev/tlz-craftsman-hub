import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { cases, type Case } from "@/data/cases";
import { getCity } from "@/data/cities";
import { getService } from "@/data/services";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Lightbox } from "@/components/site/Lightbox";
import { getCaseGallery } from "@/lib/caseGallery";
import {
  buildGraphHead,
  buildBreadcrumbSchema,
  buildArticleSchema,
  buildImageGallerySchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";
import { robotsMetaFor } from "@/lib/seoRobots";

export const Route = createFileRoute("/cases/$slug")({
  loader: ({ params }): { item: Case } => {
    const item = cases.find((c) => c.slug === params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Кейс не найден" }] };
    const { item } = loaderData;
    const path = `/cases/${item.slug}`;
    const canonical = buildCanonical(path);
    const description = `${item.problem} Результат: ${item.result}`.slice(0, 300);
    const gallery = getCaseGallery(item.slug);
    const cover = gallery[0]?.src;
    return {
      meta: [
        { title: `${item.title} — кейс` },
        { name: "description", content: description },
        { property: "og:title", content: item.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        ...robotsMetaFor(path),
        ...(cover ? [{ property: "og:image", content: cover.startsWith("http") ? cover : `${canonical.split("/cases/")[0]}${cover}` }] : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: buildGraphHead([
            buildBreadcrumbSchema([
              { label: "Кейсы", path: "/cases" },
              { label: item.title, path },
            ]),
            buildArticleSchema({ path, headline: item.title, description }),
            gallery.length > 0
              ? buildImageGallerySchema({
                  path,
                  name: item.title,
                  description,
                  images: gallery.map((p) => ({ url: p.src, caption: p.caption })),
                })
              : null,
          ]),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Кейс не найден</h1>
      <Link to="/cases" className="mt-4 inline-block text-accent hover:underline">← Все кейсы</Link>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Ошибка загрузки</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </main>
  ),
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { item } = Route.useLoaderData();
  const city = getCity(item.city);
  const service = getService(item.service);
  const gallery = getCaseGallery(item.slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const related = cases
    .filter((c) => c.slug !== item.slug && (c.service === item.service || c.city === item.city))
    .slice(0, 3);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
      <Breadcrumbs
        items={[
          { label: "Кейсы", to: "/cases" },
          { label: item.title },
        ]}
      />

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {service && (
          <Link to="/services/$serviceSlug" params={{ serviceSlug: service.slug }} className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">
            {service.shortName}
          </Link>
        )}
        {city && (
          <Link to="/cities/$citySlug" params={{ citySlug: city.slug }} className="rounded-full bg-secondary/10 px-3 py-1 font-semibold text-secondary">
            {city.name}
          </Link>
        )}
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{item.objectType}</span>
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">{item.title}</h1>

      {gallery.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 md:gap-4">
          {gallery.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={`Открыть фото: ${p.caption}`}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading={i === 0 ? "eager" : "lazy"}
                className="aspect-[16/10] w-full object-cover transition group-hover:scale-105"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-left text-xs font-semibold text-white">
                {p.caption}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Задача</div>
          <p className="mt-2 text-sm leading-relaxed">{item.problem}</p>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Что сделали</div>
          <ul className="mt-2 space-y-1 text-sm">
            {item.works.map((w: string, i: number) => <li key={i}>— {w}</li>)}
          </ul>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Срок и результат</div>
          <div className="mt-2 text-sm font-semibold">{item.duration}</div>
          <p className="mt-2 text-sm leading-relaxed">{item.result}</p>
        </Card>
      </div>

      <div className="mt-10 rounded-lg bg-accent/5 p-6 text-center">
        <h2 className="font-display text-xl font-bold">Похожая задача? Приедем на бесплатный осмотр</h2>
        <p className="mt-2 text-sm text-muted-foreground">Выезд бригады в течение 60 минут, расчёт — на месте.</p>
        <Link to="/contacts" className="mt-4 inline-block rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground hover:bg-accent/90">
          Оставить заявку
        </Link>
      </div>

      {related.length > 0 && (
        <aside className="mt-12">
          <h2 className="font-display text-xl font-bold">Похожие кейсы</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r) => {
              const rGallery = getCaseGallery(r.slug);
              const cover = rGallery[0]?.src;
              return (
                <Link
                  key={r.slug}
                  to="/cases/$slug"
                  params={{ slug: r.slug }}
                  className="group block overflow-hidden rounded-lg border border-border transition hover:border-accent"
                >
                  {cover && <img src={cover} alt={r.title} loading="lazy" className="aspect-[16/10] w-full object-cover transition group-hover:scale-105" />}
                  <div className="p-3">
                    <h3 className="font-display text-sm font-bold leading-tight">{r.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      )}

      <div className="mt-12 border-t border-border pt-6">
        <Link to="/cases" className="text-sm font-semibold text-accent hover:underline">← Все кейсы</Link>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </main>
  );
}
