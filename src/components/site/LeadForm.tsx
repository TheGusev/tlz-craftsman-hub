import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cities } from "@/data/cities";

export function LeadForm({ defaultCity, defaultProblem }: { defaultCity?: string; defaultProblem?: string }) {
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Заявка принята. Перезвоним в течение 15 минут.");
      (e.target as HTMLFormElement).reset();
      setLoading(false);
    }, 600);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Ваше имя *</Label>
          <Input id="name" name="name" required placeholder="Имя" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Телефон *</Label>
          <Input id="phone" name="phone" type="tel" required placeholder="+7 (___) ___-__-__" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">Город *</Label>
          <Select name="city" defaultValue={defaultCity}>
            <SelectTrigger id="city"><SelectValue placeholder="Выберите город" /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="objectType">Тип объекта</Label>
          <Select name="objectType">
            <SelectTrigger id="objectType"><SelectValue placeholder="Выберите тип" /></SelectTrigger>
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
        <Input id="problem" name="problem" required defaultValue={defaultProblem} placeholder="Например: затопило подвал, нужна просушка" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="urgency">Срочность</Label>
        <Select name="urgency" defaultValue="urgent">
          <SelectTrigger id="urgency"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="now">Срочно — выезд сейчас</SelectItem>
            <SelectItem value="urgent">Сегодня</SelectItem>
            <SelectItem value="planned">В ближайшие дни</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comment">Комментарий</Label>
        <Textarea id="comment" name="comment" rows={3} placeholder="Опишите ситуацию подробнее" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="files">Фото или видео объекта</Label>
        <Input id="files" name="files" type="file" multiple accept="image/*,video/*" className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium" />
        <p className="text-xs text-muted-foreground">
          Можно сразу прислать фото в{" "}
          <a
            href="https://wa.me/78005551234?text=Здравствуйте,%20отправляю%20фото%20объекта"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      </div>
      <Button type="submit" disabled={loading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
        {loading ? "Отправка..." : "Получить расчёт стоимости"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных. Перезвоним в течение 15 минут.
      </p>
    </form>
  );
}
