import { trackGoal } from "./analytics";

/**
 * Пары «город × услуга», для которых собираем составные цели в Метрике.
 * Цель: conversion_{city}_{service}. Не декартово произведение — только явные пары.
 */
const TRACKED_PAIRS = new Set<string>([
  // Крым и Сочи — 3 города × 3 услуги
  "simferopol:ochistka-uchastkov",
  "simferopol:unichtozhenie-tarakanov",
  "simferopol:posle-pozhara",
  "sevastopol:ochistka-uchastkov",
  "sevastopol:unichtozhenie-tarakanov",
  "sevastopol:posle-pozhara",
  "sochi:ochistka-uchastkov",
  "sochi:unichtozhenie-tarakanov",
  "sochi:posle-pozhara",
  // Москва и МО — уборка после пожара и после смерти
  "moskva:posle-pozhara",
  "moskva:dezinfekciya-posle-smerti",
  "moskovskaya-oblast:posle-pozhara",
  "moskovskaya-oblast:dezinfekciya-posle-smerti",
]);

export type ConversionType = "form" | "messenger" | "phone" | "quiz";

/**
 * Шлёт в Метрику цель `conversion_{city}_{service}`,
 * если пара (city, service) есть в whitelist. Иначе — no-op.
 */
export function trackCityConversion(
  city: string | undefined | null,
  service: string | undefined | null,
  type: ConversionType,
  params?: Record<string, unknown>,
) {
  if (!city || !service) return;
  if (!TRACKED_PAIRS.has(`${city}:${service}`)) return;
  trackGoal(`conversion_${city}_${service}`, { type, ...(params ?? {}) });
}
