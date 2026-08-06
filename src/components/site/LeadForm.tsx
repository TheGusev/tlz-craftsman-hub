import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cities } from "@/data/cities";
import { citiesForDropdownWith } from "@/lib/cityOrder";
import { trackGoal, readUtm } from "@/lib/analytics";

import { useActiveCity } from "@/lib/useActiveCity";
import { sendLeadToTelegram, checkRateLimit } from "@/lib/telegram";

export function LeadForm({
  defaultCity,
  defaultProblem,
  source = "lead_form",
  service,
}: {
  defaultCity?: string;
  defaultProblem?: string;
  source?: string;
  service?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(true);
  const navigate = useNavigate();
  const activeCity = useActiveCity();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    const fd = new FormData(e.currentTarget);
    // honeypot: если бот заполнил скрытое поле — тихо имитируем успех
    if (String(fd.get("website") ?? "").trim()) {
      navigate({ to: "/thank-you" });
      return;
    }
    const rl = checkRateLimit();
    if (!rl.ok) {
      toast.error(`Подождите ${rl.waitSec} сек. перед повторной отправкой`);
      return;
    }
    setLoading(true);
    const utm = readUtm();
    const cityVal = String(fd.get("city") ?? "");
    const cityName = cities.find((c) => c.slug === cityVal)?.name ?? cityVal;
    try {
      await sendLeadToTelegram({
        source,
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        city: cityName,
        objectType: String(fd.get("objectType") ?? ""),
        problem: String(fd.get("problem") ?? ""),
        urgency: String(fd.get("urgency") ?? ""),
        callTime: String(fd.get("callTime") ?? ""),
        comment: String(fd.get("comment") ?? ""),
        service: service ?? null,
        utm: Object.fromEntries(
          Object.entries(utm).filter(([, v]) => typeof v === "string" && v),
        ) as Record<string, string>,
        landing: typeof window !== "undefined" ? window.location.pathname : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      });
      trackGoal("lead_form_submit", {
        source,
        city: activeCity?.slug ?? defaultCity ?? cityVal,
        service: service ?? null,
      });
      (e.target as HTMLFormElement).reset();
      toast.success("Заявка отправлена! Мы перезвоним в течение 5 минут.");
      navigate({ to: "/thank-you" });
    } catch (err) {
      console.error(err);
      toast.error("Ошибка отправки. Позвоните: +7 961 911 9919");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      {/* honeypot — скрытое поле от ботов */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Ваше имя *</Label>
          <Input id="name" name="name" required minLength={2} maxLength={100} placeholder="Имя" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            minLength={7}
            maxLength={30}
            placeholder="+7 (___) ___-__-__"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">Город *</Label>
          <Select name="city" defaultValue={defaultCity}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Выберите город" />
            </SelectTrigger>
            <SelectContent>
              {citiesForDropdownWith(cities, defaultCity).map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="objectType">Тип объекта</Label>
          <Select name="objectType">
            <SelectTrigger id="objectType">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Квартира</SelectItem>
              <SelectItem value="house">Частный дом</SelectItem>
              <SelectItem value="office">Офис / коммерция</SelectItem>
              <SelectItem value="warehouse">Склад / производство</SelectItem>
              <SelectItem value="other">Другое</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="problem">Проблема *</Label>
        <Input
          id="problem"
          name="problem"
          required
          maxLength={500}
          defaultValue={defaultProblem}
          placeholder="Например: затопило подвал, нужна просушка"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="urgency">Срочность</Label>
          <Select name="urgency" defaultValue="urgent">
            <SelectTrigger id="urgency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Срочно — выезд сейчас</SelectItem>
              <SelectItem value="urgent">Сегодня</SelectItem>
              <SelectItem value="planned">В ближайшие дни</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="callTime">Удобное время звонка</Label>
          <Select name="callTime" defaultValue="asap">
            <SelectTrigger id="callTime">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asap">Перезвонить сейчас</SelectItem>
              <SelectItem value="1hr">В течение часа</SelectItem>
              <SelectItem value="today_evening">Сегодня вечером</SelectItem>
              <SelectItem value="tomorrow_morning">Завтра утром</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comment">Комментарий</Label>
        <Textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={2000}
          placeholder="Опишите ситуацию подробнее"
        />
      </div>

      <label className="flex items-start gap-3 text-xs text-muted-foreground">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(Boolean(v))}
          aria-label="Согласие на обработку персональных данных"
          className="mt-0.5"
        />
        <span>
          Я согласен с{" "}
          <a href="/soglasie" className="text-accent hover:underline">
            обработкой персональных данных
          </a>{" "}
          и{" "}
          <a href="/privacy" className="text-accent hover:underline">
            политикой конфиденциальности
          </a>
          .
        </span>
      </label>

      <Button
        type="submit"
        disabled={loading || !consent}
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {loading ? "Отправка..." : "Получить расчёт стоимости"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Перезвоним в течение 15 минут. Бесплатная консультация и расчёт.
      </p>
    </form>
  );
}
