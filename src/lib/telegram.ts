// Отправка лидов напрямую в Telegram Bot API с фронтенда.
// Токен/чат берутся из .env: VITE_TG_BOT_TOKEN и VITE_TG_CHAT_ID.

const BOT_TOKEN = String(import.meta.env.VITE_TG_BOT_TOKEN ?? "").trim();
const CHAT_ID = String(import.meta.env.VITE_TG_CHAT_ID ?? "").trim();

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

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatLead(p: LeadPayload): string {
  const lines: string[] = [];
  lines.push(`<b>🔔 Новая заявка</b> <i>[${escapeHtml(p.source)}]</i>`);
  if (p.name) lines.push(`<b>Имя:</b> ${escapeHtml(p.name)}`);
  lines.push(`<b>Телефон:</b> ${escapeHtml(p.phone)}`);
  if (p.city) lines.push(`<b>Город:</b> ${escapeHtml(p.city)}`);
  if (p.objectType) lines.push(`<b>Объект:</b> ${escapeHtml(p.objectType)}`);
  if (p.problem) lines.push(`<b>Проблема:</b> ${escapeHtml(p.problem)}`);
  if (p.service) lines.push(`<b>Услуга:</b> ${escapeHtml(p.service)}`);
  if (p.urgency) lines.push(`<b>Срочность:</b> ${escapeHtml(p.urgency)}`);
  if (p.callTime) lines.push(`<b>Время звонка:</b> ${escapeHtml(p.callTime)}`);
  if (p.comment) lines.push(`<b>Комментарий:</b> ${escapeHtml(p.comment)}`);
  if (p.landing) lines.push(`\n<b>Страница:</b> ${escapeHtml(p.landing)}`);
  if (p.referrer) lines.push(`<b>Referrer:</b> ${escapeHtml(p.referrer)}`);
  if (p.utm && Object.keys(p.utm).length) {
    const utm = Object.entries(p.utm).map(([k, v]) => `${k}=${v}`).join(" | ");
    lines.push(`<b>UTM:</b> ${escapeHtml(utm)}`);
  }
  return lines.join("\n");
}

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
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error(
      "Telegram не настроен. Добавьте VITE_TG_BOT_TOKEN и VITE_TG_CHAT_ID в .env",
    );
  }
  const text = formatLead(payload);
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram API error ${res.status}: ${body}`);
  }
  markSent();
}
