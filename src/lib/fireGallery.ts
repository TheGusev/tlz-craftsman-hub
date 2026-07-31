// Реальные фото с выездов бригады после пожара (уборка, очистка от копоти, восстановление мебели).
import type { BeforeAfterPhoto } from "@/lib/floodGallery";

export const FIRE_SERVICE_SLUG = "posle-pozhara";

export function getFireGallery(cityLocative?: string): BeforeAfterPhoto[] {
  const geo = cityLocative ? ` ${cityLocative}` : "";
  return [
    {
      src: "/media/pozhar-shkaf-do.webp",
      alt: `Уборка после пожара${geo} — шкаф и стена в копоти до очистки`,
      caption: "До: копоть и нагар на мебели",
    },
    {
      src: "/media/pozhar-shkaf-posle.webp",
      alt: `Уборка после пожара${geo} — тот же шкаф после очистки от копоти`,
      caption: "После: шкаф очищен от копоти",
    },
    {
      src: "/media/pozhar-uborka-pomescheniya.webp",
      alt: `Уборка после пожара${geo} — вынос мусора и уборка помещения бригадой`,
      caption: "Уборка помещения и вывоз мусора",
    },
  ];
}

export const fireCover = "/media/pozhar-uborka-pomescheniya.webp";
