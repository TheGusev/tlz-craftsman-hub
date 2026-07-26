import type { City } from "@/data/cities";
import { isVisibleCity } from "@/data/cities";

/**
 * Возвращает список городов для выпадающих списков: только видимые города
 * (Москва и МО) с Москвой на первом месте. Массив `cities` не мутируется.
 */
export function citiesForDropdown(list: City[]): City[] {
  const priority = ["moskva", "moskovskaya-oblast"];
  const head = priority
    .map((s) => list.find((c) => c.slug === s))
    .filter((c): c is City => Boolean(c));
  const rest = list.filter((c) => !priority.includes(c.slug) && isVisibleCity(c.slug));
  return [...head, ...rest];
}

/**
 * Как citiesForDropdown, но гарантирует наличие контекстного города страницы
 * (например, при заходе на скрытый город по прямой ссылке).
 */
export function citiesForDropdownWith(list: City[], contextSlug?: string): City[] {
  const base = citiesForDropdown(list);
  if (!contextSlug || base.some((c) => c.slug === contextSlug)) return base;
  const ctx = list.find((c) => c.slug === contextSlug);
  return ctx ? [...base, ctx] : base;
}
