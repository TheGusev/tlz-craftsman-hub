// Реальные фото с выездов бригады после потопа (офисное здание, откачка + уборка).
import koridor from "@/assets/potop-koridor-ofisa.jpg.asset.json";
import kabinet from "@/assets/potop-kabinet.jpg.asset.json";
import zal from "@/assets/potop-zal.jpg.asset.json";
import holl from "@/assets/potop-holl-lestnica.jpg.asset.json";

export type BeforeAfterPhoto = {
  src: string;
  alt: string;
  caption: string;
};

export const FLOOD_SERVICE_SLUG = "posle-potopa";

export function getFloodGallery(cityName?: string): BeforeAfterPhoto[] {
  const geo = cityName ? ` в ${cityName}` : "";
  return [
    {
      src: koridor.url,
      alt: `Уборка после потопа${geo} — коридор офиса до и после`,
      caption: "Коридор офиса: откачка и уборка",
    },
    {
      src: kabinet.url,
      alt: `Уборка после потопа${geo} — кабинет с илом до и после`,
      caption: "Кабинет: ил и грязь после подтопления",
    },
    {
      src: zal.url,
      alt: `Уборка после потопа${geo} — зал 60 м² до и после просушки`,
      caption: "Зал 60 м²: просушка и мойка",
    },
    {
      src: holl.url,
      alt: `Уборка после потопа${geo} — холл и лестница до и после`,
      caption: "Холл и лестница: очистка после потопа",
    },
  ];
}

export const floodCover = koridor.url;
