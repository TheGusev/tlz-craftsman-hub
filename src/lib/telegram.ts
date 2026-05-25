// Отправка лидов через PHP-прокси /send.php (лежит рядом с фронтом на Beget).
// Токен бота и chat_id хранятся в send.php на сервере, не в бандле.

const RATE_LIMIT_KEY = "tg_lead_last_ts";
const RATE_LIMIT_MS = 30_000;

export type LeadPayload = {
  source: string;
  name?: string;
  phone: string;
  city?: string;
  objectType?: string;
  problem?: string;
  service?: string | null;
  urgency?: string;
  callTime?: string;
  comment?: string;
  utm?: Record<string, string>;
  landing?: string;
  referrer?: string;
};

export function checkRateLimit(): { ok: boolean; waitSec: number } {
  if (typeof window === "undefined") return { ok: true, waitSec: 0 };
  try {
    const last = Number(window.localStorage.getItem(RATE_LIMIT_KEY) ?? 0);
    const diff = Date.now() - last;
    if (last && diff < RATE_LIMIT_MS) {
      return { ok: false, waitSec: Math.ceil((RATE_LIMIT_MS - diff) / 1000) };
    }
    return { ok: true, waitSec: 0 };
  } catch {
    return { ok: true, waitSec: 0 };
  }
}

function markSent() {
  try {
    window.localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export async function sendLeadToTelegram(payload: LeadPayload): Promise<void> {
  const utmParts = payload.utm
    ? Object.entries(payload.utm)
        .map(([k, v]) => `${k}=${v}`)
        .join(" | ")
    : "";
  const commentParts = [payload.comment, payload.callTime ? `время звонка: ${payload.callTime}` : "", utmParts ? `UTM: ${utmParts}` : "", payload.referrer ? `referrer: ${payload.referrer}` : ""]
    .filter(Boolean)
    .join(" | ");

  const body = {
    phone: payload.phone,
    name: payload.name ?? "",
    city: payload.city ?? "",
    objectType: payload.objectType ?? "",
    problem: payload.problem ?? "",
    service: payload.service ?? "",
    urgency: payload.urgency ?? "",
    comment: commentParts,
    formName: payload.source,
    page:
      payload.landing ??
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  const res = await fetch("/send.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let json: { ok?: boolean; error?: string } = {};
  try {
    json = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `send.php error ${res.status}`);
  }

  markSent();
}
