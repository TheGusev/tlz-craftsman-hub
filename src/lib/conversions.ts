import { trackGoal } from "./analytics";
import { VISIBLE_CITY_SLUGS } from "@/data/cities";
import { services } from "@/data/services";

/**
 * Пары «город × услуга», для которых собираем составные цели в Метрике.
 * Цель: conversion_{city}_{service}.
 *
 * Сейчас в UI показаны только Москва и Московская область, поэтому цели
 * собираем по всем услугам в этих двух городах. Южные города скрыты —
 * пары по ним не собираем (вернём, когда города снова появятся в UI).
 */
const TRACKED_PAIRS = new Set<string>(
  VISIBLE_CITY_SLUGS.flatMap((city) => services.map((s) => `${city}:${s.slug}`)),
);

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
