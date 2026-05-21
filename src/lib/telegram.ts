// Отправка лидов через серверный роут /api/public/lead.
// Токены хранятся в секретах Lovable Cloud (TG_BOT_TOKEN, TG_CHAT_ID)
// и НИКОГДА не попадают на фронт.

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
  const res = await fetch("/api/public/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Lead API error ${res.status}: ${body}`);
  }
  markSent();
}
