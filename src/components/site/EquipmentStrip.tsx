import equipmentGenerator from "@/assets/equipment-generator.jpg";
import equipmentOzone from "@/assets/equipment-ozone.jpg";
import teamPhoto from "@/assets/hero-moscow-team.jpg";

const items = [
  {
    src: equipmentGenerator,
    title: "Генераторы холодного тумана",
    body: "ULV-туман проникает в поры материалов — обрабатываем стены, потолки, ткани и вентиляцию.",
  },
  {
    src: equipmentOzone,
    title: "Промышленные озонаторы",
    body: "Разрушают молекулы запаха гари, тлена и биологических загрязнений без химии.",
  },
  {
    src: teamPhoto,
    title: "Сертифицированная бригада в СИЗ",
    body: "Костюмы 1-го класса защиты, полнолицевые респираторы, страховка бригады и клиента.",
  },
];

export function EquipmentStrip() {
  return (
    <section aria-label="Оборудование и бригада">
      <h2 className="font-display text-2xl font-bold">Наше оборудование и бригада</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((it) => (
          <figure key={it.title} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={it.src}
              alt={it.title}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="p-4">
              <div className="font-display text-sm font-bold">{it.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
