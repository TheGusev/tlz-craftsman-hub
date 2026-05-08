import { Link } from "@tanstack/react-router";
import { services } from "@/data/services";
import { cities } from "@/data/cities";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold">СР</span>
            <span className="font-display text-base font-bold">Санитарные Решения РФ</span>
          </div>
          <p className="mt-4 text-sm opacity-80">
            Аварийная санитарная служба по ЮФО и Крыму. Дезинфекция, фумигация, удаление плесени, очистка после ЧС.
          </p>
          <a href="tel:+78005551234" className="mt-4 inline-block text-lg font-semibold text-accent">
            +7 (800) 555-12-34
          </a>
          <div className="mt-1 text-xs opacity-70">Круглосуточно, без выходных</div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider opacity-90">Услуги</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} className="hover:text-accent">
                  {s.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider opacity-90">Города</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link to="/cities/$citySlug" params={{ citySlug: c.slug }} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/regions/krym" className="hover:text-accent">Крым (региональный хаб)</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider opacity-90">Компания</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            <li><Link to="/about" className="hover:text-accent">О компании</Link></li>
            <li><Link to="/cases" className="hover:text-accent">Кейсы</Link></li>
            <li><Link to="/blog" className="hover:text-accent">Блог</Link></li>
            <li><Link to="/faq" className="hover:text-accent">FAQ</Link></li>
            <li><Link to="/prices" className="hover:text-accent">Цены</Link></li>
            <li><Link to="/contacts" className="hover:text-accent">Контакты</Link></li>
            <li><Link to="/privacy" className="hover:text-accent">Политика конфиденциальности</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 text-xs opacity-70 md:flex md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Санитарные Решения РФ. Все права защищены.</span>
          <span className="mt-2 block md:mt-0">Лицензированная санитарная служба. Сертифицированные препараты.</span>
        </div>
      </div>
    </footer>
  );
}
