import flood from "@/assets/service-flood.jpg";
import smokeSmell from "@/assets/service-smoke-smell.jpg";
import disinfection from "@/assets/service-disinfection.jpg";
import odor from "@/assets/service-odor.jpg";
import fumigation from "@/assets/service-fumigation.jpg";

export const serviceImages: Record<string, string> = {
  "posle-potopa": flood,
  "udalenie-zapaha-gari": smokeSmell,
  "sanitarnaya-obrabotka-pomeshcheniy": disinfection,
  "dezinfekciya-posle-smerti": disinfection,
  "udalenie-trupnogo-zapaha": odor,
  "fumigaciya": fumigation,
};

export const getServiceImage = (slug: string): string | undefined => serviceImages[slug];
