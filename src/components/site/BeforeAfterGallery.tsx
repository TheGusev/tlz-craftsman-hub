import { useState } from "react";
import { Lightbox } from "@/components/site/Lightbox";
import { LazyVideo } from "@/components/site/LazyVideo";
import type { BeforeAfterPhoto, FloodVideo } from "@/lib/floodGallery";

type Props = {
  photos: BeforeAfterPhoto[];
  video?: FloodVideo;
  title?: string;
  subtitle?: string;
  footnote?: string;
};

export function BeforeAfterGallery({
  photos,
  video,
  title = "Наши работы после потопа: до и после",
  subtitle = "Реальные объекты, фото с выезда бригады.",
  footnote,
}: Props) {
  const [index, setIndex] = useState<number | null>(null);
  if (photos.length === 0 && !video) return null;

  return (
    <section aria-labelledby="before-after-heading">
      <h2 id="before-after-heading" className="font-display text-2xl font-bold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

      {video && (
        <figure className="mx-auto mt-5 max-w-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
          <LazyVideo src={video.src} poster={video.poster} caption={video.caption} />
          <figcaption className="flex items-center justify-between gap-2 px-4 py-3">

            <span className="text-sm font-semibold">{video.caption}</span>
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
              Видео
            </span>
          </figcaption>
        </figure>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {photos.map((p, i) => (
          <figure key={p.src} className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="block w-full"
              aria-label={`Открыть фото: ${p.caption}`}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition hover:opacity-90"
              />
            </button>
            <figcaption className="flex items-center justify-between gap-2 px-4 py-3">
              <span className="text-sm font-semibold">{p.caption}</span>
              <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                До / После
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      {footnote && <p className="mt-3 text-sm text-muted-foreground">{footnote}</p>}
      {index !== null && (
        <Lightbox
          photos={photos}
          index={index}
          onClose={() => setIndex(null)}
          onIndexChange={setIndex}
        />
      )}
    </section>
  );
}
