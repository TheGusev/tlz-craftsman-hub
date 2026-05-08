import caseFire from "@/assets/case-fire-before-after.png";
import caseFlood from "@/assets/case-flood-before-after.png";
import caseMold from "@/assets/case-mold-before-after.png";
import caseSanitation from "@/assets/case-sanitation-before-after.png";

export const caseImages: Record<string, string> = {
  "pozhar-zhk-samolet-krasnodar": caseFire,
  "pozhar-voroshilovskij-rostov": caseFire,
  "potop-podval-enka-krasnodar": caseFlood,
  "potop-gostinitsa-adler-sochi": caseFlood,
  "plesen-rossiyskaya-krasnodar": caseMold,
  "plesen-hosta-sochi": caseMold,
  "plesen-zhd-simferopol": caseMold,
  "dezinfekciya-karasun-krasnodar": caseSanitation,
  "dezinfekciya-pervomaiskij-rostov": caseSanitation,
  "dezinfekciya-kievskij-simferopol": caseSanitation,
};

export const getCaseImage = (slug: string): string | undefined => caseImages[slug];
