// Реальные фото и видео с выездов бригады после потопа (офисное здание, откачка + уборка).
// Файлы лежат в public/media — попадают в dist и деплоятся на боевой хостинг.
// Размеры и длительность НЕ хардкодятся: берутся из автогенерируемого манифеста
// (npm run media:manifest), который читает реальные файлы.
import { getMedia, getMediaDuration } from "./generated/mediaManifest";

export type BeforeAfterPhoto = {
  src: string;
  alt: string;
  caption: string;
  /** Реальные размеры файла — используются в JSON-LD ImageObject */
  width?: number;
  height?: number;
};

export const FLOOD_SERVICE_SLUG = "posle-potopa";

export type FloodVideo = {
  src: string;
  poster: string;
  caption: string;
  duration: string;
  uploadDate: string;
  width: number;
  height: number;
  posterWidth: number;
  posterHeight: number;
};

const VIDEO_SRC = "/media/potop-video.mp4";
const VIDEO_POSTER = "/media/potop-video-poster.webp";

export function getFloodVideo(cityLocative?: string): FloodVideo {
  const geo = cityLocative ? ` ${cityLocative}` : "";
  const video = getMedia(VIDEO_SRC);
  const poster = getMedia(VIDEO_POSTER);
  return {
    src: VIDEO_SRC,
    poster: VIDEO_POSTER,
    caption: `Видео с выезда бригады${geo}: откачка воды, вывоз ила и уборка помещений`,
    duration: getMediaDuration(VIDEO_SRC) ?? "PT35S",
    uploadDate: "2026-07-29T10:00:00+03:00",
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    posterWidth: poster?.width ?? 0,
    posterHeight: poster?.height ?? 0,
  };
}

/** Дополняет фото реальными размерами из манифеста. */
export function withRealSize(photo: Omit<BeforeAfterPhoto, "width" | "height">): BeforeAfterPhoto {
  const m = getMedia(photo.src);
  return { ...photo, width: m?.width, height: m?.height };
}

export function getFloodGallery(cityLocative?: string): BeforeAfterPhoto[] {
  const geo = cityLocative ? ` ${cityLocative}` : "";
  return [
    {
      src: "/media/potop-koridor-ofisa.webp",
      alt: `Уборка после потопа${geo} — коридор офиса до и после`,
      caption: "Коридор офиса: откачка и уборка",
    },
    {
      src: "/media/potop-kabinet.webp",
      alt: `Уборка после потопа${geo} — кабинет с илом до и после`,
      caption: "Кабинет: ил и грязь после подтопления",
    },
    {
      src: "/media/potop-zal.webp",
      alt: `Уборка после потопа${geo} — зал 60 м² до и после просушки`,
      caption: "Зал 60 м²: просушка и мойка",
    },
    {
      src: "/media/potop-holl-lestnica.webp",
      alt: `Уборка после потопа${geo} — холл и лестница до и после`,
      caption: "Холл и лестница: очистка после потопа",
    },
  ].map(withRealSize);
}

export const floodCover = "/media/potop-koridor-ofisa.webp";
