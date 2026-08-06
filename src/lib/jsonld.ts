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
    ...(SITE_PHONE ? { telephone: SITE_PHONE } : {}),
    email: SITE_EMAIL,
    areaServed: ["RU-MOW", "RU-MOS"],
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
  primaryImage?: { url: string; caption?: string; width?: number; height?: number };
  /** Связать страницу с её BreadcrumbList (@id <url>#breadcrumb) */
  withBreadcrumb?: boolean;
  /** Главная сущность страницы: "#service", "#localbusiness", "#article" и т.п. */
  mainEntity?: string;
  /** Медиа страницы: "#gallery", "#video" */
  associatedMedia?: string[];
  dateModified?: string;
}): JsonLdNode {
  const url = buildCanonical(opts.path);
  const imgUrl = opts.primaryImage
    ? opts.primaryImage.url.startsWith("http")
      ? opts.primaryImage.url
      : `${SITE_URL}${opts.primaryImage.url}`
    : null;
  const media = (opts.associatedMedia ?? []).map((frag) => ({ "@id": `${url}${frag}` }));
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    inLanguage: "ru-RU",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#organization` },
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.withBreadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...(opts.mainEntity ? { mainEntity: { "@id": `${url}${opts.mainEntity}` } } : {}),
    ...(media.length ? { associatedMedia: media } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(imgUrl && opts.primaryImage
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            "@id": `${url}#primaryimage`,
            url: imgUrl,
            contentUrl: imgUrl,
            ...(opts.primaryImage.caption ? { caption: opts.primaryImage.caption } : {}),
            ...(opts.primaryImage.width ? { width: opts.primaryImage.width } : {}),
            ...(opts.primaryImage.height ? { height: opts.primaryImage.height } : {}),
          },
          image: { "@id": `${url}#primaryimage` },
        }
      : {}),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbInput[], path?: string): JsonLdNode {
  const url = path ? buildCanonical(path) : null;
  return {
    "@type": "BreadcrumbList",
    ...(url ? { "@id": `${url}#breadcrumb` } : {}),
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
  image?: string;
}): JsonLdNode {
  const url = buildCanonical(opts.path);
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: opts.name,
    description: opts.description,
    url,
    ...(opts.serviceType ? { serviceType: opts.serviceType } : {}),
    provider: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    ...(opts.image
      ? { image: opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}` }
      : {}),
    areaServed: opts.areaServed ?? "Москва и Московская область",
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
    ...((opts.phone ?? SITE_PHONE) ? { telephone: opts.phone ?? SITE_PHONE } : {}),
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
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@id": `${url}#webpage` },
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

const absUrl = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);

export type SchemaImage = {
  url: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
};

/** Отдельный ImageObject (используется как primaryImageOfPage и внутри галерей). */
export function buildImageObject(img: SchemaImage, id?: string): JsonLdNode {
  return {
    "@type": "ImageObject",
    ...(id ? { "@id": id } : {}),
    url: absUrl(img.url),
    contentUrl: absUrl(img.url),
    ...(img.caption ? { caption: img.caption } : {}),
    ...(img.description ? { description: img.description } : {}),
    ...(img.width ? { width: img.width } : {}),
    ...(img.height ? { height: img.height } : {}),
  };
}

export function buildImageGallerySchema(opts: {
  path: string;
  name: string;
  description?: string;
  images: SchemaImage[];
}): JsonLdNode | null {
  if (!opts.images || opts.images.length === 0) return null;
  const url = buildCanonical(opts.path);
  return {
    "@type": "ImageGallery",
    "@id": `${url}#gallery`,
    name: opts.name,
    url,
    inLanguage: "ru-RU",
    ...(opts.description ? { description: opts.description } : {}),
    isPartOf: { "@id": `${url}#webpage` },
    image: opts.images.map((img) => buildImageObject(img)),
  };
}

export function buildVideoObjectSchema(opts: {
  path: string;
  name: string;
  description: string;
  contentUrl: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  width?: number;
  height?: number;
  posterWidth?: number;
  posterHeight?: number;
}): JsonLdNode {
  const url = buildCanonical(opts.path);
  return {
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: opts.name,
    description: opts.description,
    contentUrl: absUrl(opts.contentUrl),
    thumbnailUrl: [absUrl(opts.thumbnailUrl)],
    thumbnail: buildImageObject({
      url: opts.thumbnailUrl,
      caption: opts.name,
      width: opts.posterWidth,
      height: opts.posterHeight,
    }),
    uploadDate: opts.uploadDate,
    ...(opts.duration ? { duration: opts.duration } : {}),
    ...(opts.width ? { width: opts.width } : {}),
    ...(opts.height ? { height: opts.height } : {}),
    encodingFormat: "video/mp4",
    inLanguage: "ru-RU",
    isFamilyFriendly: true,
    potentialAction: {
      "@type": "WatchAction",
      target: url,
    },
    isPartOf: { "@id": `${url}#webpage` },
    publisher: { "@id": `${SITE_URL}/#organization` },
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
