import { serviceInCity } from "@/data/serviceInCity";
import type { Service } from "@/data/services";

/**
 * Извлекает минимальную цену из текста вида "от 2 500 ₽".
 * Поддерживает обычные и неразрывные пробелы внутри числа.
 */
export function extractMinPriceFromContext(text: string | undefined): number | null {
  if (!text) return null;
  const match = text.match(/от\s+([\d\s\u00A0]+?)\s*₽/i);
  if (!match) return null;
  const digits = match[1].replace(/\D/g, "");
  if (!digits) return null;
  const value = parseInt(digits, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Возвращает минимальную цену услуги в конкретном городе:
 * 1) парсит из priceContext в serviceInCity,
 * 2) иначе берёт service.priceFrom,
 * 3) иначе null.
 */
export function getCityServicePrice(
  citySlug: string,
  service: Pick<Service, "slug" | "priceFrom">,
): number | null {
  const sc = serviceInCity.find(
    (x) => x.citySlug === citySlug && x.serviceSlug === service.slug,
  );
  if (sc) {
    const fromContext = extractMinPriceFromContext(sc.priceContext);
    if (fromContext) return fromContext;
    if (sc.localPricing?.from) return sc.localPricing.from;
  }
  return service.priceFrom ?? null;
}

export function formatPriceFrom(price: number): string {
  return `от ${price.toLocaleString("ru-RU")} ₽`;
}
