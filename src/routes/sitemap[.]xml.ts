import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { cities } from "@/data/cities";
import { services } from "@/data/services";
import { cases } from "@/data/cases";
import { blogPosts } from "@/data/blog";

const BASE_URL = "https://sanitarnyeresheniya.ru";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/services", changefreq: "weekly", priority: "0.9" },
          { path: "/cities", changefreq: "weekly", priority: "0.9" },
          { path: "/prices", changefreq: "weekly", priority: "0.8" },
          { path: "/contacts", changefreq: "monthly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/cases", changefreq: "weekly", priority: "0.7" },
          { path: "/otzyvy", changefreq: "monthly", priority: "0.6" },
          { path: "/garantii", changefreq: "monthly", priority: "0.6" },
          { path: "/vyezd", changefreq: "monthly", priority: "0.6" },
          { path: "/licenzii", changefreq: "monthly", priority: "0.5" },
          { path: "/oplata", changefreq: "monthly", priority: "0.5" },
          { path: "/rekvizity", changefreq: "monthly", priority: "0.4" },
          { path: "/regions", changefreq: "monthly", priority: "0.6" },
          { path: "/regions/krym", changefreq: "monthly", priority: "0.6" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/oferta", changefreq: "yearly", priority: "0.3" },
          { path: "/soglasie", changefreq: "yearly", priority: "0.3" },
        ];

        for (const s of services) {
          entries.push({ path: `/services/${s.slug}`, changefreq: "weekly", priority: "0.8" });
        }
        for (const c of cities) {
          entries.push({ path: `/cities/${c.slug}`, changefreq: "weekly", priority: "0.8" });
          for (const serviceSlug of c.popularServices) {
            entries.push({
              path: `/cities/${c.slug}/${serviceSlug}`,
              changefreq: "weekly",
              priority: "0.7",
            });
          }
        }
        for (const p of blogPosts) {
          entries.push({ path: `/blog/${p.slug}`, changefreq: "monthly", priority: "0.6" });
        }
        for (const k of cases) {
          entries.push({ path: `/cases/${k.slug}`, changefreq: "monthly", priority: "0.6" });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
