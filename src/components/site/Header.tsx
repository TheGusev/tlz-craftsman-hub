import { Link } from "@tanstack/react-router";
import { Phone, Menu, X, ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";
import { services } from "@/data/services";
import { cities } from "@/data/cities";
import { useActiveCity } from "@/lib/useActiveCity";
import { trackGoal } from "@/lib/analytics";
import { SITE_PHONE, SITE_PHONE_RAW, SITE_WHATSAPP_URL } from "@/lib/site";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Header() {
  const [open, setOpen] = useState(false);
  const activeCity = useActiveCity();
  const cityPhoneRaw = activeCity?.phone
    ? activeCity.phone.replace(/[^+\d]/g, "")
    : "";
  const cityPhoneHref = cityPhoneRaw ? `tel:${cityPhoneRaw}` : `tel:${SITE_PHONE_RAW}`;
  const cityPhoneDisplay = activeCity?.phoneDisplay ?? SITE_PHONE;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display">
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground">Санитарные Решения</span>
            <span className="bg-[linear-gradient(110deg,var(--accent),var(--urgent),var(--accent))] bg-clip-text text-xs font-semibold text-transparent animate-shimmer">
              РФ · Аварийная служба 24/7
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">Услуги</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[420px] gap-1 p-3 md:w-[520px] md:grid-cols-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/services"
                        className="block rounded-md p-3 hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="text-sm font-semibold">Все услуги</div>
                        <p className="text-xs text-muted-foreground">Каталог направлений</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {services.map((s) => (
                    <li key={s.slug}>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/services/$serviceSlug"
                          params={{ serviceSlug: s.slug }}
                          className="block rounded-md p-3 hover:bg-accent hover:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold">{s.shortName}</div>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{s.cluster}</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">Города</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[320px] gap-1 p-3">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/cities"
                        className="block rounded-md p-3 hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="text-sm font-semibold">Все города</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/regions/krym"
                        className="block rounded-md p-3 hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="text-sm font-semibold">Крым (региональный хаб)</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {cities.map((c) => (
                    <li key={c.slug}>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/cities/$citySlug"
                          params={{ citySlug: c.slug }}
                          className="block rounded-md p-3 hover:bg-accent hover:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold">{c.name}</div>
                          <p className="text-xs text-muted-foreground">{c.region}</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/cases"
                  className="inline-flex h-10 items-center px-3 text-sm font-medium hover:text-accent"
                  activeProps={{ className: "text-accent" }}
                >
                  Кейсы
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/faq" className="inline-flex h-10 items-center px-3 text-sm font-medium hover:text-accent">
                  FAQ
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/blog" className="inline-flex h-10 items-center px-3 text-sm font-medium hover:text-accent">
                  Блог
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/prices" className="inline-flex h-10 items-center px-3 text-sm font-medium hover:text-accent">
                  Цены
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/about" className="inline-flex h-10 items-center px-3 text-sm font-medium hover:text-accent">
                  О компании
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/contacts"
                  className="inline-flex h-10 items-center px-3 text-sm font-medium hover:text-accent"
                >
                  Контакты
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <a
            href={cityPhoneHref}
            aria-label={cityPhoneDisplay ? `Позвонить ${cityPhoneDisplay}` : "Позвонить"}
            onClick={() => {
              trackGoal("lead_phone_click", { source: "header", city: activeCity?.slug });
            }}
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:text-accent md:inline-flex"
          >
            <Phone className="h-4 w-4" />
            {cityPhoneDisplay && <span>{cityPhoneDisplay}</span>}
          </a>
          <a
            href={SITE_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в WhatsApp"
            onClick={() => {
              trackGoal("lead_whatsapp_click", { source: "header", city: activeCity?.slug });
            }}
            className="hidden h-9 w-9 items-center justify-center rounded-md bg-[#25D366] text-white hover:opacity-90 md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <Button
            asChild
            className="hidden md:inline-flex bg-[linear-gradient(110deg,var(--urgent),var(--accent),var(--urgent))] bg-[length:200%_auto] animate-shimmer text-urgent-foreground shadow-lg shadow-urgent/30 hover:opacity-90"
          >
            <a
              href={cityPhoneHref}
              onClick={() => {
                trackGoal("lead_phone_click", { source: "header_cta", city: activeCity?.slug });
              }}
            >
              Срочный выезд
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Меню">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] overflow-y-auto sm:w-[380px]">
              <SheetHeader>
                <SheetTitle>Навигация</SheetTitle>
              </SheetHeader>
              <MobileNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const [section, setSection] = useState<"none" | "services" | "cities">("none");
  return (
    <nav className="mt-6 flex flex-col gap-1 text-sm">
      <button
        onClick={() => setSection(section === "services" ? "none" : "services")}
        className="flex items-center justify-between rounded-md px-3 py-3 text-left font-semibold hover:bg-muted"
      >
        Услуги <ChevronDown className={`h-4 w-4 transition ${section === "services" ? "rotate-180" : ""}`} />
      </button>
      {section === "services" && (
        <div className="ml-3 flex flex-col border-l border-border pl-3">
          <Link to="/services" onClick={onNavigate} className="rounded-md px-2 py-2 hover:bg-muted">
            Все услуги
          </Link>
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$serviceSlug"
              params={{ serviceSlug: s.slug }}
              onClick={onNavigate}
              className="rounded-md px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {s.shortName}
            </Link>
          ))}
        </div>
      )}
      <button
        onClick={() => setSection(section === "cities" ? "none" : "cities")}
        className="flex items-center justify-between rounded-md px-3 py-3 text-left font-semibold hover:bg-muted"
      >
        Города <ChevronDown className={`h-4 w-4 transition ${section === "cities" ? "rotate-180" : ""}`} />
      </button>
      {section === "cities" && (
        <div className="ml-3 flex flex-col border-l border-border pl-3">
          <Link to="/cities" onClick={onNavigate} className="rounded-md px-2 py-2 hover:bg-muted">
            Все города
          </Link>
          <Link to="/regions/krym" onClick={onNavigate} className="rounded-md px-2 py-2 hover:bg-muted">
            Крым
          </Link>
          {cities.map((c) => (
            <Link
              key={c.slug}
              to="/cities/$citySlug"
              params={{ citySlug: c.slug }}
              onClick={onNavigate}
              className="rounded-md px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
      {[
        { to: "/cases" as const, label: "Кейсы" },
        { to: "/faq" as const, label: "FAQ" },
        { to: "/blog" as const, label: "Блог" },
        { to: "/prices" as const, label: "Цены" },
        { to: "/about" as const, label: "О компании" },
        { to: "/contacts" as const, label: "Контакты" },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="rounded-md px-3 py-3 font-semibold hover:bg-muted"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
