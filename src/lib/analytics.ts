// Unified analytics helper — Yandex.Metrika + dataLayer.
// Safe no-op when VITE_YANDEX_METRIKA_ID is not set.

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const YM_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID ?? 0) || 0;

export function trackGoal(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    if (YM_ID && window.ym) window.ym(YM_ID, "reachGoal", name, params);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...(params ?? {}) });
  } catch {
    // ignore
  }
}

export function trackPageview(url: string) {
  if (typeof window === "undefined") return;
  try {
    if (YM_ID && window.ym) window.ym(YM_ID, "hit", url);
  } catch {
    // ignore
  }
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid",
  "gclid",
  "ymclid",
  "roistat",
  "_openstat",
] as const;

export type UtmData = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing?: string;
  referrer?: string;
};

const STORAGE_KEY = "sr_utm_v1";

export function captureUtm(): UtmData {
  if (typeof window === "undefined") return {};
  try {
    const url = new URL(window.location.href);
    const incoming: UtmData = {};
    UTM_KEYS.forEach((k) => {
      const v = url.searchParams.get(k);
      if (v) incoming[k] = v.slice(0, 200);
    });

    const stored = readUtm();
    const hasIncoming = Object.keys(incoming).length > 0;

    const merged: UtmData = hasIncoming
      ? {
          ...incoming,
          landing: window.location.pathname,
          referrer: document.referrer || undefined,
        }
      : stored;

    if (hasIncoming) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return {};
  }
}

export function readUtm(): UtmData {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmData) : {};
  } catch {
    return {};
  }
}
