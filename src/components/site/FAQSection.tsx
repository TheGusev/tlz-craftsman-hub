interface FAQSectionProps {
  title?: string;
  faqs: { q: string; a: string }[];
  className?: string;
}

/**
 * FAQ-блок на <details>/<summary> для лучшего UX и доступности.
 * JSON-LD FAQPage регистрируется отдельно через buildFAQSchema() в head().
 */
export function FAQSection({ title = "Частые вопросы", faqs, className }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-6 space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-xl border border-border bg-card p-4 open:border-accent/40 open:shadow-sm"
          >
            <summary className="flex cursor-pointer items-start justify-between gap-4 list-none font-semibold">
              <span className="flex-1">{f.q}</span>
              <span
                aria-hidden
                className="mt-1 text-accent transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
