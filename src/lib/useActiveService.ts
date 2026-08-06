import { useParams } from "@tanstack/react-router";
import { getService, type Service } from "@/data/services";

/**
 * Возвращает текущую "контекстную" услугу, если URL содержит $serviceSlug
 * (страницы /services/$serviceSlug, /cities/$citySlug/$serviceSlug, /lp/...).
 */
export function useActiveService(): Service | undefined {
  const params = useParams({ strict: false }) as { serviceSlug?: string };
  if (!params.serviceSlug) return undefined;
  return getService(params.serviceSlug);
}
