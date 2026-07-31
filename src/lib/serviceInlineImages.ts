// Подбор релевантных кейс-фото для инлайн-вставок на страницах city×service.
// Возвращает 2-3 фото + подпись под галерею. Все ассеты — реальные кейсы бригады.
import { caseGallery, type GalleryPhoto } from "@/lib/caseGallery";

// serviceSlug -> предпочтительный кейс из caseGallery
const SERVICE_TO_CASE: Record<string, string> = {
  "posle-pozhara": "pozhar-zhk-samolet-krasnodar",
  "posle-potopa": "potop-gostinitsa-adler-sochi",
  "udalenie-pleseni": "plesen-rossiyskaya-krasnodar",
  fumigaciya: "fumigaciya-sklad-adler-sochi",
  "sanitarnaya-obrabotka-pomeshcheniy": "dezinfekciya-karasun-krasnodar",
  "dezinfekciya-pomeshcheniy": "dezinfekciya-karasun-krasnodar",
  "dezinfekciya-posle-smerti": "dezinfekciya-pervomaiskij-rostov",
  "udalenie-trupnogo-zapaha": "dezinfekciya-pervomaiskij-rostov",
  "udalenie-zapaha-gari": "pozhar-voroshilovskij-rostov",
  dezinsekciya: "dezinfekciya-kievskij-simferopol",
  deratizaciya: "dezinfekciya-kievskij-simferopol",
  "unichtozhenie-tarakanov": "dezinfekciya-karasun-krasnodar",
  "unichtozhenie-klopov": "dezinfekciya-karasun-krasnodar",
  "unichtozhenie-blokh": "dezinfekciya-kievskij-simferopol",
  "unichtozhenie-muravev": "dezinfekciya-kievskij-simferopol",
  "ozonirovanie-pomescheniy": "dezinfekciya-pervomaiskij-rostov",
};

export function getInlineGallery(serviceSlug: string): GalleryPhoto[] {
  // Для «после потопа» показываем реальные фото объекта (BeforeAfterGallery).
  // Для «после потопа» и «после пожара» показываем реальные фото объектов (BeforeAfterGallery).
  if (serviceSlug === "posle-potopa" || serviceSlug === "posle-pozhara") return [];
  const caseSlug = SERVICE_TO_CASE[serviceSlug];
  if (!caseSlug) return [];
  const photos = caseGallery[caseSlug];
  if (!photos) return [];
  // Показываем 3 кадра: до, процесс, после
  return [photos[0], photos[1], photos[3]].filter(Boolean);
}
