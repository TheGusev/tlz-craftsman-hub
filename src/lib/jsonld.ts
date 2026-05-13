import { SITE_URL, SITE_NAME, SITE_PHONE, SITE_EMAIL } from "./site";
import { buildCanonical } from "./seo";

type JsonLdNode = Record<string, unknown>;

interface FaqItem {
  q: string;
  a: string;
}

interface BreadcrumbInput {
  label: string;
  path?: string;
}

export function buildOrganizationSchema(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    areaServed: ["RU-KDA", "RU-ROS", "RU-STA", "RU-CR"],
    sameAs: [],
  };
}

export function buildWebSiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "ru-RU",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function buildWebPageSchema(opts: {
  path: string;
  name: string;
  description?: string;
}): JsonLdNode {
  const url = buildCanonical(opts.path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    inLanguage: "ru-RU",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(opts.description ? { description: opts.description } : {}),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbInput[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: it.label,
        ...(it.path ? { item: buildCanonical(it.path) } : {}),
      })),
    ],
  };
}

export function buildServiceSchema(opts: {
  path: string;
  name: string;
  description: string;
  serviceType?: string;
  priceFrom?: number;
  areaServed?: string;
}): JsonLdNode {
  return {
    "@type": "Service",
    "@id": `${buildCanonical(opts.path)}#service`,
    name: opts.name,
    description: opts.description,
    ...(opts.serviceType ? { serviceType: opts.serviceType } : {}),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: opts.areaServed ?? "ЮФО и Республика Крым",
    ...(opts.priceFrom
      ? {
          offers: {
            "@type": "Offer",
            price: opts.priceFrom,
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function buildLocalBusinessSchema(opts: {
  path: string;
  cityName: string;
  description?: string;
  address?: string;
  phone?: string;
  coordinates?: { lat: number; lng: number };
  areaServed?: string;
}): JsonLdNode {
  const url = buildCanonical(opts.path);
  return {
    "@type": "LocalBusiness",
    "@id": `${url}#localbusiness`,
    name: `${SITE_NAME} — ${opts.cityName}`,
    url,
    telephone: opts.phone ?? SITE_PHONE,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: opts.address,
            addressLocality: opts.cityName,
            addressCountry: "RU",
          },
        }
      : {}),
    ...(opts.coordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: opts.coordinates.lat,
            longitude: opts.coordinates.lng,
          },
        }
      : {}),
    areaServed: opts.areaServed ?? opts.cityName,
    openingHours: "Mo-Su 00:00-23:59",
  };
}

export function buildFAQSchema(faqs: FaqItem[]): JsonLdNode | null {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function buildArticleSchema(opts: {
  path: string;
  headline: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
}): JsonLdNode {
  return {
    "@type": "Article",
    "@id": `${buildCanonical(opts.path)}#article`,
    headline: opts.headline,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * Собирает массив schemas в единый блок @graph и возвращает строку JSON,
 * готовую для children скрипта application/ld+json.
 */
export function buildGraphHead(schemas: (JsonLdNode | null | undefined)[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas.filter((s): s is JsonLdNode => Boolean(s)),
  });
}
