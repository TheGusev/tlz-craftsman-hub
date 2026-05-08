import { useEffect, useRef, useState } from "react";
import { Phone, Send, User, X } from "lucide-react";

type Action = {
  label: string;
  href: string;
  icon: typeof Phone;
  bg: string;
  external?: boolean;
};

const actions: Action[] = [
  { label: "Позвонить", href: "tel:+78005551234", icon: Phone, bg: "bg-[#25D366] text-white" },
  { label: "MAX", href: "https://max.ru/", icon: User, bg: "bg-sky-500 text-white", external: true },
  { label: "Telegram", href: "https://t.me/", icon: Send, bg: "bg-sky-500 text-white", external: true },
];

export function UrgentCTA() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3 md:bottom-6 md:right-6"
    >
      <div className="flex flex-col items-end gap-3">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <a
              key={a.label}
              href={a.href}
              target={a.external ? "_blank" : undefined}
              rel={a.external ? "noopener noreferrer" : undefined}
              aria-label={a.label}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${i * 50}ms` : "0ms" }}
              className={`flex items-center gap-3 rounded-full pl-5 pr-2 py-2 shadow-lg transition-all duration-300 ${a.bg} ${
                open
                  ? "translate-y-0 opacity-100 pointer-events-auto"
                  : "translate-y-3 opacity-0 pointer-events-none"
              }`}
            >
              <span className="text-base font-semibold">{a.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Icon className="h-5 w-5" />
              </span>
            </a>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть меню связи" : "Открыть меню связи"}
        aria-expanded={open}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          open
            ? "bg-primary text-primary-foreground rotate-90"
            : "bg-[linear-gradient(110deg,#25D366,#0fb89a,#25D366)] bg-[length:200%_auto] animate-shimmer text-white hover:scale-105"
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
      </button>
    </div>
  );
}
