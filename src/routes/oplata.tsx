import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Banknote, CreditCard, Building2, Receipt } from "lucide-react";
import { buildCanonical } from "@/lib/seo";

const PATH = "/oplata";
const TITLE = "Способы оплаты — наличные, карта, безнал, счёт | Санитарные Решения РФ";
const DESC =
  "Принимаем наличные, банковские карты, СБП, безналичный расчёт по счёту. Чек ОФД, договор, акт, УПД. Работаем с физлицами, ИП и юр.лицами.";

export const Route = createFileRoute("/oplata")({
  component: OplataPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: buildCanonical(PATH) },
    ],
    links: [{ rel: "canonical", href: buildCanonical(PATH) }],
  }),
});

const methods = [
  { icon: Banknote, title: "Наличные", text: "Оплата бригадиру по факту выполнения работ. Выдаём чек ОФД и акт сразу на месте." },
  { icon: CreditCard, title: "Банковская карта / СБП", text: "Принимаем оплату картой через мобильный POS-терминал или по QR-коду СБП на месте." },
  { icon: Building2, title: "Безналичный расчёт", text: "Для ИП и юр.лиц выставляем счёт. Подписываем договор, по окончании работ — УПД и акт." },
  { icon: Receipt, title: "Закрывающие документы", text: "Договор, чек ОФД, акт выполненных работ, фото «до/после», паспорта препаратов. Для b2b — УПД." },
];

function OplataPage() {
  return (
    <>
      <PageHero
        eyebrow="Оплата"
        title="Оплата удобным способом — для физлиц и компаний"
        description="Принимаем наличные, карты, СБП и безналичный расчёт. Все способы — с официальными документами."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Оплата" }]}
      />
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <article key={m.title} className="rounded-2xl border border-border bg-card p-6">
                <Icon className="h-8 w-8 text-accent" aria-hidden />
                <h2 className="mt-3 font-display text-lg font-semibold">{m.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 rounded-2xl border border-border bg-muted/40 p-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-bold">Когда брать оплату</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Стандартные обработки — оплата по факту выполнения, после подписания акта.</li>
              <li>• Сложные комплексные работы (от 50 000 ₽) — предоплата 30%, остаток по факту.</li>
              <li>• Юр.лица по договору — постоплата 5–14 рабочих дней по согласованию.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Скидки и рассрочка</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Постоянным клиентам — −10% на повторные обработки.</li>
              <li>• Управляющим компаниям и ТСЖ — корпоративные тарифы.</li>
              <li>• Рассрочка 0% на 3 месяца через банк-партнёр (для работ от 30 000 ₽).</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
