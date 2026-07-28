import floodCoverAsset from "@/assets/potop-koridor-ofisa.jpg.asset.json";
import smokeSmell from "@/assets/service-smoke-smell.webp";
import disinfection from "@/assets/service-disinfection.webp";
import odor from "@/assets/service-odor.webp";
import fumigation from "@/assets/service-fumigation.webp";
import afterDeath from "@/assets/service-after-death.jpg";
import mold from "@/assets/service-mold.webp";
import fire from "@/assets/service-fire.webp";
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
  "posle-pozhara": fire,
  "posle-potopa": floodCoverAsset.url,
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
