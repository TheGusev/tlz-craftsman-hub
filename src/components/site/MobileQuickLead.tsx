import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cities } from "@/data/cities";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";
import { sendLeadToTelegram, checkRateLimit } from "@/lib/telegram";
import { trackGoal, readUtm } from "@/lib/analytics";
import { trackCityConversion } from "@/lib/conversions";

const objectTypes = [
  { value: "apartment", label: "Квартира" },
  { value: "house", label: "Частный дом" },
  { value: "office", label: "Офис / коммерция" },
  { value: "warehouse", label: "Склад / производство" },
  { value: "other", label: "Другое" },
];

type StepCardProps = {
  index: number;
  title: string;
  value?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function StepCard({ index, title, value, isOpen, onToggle, children }: StepCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              value ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {value ? <Check className="h-4 w-4" /> : index}
          </span>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Шаг {index}</div>
            <div className="font-semibold text-sm truncate">{value ?? title}</div>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className="px-3 pb-3 pt-1 grid gap-2">{children}</div>}
    </div>
  );
}

type OptionProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function Option({ label, selected, onClick }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition",
        selected
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border bg-background hover:border-accent/50",
      )}
    >
      <span>{label}</span>
      {selected && <Check className="h-4 w-4 text-accent" />}
    </button>
  );
}

export function MobileQuickLead() {
  const [city, setCity] = useState<string>();
  const [objectType, setObjectType] = useState<string>();
  const [problem, setProblem] = useState<string>();
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cityLabel = cities.find((c) => c.slug === city)?.name;
  const objectLabel = objectTypes.find((o) => o.value === objectType)?.label;
  const problemLabel = services.find((s) => s.slug === problem)?.shortName;
  const problemName = services.find((s) => s.slug === problem)?.name;

  const allStepsDone = !!city && !!objectType && !!problem;
  const canSubmit = allStepsDone && phone.trim().length >= 10 && agree && !loading;

  function pick(step: number, setter: (v: string) => void, value: string) {
    setter(value);
    setOpenStep(step < 3 ? step + 1 : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (hp.trim()) {
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
    try {
      await sendLeadToTelegram({
        source: "mobile_quick_lead",
        phone,
        city: cityLabel,
        objectType: objectLabel,
        problem: problemName ?? problemLabel,
        service: problem ?? null,
        utm: Object.fromEntries(
          Object.entries(utm).filter(([, v]) => typeof v === "string" && v),
        ) as Record<string, string>,
        landing: typeof window !== "undefined" ? window.location.pathname : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      });
      trackGoal("lead_form_submit", { source: "mobile_quick_lead" });
      trackCityConversion(city, problem, "form", { source: "mobile_quick_lead" });
      setCity(undefined);
      setObjectType(undefined);
      setProblem(undefined);
      setPhone("");
      setAgree(false);
      setOpenStep(1);
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
    <form onSubmit={onSubmit} className="grid gap-3">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div>
        <h2 className="font-display text-xl font-bold">Рассчитать выезд</h2>
        <p className="text-xs text-muted-foreground mt-1">Ответьте на 3 вопроса — перезвоним за 15 минут.</p>
      </div>

      <StepCard
        index={1}
        title="Выберите город"
        value={cityLabel}
        isOpen={openStep === 1}
        onToggle={() => setOpenStep(openStep === 1 ? null : 1)}
      >
        {cities.map((c) => (
          <Option
            key={c.slug}
            label={c.name}
            selected={city === c.slug}
            onClick={() => pick(1, setCity, c.slug)}
          />
        ))}
      </StepCard>

      <StepCard
        index={2}
        title="Тип объекта"
        value={objectLabel}
        isOpen={openStep === 2}
        onToggle={() => setOpenStep(openStep === 2 ? null : 2)}
      >
        {objectTypes.map((o) => (
          <Option
            key={o.value}
            label={o.label}
            selected={objectType === o.value}
            onClick={() => pick(2, setObjectType, o.value)}
          />
        ))}
      </StepCard>

      <StepCard
        index={3}
        title="Проблема"
        value={problemLabel}
        isOpen={openStep === 3}
        onToggle={() => setOpenStep(openStep === 3 ? null : 3)}
      >
        {services.map((s) => (
          <Option
            key={s.slug}
            label={s.shortName}
            selected={problem === s.slug}
            onClick={() => pick(3, setProblem, s.slug)}
          />
        ))}
      </StepCard>

      <div className="grid gap-2 mt-2">
        <Label htmlFor="quick-phone">Телефон *</Label>
        <Input
          id="quick-phone"
          type="tel"
          required
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={agree}
          onCheckedChange={(v) => setAgree(v === true)}
          className="mt-0.5"
        />
        <span>
          Согласен с{" "}
          <Link to="/privacy" className="text-accent hover:underline">
            политикой конфиденциальности
          </Link>
        </span>
      </label>

      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit}
        className="bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {loading ? "Отправка..." : "Оставить заявку"}
      </Button>
    </form>
  );
}
