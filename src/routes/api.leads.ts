import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  city: z.string().trim().max(80).optional().nullable(),
  objectType: z.string().trim().max(40).optional().nullable(),
  problem: z.string().trim().min(2).max(500),
  urgency: z.string().trim().max(40).optional().nullable(),
  comment: z.string().trim().max(2000).optional().nullable(),
  service: z.string().trim().max(80).optional().nullable(),
  source: z.string().trim().max(80).optional().nullable(),
  consent: z.boolean().refine((v) => v === true, "Требуется согласие на обработку персональных данных"),
  utm: z.record(z.string(), z.string().max(300)).optional().nullable(),
  landing: z.string().max(500).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
});

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = LeadSchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
            { status: 400 },
          );
        }
        // Lightweight server log; replace with email/DB once Cloud is enabled.
        console.log("[lead]", JSON.stringify(parsed.data));
        return Response.json({ ok: true });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
    },
  },
});
