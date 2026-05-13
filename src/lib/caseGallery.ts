// Auto-imported gallery photos for each case (4 slots: before, process, equipment, after)
import dezKarasunBefore from "@/assets/cases/dezinfekciya-karasun-krasnodar-before.jpg";
import dezKarasunProcess from "@/assets/cases/dezinfekciya-karasun-krasnodar-process.jpg";
import dezKarasunEquipment from "@/assets/cases/dezinfekciya-karasun-krasnodar-equipment.jpg";
import dezKarasunAfter from "@/assets/cases/dezinfekciya-karasun-krasnodar-after.jpg";

import dezKievBefore from "@/assets/cases/dezinfekciya-kievskij-simferopol-before.jpg";
import dezKievProcess from "@/assets/cases/dezinfekciya-kievskij-simferopol-process.jpg";
import dezKievEquipment from "@/assets/cases/dezinfekciya-kievskij-simferopol-equipment.jpg";
import dezKievAfter from "@/assets/cases/dezinfekciya-kievskij-simferopol-after.jpg";

import dezPervBefore from "@/assets/cases/dezinfekciya-pervomaiskij-rostov-before.jpg";
import dezPervProcess from "@/assets/cases/dezinfekciya-pervomaiskij-rostov-process.jpg";
import dezPervEquipment from "@/assets/cases/dezinfekciya-pervomaiskij-rostov-equipment.jpg";
import dezPervAfter from "@/assets/cases/dezinfekciya-pervomaiskij-rostov-after.jpg";

import fumElevBefore from "@/assets/cases/fumigaciya-elevator-aksay-before.jpg";
import fumElevProcess from "@/assets/cases/fumigaciya-elevator-aksay-process.jpg";
import fumElevEquipment from "@/assets/cases/fumigaciya-elevator-aksay-equipment.jpg";
import fumElevAfter from "@/assets/cases/fumigaciya-elevator-aksay-after.jpg";

import fumSkladBefore from "@/assets/cases/fumigaciya-sklad-adler-sochi-before.jpg";
import fumSkladProcess from "@/assets/cases/fumigaciya-sklad-adler-sochi-process.jpg";
import fumSkladEquipment from "@/assets/cases/fumigaciya-sklad-adler-sochi-equipment.jpg";
import fumSkladAfter from "@/assets/cases/fumigaciya-sklad-adler-sochi-after.jpg";

import plesHostaBefore from "@/assets/cases/plesen-hosta-sochi-before.jpg";
import plesHostaProcess from "@/assets/cases/plesen-hosta-sochi-process.jpg";
import plesHostaEquipment from "@/assets/cases/plesen-hosta-sochi-equipment.jpg";
import plesHostaAfter from "@/assets/cases/plesen-hosta-sochi-after.jpg";

import plesRosBefore from "@/assets/cases/plesen-rossiyskaya-krasnodar-before.jpg";
import plesRosProcess from "@/assets/cases/plesen-rossiyskaya-krasnodar-process.jpg";
import plesRosEquipment from "@/assets/cases/plesen-rossiyskaya-krasnodar-equipment.jpg";
import plesRosAfter from "@/assets/cases/plesen-rossiyskaya-krasnodar-after.jpg";

import plesZhdBefore from "@/assets/cases/plesen-zhd-simferopol-before.jpg";
import plesZhdProcess from "@/assets/cases/plesen-zhd-simferopol-process.jpg";
import plesZhdEquipment from "@/assets/cases/plesen-zhd-simferopol-equipment.jpg";
import plesZhdAfter from "@/assets/cases/plesen-zhd-simferopol-after.jpg";

import potopGostBefore from "@/assets/cases/potop-gostinitsa-adler-sochi-before.jpg";
import potopGostProcess from "@/assets/cases/potop-gostinitsa-adler-sochi-process.jpg";
import potopGostEquipment from "@/assets/cases/potop-gostinitsa-adler-sochi-equipment.jpg";
import potopGostAfter from "@/assets/cases/potop-gostinitsa-adler-sochi-after.jpg";

import potopEnkaBefore from "@/assets/cases/potop-podval-enka-krasnodar-before.jpg";
import potopEnkaProcess from "@/assets/cases/potop-podval-enka-krasnodar-process.jpg";
import potopEnkaEquipment from "@/assets/cases/potop-podval-enka-krasnodar-equipment.jpg";
import potopEnkaAfter from "@/assets/cases/potop-podval-enka-krasnodar-after.jpg";

import pozharVorBefore from "@/assets/cases/pozhar-voroshilovskij-rostov-before.jpg";
import pozharVorProcess from "@/assets/cases/pozhar-voroshilovskij-rostov-process.jpg";
import pozharVorEquipment from "@/assets/cases/pozhar-voroshilovskij-rostov-equipment.jpg";
import pozharVorAfter from "@/assets/cases/pozhar-voroshilovskij-rostov-after.jpg";

