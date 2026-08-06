// Единое правило индексации страниц.
// Скрытые в интерфейсе города (всё, кроме Москвы и МО) и кейсы не должны
// индексироваться и не попадают в sitemap: ссылок на них с сайта нет,
// для поисковика это страницы-сироты и слабые дубли.
import { isVisibleCity } from "@/data/cities";
import { CASES_PUBLIC } from "@/data/cases";

export const ROBOTS_INDEX = "index,follow,max-image-preview:large,max-snippet:-1";
export const ROBOTS_NOINDEX = "noindex,follow";

/** Должен ли путь индексироваться и попадать в sitemap.xml. */
export function isIndexablePath(path: string): boolean {
  if (path === "/cases" || path.startsWith("/cases/")) return CASES_PUBLIC;
  const city = /^\/cities\/([^/]+)/.exec(path);
  if (city) return isVisibleCity(city[1]);
  return true;
}

export function robotsFor(path: string): string {
  return isIndexablePath(path) ? ROBOTS_INDEX : ROBOTS_NOINDEX;
}

/**
 * meta-теги robots для head роута. Для индексируемых страниц возвращает пустой
 * массив — правило уже задано в __root, дублировать не нужно.
 */
export function robotsMetaFor(path: string): { name: "robots"; content: string }[] {
  return isIndexablePath(path) ? [] : [{ name: "robots", content: ROBOTS_NOINDEX }];
}
