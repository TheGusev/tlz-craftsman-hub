import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { SITE_PHONE, SITE_PHONE_RAW } from "@/lib/site";

interface HeroCTAProps {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  showPhone?: boolean;
}

/**
 * CTA-блок выше первого экрана. Используется как props.actions у PageHero
 * и/или внутри hero-секций. Видим без скролла на 393×844.
 */
export function HeroCTA({
  primaryLabel = "Получить расчёт",
  primaryHref = "#lead-form",
  secondaryLabel = "Срочный выезд",
  secondaryHref = `tel:${SITE_PHONE_RAW}`,
  showPhone = true,
}: HeroCTAProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button
        asChild
        size="lg"
        className="bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:bg-accent/90"
      >
        <a href={primaryHref}>{primaryLabel}</a>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="border-primary-foreground/40 bg-background/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
      >
        <a href={secondaryHref}>
          <Phone className="mr-2 h-4 w-4" />
          {secondaryLabel}
        </a>
      </Button>
      {showPhone && (
        <a
          href={`tel:${SITE_PHONE_RAW}`}
          className="font-display text-base font-bold opacity-95 hover:underline sm:text-lg"
        >
          {SITE_PHONE}
        </a>
      )}
    </div>
  );
}
