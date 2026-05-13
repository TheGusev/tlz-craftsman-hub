import { createFileRoute } from "@tanstack/react-router";
import { generalFaq } from "@/data/faq";
import { services } from "@/data/services";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  buildGraphHead,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
} from "@/lib/jsonld";
import { buildCanonical } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => {
    const path = "/faq";
    const canonical = buildCanonical(path);
    const title = "FAQ — частые вопросы о санитарных работах";
    const description = "Ответы на частые вопросы: сроки выезда, гарантии, конфиденциальность, работа со страховыми, цены.";
    const allFaq = [
      ...generalFaq,
      ...services.flatMap((s) => s.faq.slice(0, 3)),
    ];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: buildGraphHead([
            buildWebPageSchema({ path, name: title, description }),
            buildBreadcrumbSchema([{ label: "FAQ", path }]),
            buildFAQSchema(allFaq),
          ]),
        },
      ],
    };
  },
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Частые вопросы</h1>
      <h2 className="mt-10 font-display text-2xl font-bold">Общие вопросы</h2>
      <Accordion type="single" collapsible className="mt-4">
        {generalFaq.map((f, i) => (
          <AccordionItem key={i} value={`g-${i}`}>
            <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {services.map((s) => (
        <div key={s.slug}>
          <h2 className="mt-10 font-display text-2xl font-bold">{s.shortName}</h2>
          <Accordion type="single" collapsible className="mt-4">
            {s.faq.map((f, i) => (
              <AccordionItem key={i} value={`${s.slug}-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
