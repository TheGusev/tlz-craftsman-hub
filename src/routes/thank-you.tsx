import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { trackGoal } from "@/lib/analytics";
import { SITE_URL, SITE_PHONE, SITE_PHONE_RAW } from "@/lib/site";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
  head: () => ({
    meta: [
      { title: "Заявка принята — Санитарные Решения РФ" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Спасибо! Ваша заявка принята, перезвоним в течение 15 минут." },
      { property: "og:url", content: `${SITE_URL}/thank-you` },
    ],
  }),
});

function ThankYouPage() {
  useEffect(() => {
    trackGoal("lead_confirmed");
  }, []);

  return (
    <section className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <CheckCircle2 className="h-16 w-16 text-accent" aria-hidden />
      <h1 className="mt-6 font-display text-3xl font-bold md:text-4xl">Заявка принята</h1>
      <p className="mt-4 text-base text-muted-foreground">
        Наш диспетчер перезвонит в течение 15 минут, уточнит детали и согласует время выезда бригады.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={`tel:${SITE_PHONE_RAW}`}
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
        >
          Позвонить сейчас: {SITE_PHONE}
        </a>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-accent/10"
        >
          На главную
        </Link>
      </div>
    </section>
  );
}
