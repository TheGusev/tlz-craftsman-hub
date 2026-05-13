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
    <section className="container mx-auto max-w-3xl px-4 py-16">
      <div className="flex flex-col items-center text-center">
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
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-xl font-bold">Пока вы ждёте звонка</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Эти 5–15 минут можно использовать с пользой — подготовьтесь к выезду бригады:
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3"><span className="text-accent">1.</span><span><b>Освободите доступ</b> к проблемной зоне — уберите мебель, ковры, личные вещи на 1 м вокруг очага.</span></li>
          <li className="flex gap-3"><span className="text-accent">2.</span><span><b>Изолируйте детей и животных</b> — на время обработки им лучше быть в другом помещении или у соседей.</span></li>
          <li className="flex gap-3"><span className="text-accent">3.</span><span><b>Подготовьте фото и видео</b> очагов поражения — это ускорит расчёт и поможет бригадиру.</span></li>
          <li className="flex gap-3"><span className="text-accent">4.</span><span><b>Сообщите о хронических заболеваниях</b> и аллергиях у проживающих — мы подберём щадящий протокол.</span></li>
          <li className="flex gap-3"><span className="text-accent">5.</span><span><b>Подготовьте документы</b> — для юрлиц нужны реквизиты, для управляющих компаний — заявка от собственника.</span></li>
        </ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/garantii" className="rounded-lg border border-border bg-background p-4 text-sm hover:border-accent">
            <div className="font-semibold">Гарантии и сертификаты →</div>
            <div className="mt-1 text-xs text-muted-foreground">Какие документы вы получите по итогам работ.</div>
          </Link>
          <Link to="/cases" className="rounded-lg border border-border bg-background p-4 text-sm hover:border-accent">
            <div className="font-semibold">Кейсы и фото работ →</div>
            <div className="mt-1 text-xs text-muted-foreground">Реальные объекты и результаты по ЮФО.</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
