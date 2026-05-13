import { Link } from "@tanstack/react-router";
import { services } from "@/data/services";
import { cities } from "@/data/cities";
import {
  SITE_NAME,
  SITE_PHONE,
  SITE_PHONE_RAW,
  SITE_EMAIL,
} from "@/lib/site";
import { trackGoal } from "@/lib/analytics";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold">
              СР
            </span>
            <span className="font-display text-base font-bold">{SITE_NAME}</span>
          </div>
          <p className="mt-4 text-sm opacity-80">
            Аварийная санитарная служба по ЮФО и Крыму. Дезинфекция, фумигация, удаление плесени, очистка после ЧС.
          </p>
          <address className="mt-4 not-italic text-sm opacity-90 space-y-1">
            <a
              href={`tel:${SITE_PHONE_RAW}`}
              onClick={() => trackGoal("lead_phone_click", { source: "footer" })}
              className="block text-lg font-semibold text-accent"
            >
              {SITE_PHONE}
            </a>
            <div className="text-xs opacity-80">Круглосуточно, без выходных</div>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="block hover:text-accent"
            >
              {SITE_EMAIL}
            </a>
            <div className="text-xs opacity-80">350000, г. Краснодар, ул. Красная, 1</div>
          </address>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider opacity-90">Услуги</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {services.slice(0, 10).map((s) => (
              <li key={s.slug}>
                <Link to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} className="hover:text-accent">
                  {s.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/services" className="hover:text-accent font-semibold">
                Все услуги →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider opacity-90">Города</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {cities.slice(0, 10).map((c) => (
              <li key={c.slug}>
                <Link to="/cities/$citySlug" params={{ citySlug: c.slug }} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/regions/krym" className="hover:text-accent">Крым</Link>
            </li>
            <li>
              <Link to="/cities" className="hover:text-accent font-semibold">
                Все города →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider opacity-90">Компания</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            <li><Link to="/about" className="hover:text-accent">О компании</Link></li>
            <li><Link to="/cases" className="hover:text-accent">Кейсы</Link></li>
            <li><Link to="/otzyvy" className="hover:text-accent">Отзывы</Link></li>
            <li><Link to="/blog" className="hover:text-accent">Блог</Link></li>
            <li><Link to="/faq" className="hover:text-accent">FAQ</Link></li>
            <li><Link to="/prices" className="hover:text-accent">Цены</Link></li>
            <li><Link to="/garantii" className="hover:text-accent">Гарантии</Link></li>
            <li><Link to="/oplata" className="hover:text-accent">Оплата</Link></li>
            <li><Link to="/vyezd" className="hover:text-accent">Выезд бригады</Link></li>
            <li><Link to="/licenzii" className="hover:text-accent">Лицензии</Link></li>
            <li><Link to="/contacts" className="hover:text-accent">Контакты</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-5 text-xs opacity-70 md:flex-row md:items-center md:justify-between">
          <span>© 2026 {SITE_NAME}. ИНН 2300000000 · ОГРН 1232300000000</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacy" className="hover:text-accent">Политика</Link>
            <Link to="/soglasie" className="hover:text-accent">Согласие на ОПД</Link>
            <Link to="/oferta" className="hover:text-accent">Оферта</Link>
            <Link to="/rekvizity" className="hover:text-accent">Реквизиты</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
