import { services } from "@/data/services";
import { cities } from "@/data/cities";
import { serviceInCity } from "@/data/serviceInCity";
import { blogPosts } from "@/data/blog";
import { cases } from "@/data/cases";
import { SITE_URL } from "@/lib/site";

export type RouteEntry = {
  path: string;
  priority?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

const staticEntries: RouteEntry[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "weekly" },
  { path: "/cities", priority: "0.9", changefreq: "weekly" },
  { path: "/regions", priority: "0.7", changefreq: "monthly" },
  { path: "/regions/krym", priority: "0.7", changefreq: "monthly" },
  { path: "/regions/moskva-mo", priority: "0.7", changefreq: "monthly" },
  { path: "/cases", priority: "0.7", changefreq: "monthly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/prices", priority: "0.6", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "yearly" },
  { path: "/contacts", priority: "0.6", changefreq: "yearly" },
  { path: "/vyezd", priority: "0.6", changefreq: "monthly" },
  { path: "/garantii", priority: "0.5", changefreq: "monthly" },
  { path: "/licenzii", priority: "0.5", changefreq: "monthly" },
  { path: "/otzyvy", priority: "0.6", changefreq: "monthly" },
  { path: "/oplata", priority: "0.3", changefreq: "yearly" },
  { path: "/oferta", priority: "0.3", changefreq: "yearly" },
  { path: "/rekvizity", priority: "0.3", changefreq: "yearly" },
  { path: "/soglasie", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/blog", priority: "0.6", changefreq: "weekly" },
];

export function getAllRoutes(): RouteEntry[] {
  const dynamic: RouteEntry[] = [
    ...services.map((s) => ({
      path: `/services/${s.slug}`,
      priority: "0.9",
      changefreq: "weekly" as const,
    })),
    ...cities.map((c) => ({
      path: `/cities/${c.slug}`,
      priority: "0.8",
      changefreq: "weekly" as const,
    })),
    ...serviceInCity
      .filter((sc) => sc.isReady !== false)
      .map((sc) => ({
        path: `/cities/${sc.citySlug}/${sc.serviceSlug}`,
        priority: "0.8",
        changefreq: "weekly" as const,
      })),
    ...blogPosts.map((b) => ({
      path: `/blog/${b.slug}`,
      priority: "0.5",
      changefreq: "monthly" as const,
    })),
    ...cases.map((c) => ({
      path: `/cases/${c.slug}`,
      priority: "0.6",
      changefreq: "monthly" as const,
    })),
  ];
  return [...staticEntries, ...dynamic];
}

export function getCanonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export function getSitemapEntries(): RouteEntry[] {
  return getAllRoutes();
}
