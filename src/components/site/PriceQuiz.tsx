import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackGoal } from "@/lib/analytics";
import { trackCityConversion } from "@/lib/conversions";

type ObjectType = "apartment" | "house" | "commercial";
type AreaBand = "s" | "m" | "l" | "xl";
type Urgency = "asap" | "today" | "week";

const OBJECT_LABEL: Record<ObjectType, string> = {
  apartment: "Квартира",
  house: "Частный дом",
  commercial: "Коммерческий объект",
};
const OBJECT_MULT: Record<ObjectType, number> = {
  apartment: 1,
  house: 1.2,
  commercial: 1.4,
};
const AREA_LABEL: Record<AreaBand, string> = {
  s: "до 40 м²",
  m: "40–80 м²",
  l: "80–150 м²",
  xl: "от 150 м²",
};
const AREA_MULT: Record<AreaBand, number> = { s: 1, m: 1.5, l: 2.2, xl: 3 };
const URGENCY_LABEL: Record<Urgency, string> = {
  asap: "Срочно (1–3 часа)",
  today: "Сегодня",
  week: "В течение недели",
};
const URGENCY_MULT: Record<Urgency, number> = {
  asap: 1.25,
  today: 1.1,
  week: 1,
};

export function PriceQuiz({
  basePrice,
  serviceSlug,
  citySlug,
  onFinish,
}: {
  basePrice: number;
  /** slug услуги — используется для составных целей Метрики */
  serviceSlug: string;
  /** slug города — используется для составных целей Метрики */
  citySlug: string;
  onFinish?: (estimate: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [obj, setObj] = useState<ObjectType | null>(null);
  const [area, setArea] = useState<AreaBand | null>(null);
  const [urg, setUrg] = useState<Urgency | null>(null);

  const total = step === 3;
  const estimate =
    obj && area && urg
      ? Math.round((basePrice * OBJECT_MULT[obj] * AREA_MULT[area] * URGENCY_MULT[urg]) / 100) * 100
      : 0;

  const finish = (u: Urgency) => {
    setUrg(u);
    setStep(3);
    if (obj && area) {
      const value =
        Math.round((basePrice * OBJECT_MULT[obj] * AREA_MULT[area] * URGENCY_MULT[u]) / 100) * 100;
      trackGoal("lp_quiz_complete", {
        service: serviceSlug,
        city: citySlug,
        object: obj,
        area,
        urgency: u,
        estimate: value,
      });
      trackCityConversion(citySlug, serviceSlug, "quiz", {
        estimate: value,
      });
      onFinish?.(value);
    }
  };

  const reset = () => {
    setStep(0);
    setObj(null);
    setArea(null);
    setUrg(null);
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Расчёт за 3 шага</h3>
        <span className="text-xs text-muted-foreground">
          Шаг {Math.min(step + 1, 3)} из 3
        </span>
      </div>

      {step === 0 && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Тип объекта</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(OBJECT_LABEL) as ObjectType[]).map((k) => (
              <Button
                key={k}
                variant="outline"
                onClick={() => {
                  setObj(k);
                  setStep(1);
                }}
                className="h-auto justify-start py-3"
              >
                {OBJECT_LABEL[k]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Площадь</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(AREA_LABEL) as AreaBand[]).map((k) => (
              <Button
                key={k}
                variant="outline"
                onClick={() => {
                  setArea(k);
                  setStep(2);
                }}
                className="h-auto justify-start py-3"
              >
                {AREA_LABEL[k]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Срочность</p>
          <div className="grid gap-2">
            {(Object.keys(URGENCY_LABEL) as Urgency[]).map((k) => (
              <Button
                key={k}
                variant="outline"
                onClick={() => finish(k)}
                className="h-auto justify-start py-3"
              >
                {URGENCY_LABEL[k]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {total && (
        <div>
          <p className="text-sm text-muted-foreground">Предварительная оценка</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {estimate.toLocaleString("ru-RU")} ₽
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Точная цена — после короткого звонка и осмотра. Расчёт носит ориентировочный характер.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={reset} variant="outline" size="sm">
              Пересчитать
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
