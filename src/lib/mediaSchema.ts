// Медиа-узлы JSON-LD (VideoObject + ImageGallery/ImageObject) для страниц услуг и город×услуга.
// Единый источник, чтобы разметка на /services/... и /cities/.../... не расходилась.
import { buildImageGallerySchema, buildVideoObjectSchema } from "./jsonld";
import { getFloodGallery, getFloodVideo, FLOOD_SERVICE_SLUG } from "./floodGallery";
import { getFireGallery, FIRE_SERVICE_SLUG } from "./fireGallery";
import type { BeforeAfterPhoto } from "./floodGallery";

export const MEDIA_SERVICE_SLUGS = [FLOOD_SERVICE_SLUG, FIRE_SERVICE_SLUG] as const;

/** Есть ли у услуги реальная фотогалерея. */
export function hasServiceGallery(serviceSlug: string): boolean {
  return (MEDIA_SERVICE_SLUGS as readonly string[]).includes(serviceSlug);
}

/** Есть ли у услуги видео с выезда. */
export function hasServiceVideo(serviceSlug: string): boolean {
  return serviceSlug === FLOOD_SERVICE_SLUG;
}

export function getServiceGallery(serviceSlug: string, cityLocative?: string): BeforeAfterPhoto[] {
  if (serviceSlug === FLOOD_SERVICE_SLUG) return getFloodGallery(cityLocative);
  if (serviceSlug === FIRE_SERVICE_SLUG) return getFireGallery(cityLocative);
  return [];
}

/**
 * Возвращает медиа-узлы графа для страницы услуги (опционально — в разрезе города).
 * `geoSuffix` — локатив города («в Москве») либо undefined для общей страницы услуги.
 */
export function buildServiceMediaNodes(opts: {
  path: string;
  serviceSlug: string;
  serviceShortName: string;
  cityLocative?: string;
}): Record<string, unknown>[] {
  const { path, serviceSlug, serviceShortName, cityLocative } = opts;
  const geo = cityLocative ? ` ${cityLocative}` : "";
  const nodes: Record<string, unknown>[] = [];

  if (hasServiceVideo(serviceSlug)) {
    const v = getFloodVideo(cityLocative);
    nodes.push(
      buildVideoObjectSchema({
        path,
        name: `${serviceShortName}${geo} — видео с выезда бригады`,
        description: v.caption,
        contentUrl: v.src,
        thumbnailUrl: v.poster,
        uploadDate: v.uploadDate,
        duration: v.duration,
        width: v.width,
        height: v.height,
        posterWidth: v.posterWidth,
        posterHeight: v.posterHeight,
      }),
    );
  }

  const photos = getServiceGallery(serviceSlug, cityLocative);
  if (photos.length > 0) {
    const gallery = buildImageGallerySchema({
      path,
      name: `${serviceShortName}${geo} — фото работ до и после`,
      description: `Реальные фотографии с объектов: ${serviceShortName.toLowerCase()}${geo}, состояние до начала работ и результат бригады.`,
      images: photos.map((p) => ({
        url: p.src,
        caption: p.caption,
        description: p.alt,
        width: p.width,
        height: p.height,
      })),
    });
    if (gallery) nodes.push(gallery);
  }

  return nodes;
}
