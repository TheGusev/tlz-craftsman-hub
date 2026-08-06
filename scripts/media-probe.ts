/**
 * Чтение реальных размеров изображений (WebP/JPEG/PNG) и метаданных MP4
 * без внешних зависимостей. Используется генератором манифеста и SEO-верификатором.
 */
import { readFileSync } from "node:fs";
import { extname } from "node:path";

// ---------- Чтение размеров изображений (без внешних зависимостей) ----------

export function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  if (buf.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.readUInt16BE(0) !== 0xffd8) return null;
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) {
      off++;
      continue;
    }
    const marker = buf[off + 1];
    const len = buf.readUInt16BE(off + 2);
    // SOF0..SOF15, кроме DHT(c4), JPGA(c8), DAC(cc)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    off += 2 + len;
  }
  return null;
}

export function webpSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const fmt = buf.toString("ascii", 12, 16);
  if (fmt === "VP8 ") {
    // Lossy: 3 байта frame tag + sync code, далее 14-bit ширина/высота
    const start = 20 + 3;
    return {
      width: buf.readUInt16LE(start + 3) & 0x3fff,
      height: buf.readUInt16LE(start + 5) & 0x3fff,
    };
  }
  if (fmt === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  if (fmt === "VP8X") {
    const w = buf[24] | (buf[25] << 8) | (buf[26] << 16);
    const h = buf[27] | (buf[28] << 8) | (buf[29] << 16);
    return { width: w + 1, height: h + 1 };
  }
  return null;
}

export function imageSize(buf: Buffer, ext: string): { width: number; height: number } | null {
  if (ext === ".png") return pngSize(buf);
  if (ext === ".jpg" || ext === ".jpeg") return jpegSize(buf);
  if (ext === ".webp") return webpSize(buf);
  return null;
}

// ---------- MP4: размеры (tkhd) и длительность (mvhd) ----------

export type Mp4Info = { width: number; height: number; durationSeconds: number };

export function mp4Info(buf: Buffer): Mp4Info | null {
  let durationSeconds = 0;
  let width = 0;
  let height = 0;

  const walk = (start: number, end: number) => {
    let off = start;
    while (off + 8 <= end) {
      let size = buf.readUInt32BE(off);
      const type = buf.toString("ascii", off + 4, off + 8);
      let headerSize = 8;
      if (size === 1) {
        size = Number(buf.readBigUInt64BE(off + 8));
        headerSize = 16;
      }
      if (size < headerSize || off + size > end) break;
      const body = off + headerSize;

      if (type === "moov" || type === "trak" || type === "mdia" || type === "minf" || type === "stbl") {
        walk(body, off + size);
      } else if (type === "stsd") {
        // Точные целые размеры кадра из описания видеосэмпла (avc1/hvc1/mp4v)
        const entryStart = body + 8;
        if (entryStart + 40 <= off + size) {
          const codec = buf.toString("ascii", entryStart + 4, entryStart + 8);
          if (["avc1", "hvc1", "hev1", "mp4v", "av01"].includes(codec)) {
            const w = buf.readUInt16BE(entryStart + 32);
            const h = buf.readUInt16BE(entryStart + 34);
            if (w > 0 && h > 0) {
              width = w;
              height = h;
            }
          }
        }
      } else if (type === "mvhd") {
        const version = buf[body];
        if (version === 1) {
          const timescale = buf.readUInt32BE(body + 20);
          const dur = Number(buf.readBigUInt64BE(body + 24));
          if (timescale) durationSeconds = dur / timescale;
        } else {
          const timescale = buf.readUInt32BE(body + 12);
          const dur = buf.readUInt32BE(body + 16);
          if (timescale) durationSeconds = dur / timescale;
        }
      } else if (type === "tkhd") {
        const version = buf[body];
        const end2 = body + (version === 1 ? 96 : 84);
        if (end2 <= buf.length) {
          const w = buf.readUInt32BE(end2 - 8) / 65536;
          const h = buf.readUInt32BE(end2 - 4) / 65536;
          if (w > 0 && h > 0 && !width) {
            width = Math.round(w);
            height = Math.round(h);
          }
        }
      }
      off += size;
    }
  };

  walk(0, buf.length);
  if (!durationSeconds || !width || !height) return null;
  return { width, height, durationSeconds };
}


/** Размеры изображения или видео по пути к файлу на диске. */
export function probeFile(
  filePath: string,
): { width: number; height: number; durationSeconds?: number } | null {
  const ext = extname(filePath).toLowerCase();
  const buf = readFileSync(filePath);
  if (ext === ".mp4") {
    const info = mp4Info(buf);
    return info ? { width: info.width, height: info.height, durationSeconds: info.durationSeconds } : null;
  }
  return imageSize(buf, ext);
}
