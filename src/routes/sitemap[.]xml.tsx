import { createFileRoute } from "@tanstack/react-router";
import { services } from "@/data/services";
import { cities } from "@/data/cities";
import { serviceInCity } from "@/data/serviceInCity";
import { blogPosts } from "@/data/blog";

const SITE_URL = "https://example.com";

const staticPaths: { path: string; priority: string }[] = [
  { path: "/", priority: "1.0" },
  { path: "/services", priority: "0.9" },
  { path: "/cities", priority: "0.9" },
  { path: "/regions", priority: "0.7" },
  { path: "/regions/krym", priority: "0.7" },
  { path: "/cases", priority: "0.7" },
  { path: "/faq", priority: "0.6" },
  { path: "/prices", priority: "0.6" },
  { path: "/about", priority: "0.5" },
  { path: "/contacts", priority: "0.6" },
  { path: "/blog", priority: "0.6" },
];

function buildSitemap(): string {
  const urls: { loc: string; priority: string }[] = [];
  staticPaths.forEach((s) =>
    urls.push({ loc: `${SITE_URL}${s.path}`, priority: s.priority }),
  );
  services.forEach((s) =>
    urls.push({ loc: `${SITE_URL}/services/${s.slug}`, priority: "0.9" }),
  );
  cities.forEach((c) =>
    urls.push({ loc: `${SITE_URL}/cities/${c.slug}`, priority: "0.8" }),
  );
  serviceInCity.forEach((sc) =>
    urls.push({
      loc: `${SITE_URL}/cities/${sc.citySlug}/${sc.serviceSlug}`,
      priority: "0.8",
    }),
  );
  blogPosts.forEach((b) =>
    urls.push({ loc: `${SITE_URL}/blog/${b.slug}`, priority: "0.5" }),
  );

  const body = urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
