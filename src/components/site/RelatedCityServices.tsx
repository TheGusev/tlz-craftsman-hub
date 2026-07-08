import { Link } from "@tanstack/react-router";
import type { City } from "@/data/cities";
import type { Service } from "@/data/services";
import { getRelatedServices, getRelatedBlogLinks } from "@/lib/relatedContent";

export function RelatedCityServices({ city, service }: { city: City; service: Service }) {
  const related = getRelatedServices(service.slug, 6);
  const blogLinks = getRelatedBlogLinks(service.slug, 3);

  return (
    <>
      {related.length > 0 && (
        <section aria-labelledby="related-services-heading">
          <h2 id="related-services-heading" className="font-display text-2xl font-bold">
            Другие услуги {city.nameLocative}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Смежные направления, которые часто заказывают вместе с услугой «{service.shortName}» {city.nameLocative}.
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/cities/$citySlug/$serviceSlug"
                  params={{ citySlug: city.slug, serviceSlug: r.slug }}
                  className="block h-full rounded-xl border border-border bg-card p-4 transition hover:border-accent"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {r.cluster}
                  </div>
                  <div className="mt-1 font-display font-bold">
                    {r.shortName} {city.nameLocative}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {r.intro}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {blogLinks.length > 0 && (
        <section aria-labelledby="related-blog-heading">
          <h2 id="related-blog-heading" className="font-display text-2xl font-bold">
            Читайте в блоге
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Подробные разборы по теме — с примерами по ЮФО и Крыму.
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {blogLinks.map((b) => (
              <li key={b.href}>
                <a
                  href={b.href}
                  className="block h-full rounded-xl border border-border bg-card p-4 transition hover:border-accent"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Статья · {b.post.readingMinutes} мин
                  </div>
                  <div className="mt-1 font-display font-bold leading-snug">
                    {b.heading}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    Из статьи «{b.post.title}»
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