import pozharSamBefore from "@/assets/cases/pozhar-zhk-samolet-krasnodar-before.jpg";
import pozharSamProcess from "@/assets/cases/pozhar-zhk-samolet-krasnodar-process.jpg";
import pozharSamEquipment from "@/assets/cases/pozhar-zhk-samolet-krasnodar-equipment.jpg";
import pozharSamAfter from "@/assets/cases/pozhar-zhk-samolet-krasnodar-after.jpg";

export type GalleryKind = "before" | "process" | "equipment" | "after";

export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  kind: GalleryKind;
};

const KIND_LABEL: Record<GalleryKind, string> = {
  before: "До работ",
  process: "В процессе",
  equipment: "Оборудование",
  after: "После сдачи",
};

function build(slug: string, title: string, srcs: Record<GalleryKind, string>): GalleryPhoto[] {
  return (Object.keys(KIND_LABEL) as GalleryKind[]).map((kind) => ({
    src: srcs[kind],
    alt: `${KIND_LABEL[kind]} — ${title}`,
    caption: KIND_LABEL[kind],
    kind,
  }));
}

export const caseGallery: Record<string, GalleryPhoto[]> = {
  "dezinfekciya-karasun-krasnodar": build("dezinfekciya-karasun-krasnodar", "санация в Краснодаре", {
    before: dezKarasunBefore, process: dezKarasunProcess, equipment: dezKarasunEquipment, after: dezKarasunAfter,
  }),
  "dezinfekciya-kievskij-simferopol": build("dezinfekciya-kievskij-simferopol", "санация в Симферополе", {
    before: dezKievBefore, process: dezKievProcess, equipment: dezKievEquipment, after: dezKievAfter,
  }),
  "dezinfekciya-pervomaiskij-rostov": build("dezinfekciya-pervomaiskij-rostov", "санация в Ростове", {
    before: dezPervBefore, process: dezPervProcess, equipment: dezPervEquipment, after: dezPervAfter,
  }),
  "fumigaciya-elevator-aksay": build("fumigaciya-elevator-aksay", "фумигация элеватора в Аксае", {
    before: fumElevBefore, process: fumElevProcess, equipment: fumElevEquipment, after: fumElevAfter,
  }),
  "fumigaciya-sklad-adler-sochi": build("fumigaciya-sklad-adler-sochi", "фумигация склада в Адлере", {
    before: fumSkladBefore, process: fumSkladProcess, equipment: fumSkladEquipment, after: fumSkladAfter,
  }),
  "plesen-hosta-sochi": build("plesen-hosta-sochi", "удаление плесени в Хосте", {
    before: plesHostaBefore, process: plesHostaProcess, equipment: plesHostaEquipment, after: plesHostaAfter,
  }),
  "plesen-rossiyskaya-krasnodar": build("plesen-rossiyskaya-krasnodar", "удаление плесени в Краснодаре", {
    before: plesRosBefore, process: plesRosProcess, equipment: plesRosEquipment, after: plesRosAfter,
  }),
  "plesen-zhd-simferopol": build("plesen-zhd-simferopol", "удаление плесени в Симферополе", {
    before: plesZhdBefore, process: plesZhdProcess, equipment: plesZhdEquipment, after: plesZhdAfter,
  }),
  "potop-gostinitsa-adler-sochi": build("potop-gostinitsa-adler-sochi", "просушка гостиницы в Адлере", {
    before: potopGostBefore, process: potopGostProcess, equipment: potopGostEquipment, after: potopGostAfter,
  }),
  "potop-podval-enka-krasnodar": build("potop-podval-enka-krasnodar", "просушка подвала в Краснодаре", {
    before: potopEnkaBefore, process: potopEnkaProcess, equipment: potopEnkaEquipment, after: potopEnkaAfter,
  }),
  "pozhar-voroshilovskij-rostov": build("pozhar-voroshilovskij-rostov", "уборка после пожара в Ростове", {
    before: pozharVorBefore, process: pozharVorProcess, equipment: pozharVorEquipment, after: pozharVorAfter,
  }),
  "pozhar-zhk-samolet-krasnodar": build("pozhar-zhk-samolet-krasnodar", "уборка после пожара в Краснодаре", {
    before: pozharSamBefore, process: pozharSamProcess, equipment: pozharSamEquipment, after: pozharSamAfter,
  }),
};

export function getCaseGallery(slug: string): GalleryPhoto[] {
  return caseGallery[slug] ?? [];
}

export function getCaseCover(slug: string): string | undefined {
  return caseGallery[slug]?.[0]?.src;
}
