import { trackGoal } from "./analytics";

/**
 * Города, для которых собираем составную цель «конверсия города» в Метрике.
 */
const TRACKED_CITIES = new Set(["simferopol", "sevastopol", "sochi"]);

export type ConversionType = "form" | "messenger" | "phone" | "quiz";

/**
 * Шлёт в Метрику две цели:
 *   1) conversion_{city}            — единая «составная» цель города
 *   2) conversion_{city}_{type}     — детализация по каналу
 * Если city не задан или не входит в TRACKED_CITIES — ничего не делает.
 */
export function trackCityConversion(
  city: string | undefined | null,
  type: ConversionType,
  params?: Record<string, unknown>,
) {
  if (!city || !TRACKED_CITIES.has(city)) return;
  trackGoal(`conversion_${city}`, { type, ...(params ?? {}) });
  trackGoal(`conversion_${city}_${type}`, params);
}
