import { SITE_URL } from "./site";

/**
 * Возвращает абсолютный canonical URL без trailing slash и query-параметров.
 * Передавать сюда нужно только path (например, "/services/dezinfekciya").
 */
export function buildCanonical(path: string): string {
  const clean = "/" + path.replace(/^\/+/, "").split("?")[0].split("#")[0].replace(/\/+$/, "");
  return SITE_URL + (clean === "/" ? "" : clean);
}
