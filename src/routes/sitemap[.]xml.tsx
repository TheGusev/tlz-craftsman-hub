import { createFileRoute } from "@tanstack/react-router";
import { getSitemapEntries } from "@/lib/route-config";
import { SITE_URL } from "@/lib/site";

function buildSitemap(): string {
  const entries = getSitemapEntries();
  const body = entries
    .map((e) => {
      const parts = [
        `    <loc>${SITE_URL}${e.path}</loc>`,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
      ].filter(Boolean);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
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
