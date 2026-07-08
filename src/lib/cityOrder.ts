import type { City } from "@/data/cities";

/**
 * Возвращает список городов с Москвой и МО в начале для выпадающих списков.
 * Массив `cities` при этом не мутируется — сортировка только для UI дропдаунов.
 */
export function citiesForDropdown(list: City[]): City[] {
  const priority = ["moskva", "moskovskaya-oblast"];
  const head = priority
    .map((s) => list.find((c) => c.slug === s))
    .filter((c): c is City => Boolean(c));
  const rest = list.filter((c) => !priority.includes(c.slug));
  return [...head, ...rest];
}
