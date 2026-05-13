import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getBlogPost, type BlogPost } from "@/data/blog";
import { getService } from "@/data/services";
import type { Service } from "@/data/services";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  buildGraphHead,
  buildBreadcrumbSchema,
  buildArticleSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }): { post: BlogPost } => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Статья не найдена" }] };
    const { post } = loaderData;
    const path = `/blog/${post.slug}`;
    const canonical = buildCanonical(path);
    return {
      meta: [
        { title: post.metaTitle },
        { name: "description", content: post.metaDescription },
        { property: "og:title", content: post.metaTitle },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: buildGraphHead([
            buildBreadcrumbSchema([
              { label: "Блог", path: "/blog" },
              { label: post.title, path },
            ]),
            buildArticleSchema({
              path,
              headline: post.title,
              description: post.excerpt,
              datePublished: post.publishedAt,
            }),
          ]),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Статья не найдена</h1>
      <Link to="/blog" className="mt-4 inline-block text-accent hover:underline">
        ← Все статьи
      </Link>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Ошибка загрузки</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </main>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related: Service[] = post.relatedServiceSlugs
    .map((s: string) => getService(s))
    .filter((s: Service | undefined): s is Service => Boolean(s));

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 md:py-16">
      <Breadcrumbs
        items={[
          { label: "Блог", to: "/blog" },
          { label: post.title },
        ]}
      />
      <article className="mt-6">
        <time className="text-xs font-semibold uppercase tracking-wider text-accent">
          {new Date(post.publishedAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {post.readingMinutes} мин чтения
        </time>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>

        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          {post.body.map((section: BlogPost["body"][number], i: number) => (
            <section key={i} className="mt-6">
              {section.heading && (
                <h2 className="font-display text-xl font-bold md:text-2xl">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p: string, j: number) => (
                <p key={j} className="mt-3 text-base leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {related.length > 0 && (
          <aside className="mt-12">
            <h2 className="font-display text-xl font-bold">По теме</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((s: Service) => (
                <Card key={s.slug} className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {s.cluster}
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold">
                    {s.shortName}
                  </h3>
                  <Link
                    to="/services/$serviceSlug"
                    params={{ serviceSlug: s.slug }}
                    className="mt-3 inline-block text-sm font-semibold text-secondary hover:text-accent"
                  >
                    Перейти к услуге →
                  </Link>
                </Card>
              ))}
            </div>
          </aside>
        )}

        <div className="mt-12 border-t border-border pt-6">
          <Link to="/blog" className="text-sm font-semibold text-accent hover:underline">
            ← Все статьи
          </Link>
        </div>
      </article>
    </main>
  );
}
