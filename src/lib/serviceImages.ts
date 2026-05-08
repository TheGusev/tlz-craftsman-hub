import flood from "@/assets/service-flood.jpg";
import smokeSmell from "@/assets/service-smoke-smell.jpg";
import disinfection from "@/assets/service-disinfection.jpg";
import odor from "@/assets/service-odor.jpg";
import fumigation from "@/assets/service-fumigation.jpg";
import afterDeath from "@/assets/hero-main.jpg";
import mold from "@/assets/service-mold.png";
import fire from "@/assets/service-fire.png";
import plot from "@/assets/service-plot.png";

export const serviceImages: Record<string, string> = {
  "posle-pozhara": fire,
  "posle-potopa": flood,
  "udalenie-zapaha-gari": smokeSmell,
  "sanitarnaya-obrabotka-pomeshcheniy": disinfection,
  "dezinfekciya-posle-smerti": afterDeath,
  "udalenie-trupnogo-zapaha": odor,
  "fumigaciya": fumigation,
  "udalenie-pleseni": mold,
  "ochistka-uchastkov": plot,
};

export const getServiceImage = (slug: string): string | undefined => serviceImages[slug];
