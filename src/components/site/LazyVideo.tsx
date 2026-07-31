import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

type Props = {
  src: string;
  poster: string;
  caption: string;
  className?: string;
};

/**
 * Видео грузится лениво: пока блок вне экрана — только постер.
 * Тег <video> монтируется, когда блок близко к вьюпорту или по клику.
 */
export function LazyVideo({ src, poster, caption, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div ref={ref} className={className}>
      {mounted || play ? (
        <video
          src={src}
          poster={poster}
          controls
          muted
          loop
          playsInline
          autoPlay={play}
          preload={play ? "auto" : "none"}
          aria-label={caption}
          className="aspect-[3/4] w-full bg-black object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setMounted(true);
            setPlay(true);
          }}
          aria-label={`Смотреть видео: ${caption}`}
          className="group relative block w-full"
        >
          <img
            src={poster}
            alt={caption}
            loading="lazy"
            decoding="async"
            width={640}
            height={854}
            className="aspect-[3/4] w-full bg-muted object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-elegant transition group-hover:scale-105">
              <Play className="ml-1 h-7 w-7" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
