import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeroProps {
  title: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backgroundImage?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHero({
  title,
  eyebrow,
  description,
  breadcrumbs,
  backgroundImage,
  meta,
  actions,
}: PageHeroProps) {
  const hasBg = Boolean(backgroundImage);
  return (
    <header className="relative overflow-hidden bg-primary text-primary-foreground">
      {hasBg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden
        />
      )}
      <div className="container relative mx-auto px-4 py-12 md:py-20">
        <div
          className={
            hasBg
              ? "max-w-3xl rounded-2xl bg-primary/70 p-5 backdrop-blur-sm md:p-8"
              : "max-w-3xl"
          }
        >
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} />
          )}
          {eyebrow && (
            <div className={`${breadcrumbs ? "mt-4" : ""} text-xs font-semibold uppercase tracking-wider text-accent`}>
              {eyebrow}
            </div>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-sm opacity-95 md:text-base">{description}</p>
          )}
          {meta && <div className="mt-6 flex flex-wrap gap-6 text-sm">{meta}</div>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
