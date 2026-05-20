import { useParams } from "@tanstack/react-router";
import { getCity, type City } from "@/data/cities";

/**
 * Возвращает текущий "контекстный" город, если URL содержит $citySlug
 * (страницы /cities/$citySlug, /cities/$citySlug/$serviceSlug, /lp/$citySlug/$serviceSlug).
 * На остальных страницах возвращает undefined.
 */
export function useActiveCity(): City | undefined {
  const params = useParams({ strict: false }) as { citySlug?: string };
  if (!params.citySlug) return undefined;
  return getCity(params.citySlug);
}
