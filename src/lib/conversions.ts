import { trackGoal } from "./analytics";

/**
 * Города и услуги, для которых собираем 9 составных целей в Метрике
 * (3 города × 3 услуги). Цель в Метрике: conversion_{city}_{service}.
 */
const TRACKED_CITIES = new Set(["simferopol", "sevastopol", "sochi"]);
const TRACKED_SERVICES = new Set([
  "ochistka-uchastkov",
  "unichtozhenie-tarakanov",
  "posle-pozhara",
]);

export type ConversionType = "form" | "messenger" | "phone" | "quiz";

/**
 * Шлёт в Метрику цель `conversion_{city}_{service}`.
 * Срабатывает только если city входит в TRACKED_CITIES,
 * а service — в TRACKED_SERVICES. Иначе — no-op.
 */
export function trackCityConversion(
  city: string | undefined | null,
  service: string | undefined | null,
  type: ConversionType,
  params?: Record<string, unknown>,
) {
  if (!city || !TRACKED_CITIES.has(city)) return;
  if (!service || !TRACKED_SERVICES.has(service)) return;
  trackGoal(`conversion_${city}_${service}`, { type, ...(params ?? {}) });
}
