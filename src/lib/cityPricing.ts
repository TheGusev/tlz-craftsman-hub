import { serviceInCity } from "@/data/serviceInCity";
import type { Service } from "@/data/services";

/**
 * Извлекает минимальную цену из текста вида "от 2 500 ₽".
 * Поддерживает обычные и неразрывные пробелы внутри числа.
 */
export function extractMinPriceFromContext(text: string | undefined): number | null {
  if (!text) return null;
  // Поддерживаем и старый формат "от 2 500 ₽", и новый "2 500 ₽"
  const match = text.match(/(?:от\s+)?([\d\s\u00A0]+?)\s*₽/i);
  if (!match) return null;
  const digits = match[1].replace(/\D/g, "");
  if (!digits) return null;
  const value = parseInt(digits, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

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
  return `${price.toLocaleString("ru-RU")} ₽`;
}

