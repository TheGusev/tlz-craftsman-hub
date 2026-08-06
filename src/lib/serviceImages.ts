import { floodCover } from "@/lib/floodGallery";
import { getMedia } from "@/lib/generated/mediaManifest";
import { fireCover } from "@/lib/fireGallery";
import smokeSmell from "@/assets/service-smoke-smell.webp";
import disinfection from "@/assets/service-disinfection.webp";
import odor from "@/assets/service-odor.webp";
import fumigation from "@/assets/service-fumigation.webp";
import afterDeath from "@/assets/service-after-death.jpg";
import mold from "@/assets/service-mold.webp";
import plot from "@/assets/service-plot.webp";
import dezinsekciya from "@/assets/service-dezinsekciya.jpg";
import deratizaciya from "@/assets/service-deratizaciya.jpg";
import tarakany from "@/assets/service-tarakany.jpg";
import klopy from "@/assets/service-klopy.jpg";
import blohi from "@/assets/service-blohi.jpg";
import muravi from "@/assets/service-muravi.jpg";
import ozonirovanie from "@/assets/service-ozonirovanie.jpg";
import klesch from "@/assets/service-klesch.jpg";
import rodentsYard from "@/assets/service-rodents-yard.jpg";
import dezinfekciyaRoom from "@/assets/service-dezinfekciya-room.jpg";

export const serviceImages: Record<string, string> = {
  "posle-pozhara": fireCover,
  "posle-potopa": floodCover,
  "udalenie-zapaha-gari": smokeSmell,
  "sanitarnaya-obrabotka-pomeshcheniy": disinfection,
  "dezinfekciya-posle-smerti": afterDeath,
  "udalenie-trupnogo-zapaha": odor,
  fumigaciya: fumigation,
  "udalenie-pleseni": mold,
  "ochistka-uchastkov": plot,
  // Каждой услуге — своя уникальная обложка
  "dezinfekciya-pomeshcheniy": dezinfekciyaRoom,
  dezinsekciya: dezinsekciya,
  deratizaciya: deratizaciya,
  "unichtozhenie-tarakanov": tarakany,
  "unichtozhenie-klopov": klopy,
  "unichtozhenie-blokh": blohi,
  "unichtozhenie-muravev": muravi,
  "ozonirovanie-pomescheniy": ozonirovanie,
  "obrabotka-uchastkov-ot-kleschey": klesch,
  "obrabotka-ot-grizunov-na-uchastke": rodentsYard,
};

export const getServiceImage = (slug: string): string | undefined => serviceImages[slug];

/**
 * Исходные пути обложек в репозитории — нужны, чтобы взять реальные размеры
 * из манифеста (в проде импортированные ассеты получают хеш в имени файла).
 */
const serviceImageSources: Record<string, string> = {
  "posle-pozhara": fireCover,
  "posle-potopa": floodCover,
  "udalenie-zapaha-gari": "src/assets/service-smoke-smell.webp",
  "sanitarnaya-obrabotka-pomeshcheniy": "src/assets/service-disinfection.webp",
  "dezinfekciya-posle-smerti": "src/assets/service-after-death.jpg",
  "udalenie-trupnogo-zapaha": "src/assets/service-odor.webp",
  fumigaciya: "src/assets/service-fumigation.webp",
  "udalenie-pleseni": "src/assets/service-mold.webp",
  "ochistka-uchastkov": "src/assets/service-plot.webp",
  "dezinfekciya-pomeshcheniy": "src/assets/service-dezinfekciya-room.jpg",
  dezinsekciya: "src/assets/service-dezinsekciya.jpg",
  deratizaciya: "src/assets/service-deratizaciya.jpg",
  "unichtozhenie-tarakanov": "src/assets/service-tarakany.jpg",
  "unichtozhenie-klopov": "src/assets/service-klopy.jpg",
  "unichtozhenie-blokh": "src/assets/service-blohi.jpg",
  "unichtozhenie-muravev": "src/assets/service-muravi.jpg",
  "ozonirovanie-pomescheniy": "src/assets/service-ozonirovanie.jpg",
  "obrabotka-uchastkov-ot-kleschey": "src/assets/service-klesch.jpg",
  "obrabotka-ot-grizunov-na-uchastke": "src/assets/service-rodents-yard.jpg",
};

/** Реальные размеры обложки услуги (из манифеста медиа). */
export function getServiceImageSize(slug: string): { width: number; height: number } | undefined {
  const src = serviceImageSources[slug];
  if (!src) return undefined;
  const m = getMedia(src);
  return m ? { width: m.width, height: m.height } : undefined;
}
