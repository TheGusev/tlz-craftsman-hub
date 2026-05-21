import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const LeadSchema = z.object({
  source: z.string().min(1).max(100),
  name: z.string().max(100).optional(),
  phone: z.string().min(5).max(40),
  city: z.string().max(100).optional(),
  objectType: z.string().max(100).optional(),
  problem: z.string().max(500).optional(),
  service: z.string().max(200).nullable().optional(),
  urgency: z.string().max(100).optional(),
  callTime: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
  utm: z.record(z.string().max(100), z.string().max(500)).optional(),
  landing: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatLead(p: z.infer<typeof LeadSchema>): string {
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

export const Route = createFileRoute("/api/public/lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.TG_BOT_TOKEN;
        const chatId = process.env.TG_CHAT_ID;
        if (!token || !chatId) {
          return Response.json(
            { ok: false, error: "Telegram не настроен" },
            { status: 500 },
          );
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = LeadSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const text = formatLead(parsed.data);
        const tgRes = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: "HTML",
              disable_web_page_preview: true,
            }),
          },
        );

        if (!tgRes.ok) {
          const body = await tgRes.text().catch(() => "");
          console.error("Telegram API error", tgRes.status, body);
          return Response.json(
            { ok: false, error: `Telegram ${tgRes.status}` },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
