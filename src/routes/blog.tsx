import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { blogPosts } from "@/data/blog";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Блог — Санитарные Решения РФ" },
      {
        name: "description",
        content:
          "Полезные материалы о санитарных работах: плесень после потопа, действия после пожара, фумигация, биосанитарные случаи.",
      },
      { property: "og:title", content: "Блог — Санитарные Решения РФ" },
      {
        property: "og:description",
        content:
          "Статьи о санитарных работах, дезинфекции, удалении плесени и последствий ЧС.",
      },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { pathname } = useLocation();
  if (pathname.replace(/\/$/, "") !== "/blog") {
    return <Outlet />;
  }
  return (
    <main>
      <PageHero
        title="Блог"
        description="Разбираем, как правильно действовать после ЧС, чем опасна плесень и трупный запах, когда нужна фумигация и как не переплачивать за санитарные работы."
      />
      <div className="container mx-auto px-4 py-10 md:py-12">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((p) => (
          <Card key={p.slug} className="flex flex-col p-6">
            <time className="text-xs font-semibold uppercase tracking-wider text-accent">
              {new Date(p.publishedAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <h2 className="mt-3 font-display text-lg font-bold">{p.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {p.excerpt}
            </p>
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-secondary hover:text-accent"
            >
              Читать <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
