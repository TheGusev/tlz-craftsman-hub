/**
 * Генерация манифеста медиа: реальные размеры изображений и длительность видео.
 *
 * Запуск: npx tsx scripts/media-manifest.ts
 * Результат: src/lib/generated/mediaManifest.ts (коммитится, чтобы CI не зависел от ffmpeg).
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

import { imageSize, mp4Info } from "./media-probe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

export type MediaEntry = {
  width: number;
  height: number;
  bytes: number;
  mime: string;
  /** Длительность видео в секундах (только для mp4). */
  durationSeconds?: number;
};

// ---------- Сбор ----------

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
};

function collect(dir: string, keyPrefix: string, out: Record<string, MediaEntry>) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      collect(full, `${keyPrefix}${name}/`, out);
      continue;
    }
    const ext = extname(name).toLowerCase();
    const mime = MIME[ext];
    if (!mime) continue;

    const buf = readFileSync(full);
    const key = `${keyPrefix}${name}`;

    if (ext === ".mp4") {
      const info = mp4Info(buf);
      if (!info) {
        console.warn(`[media-manifest] не удалось разобрать ${key}`);
        continue;
      }
      out[key] = {
        width: info.width,
        height: info.height,
        bytes: st.size,
        mime,
        durationSeconds: Math.round(info.durationSeconds * 100) / 100,
      };
      continue;
    }

    const size = imageSize(buf, ext);
    if (!size) {
      console.warn(`[media-manifest] не удалось разобрать ${key}`);
      continue;
    }
    out[key] = { width: size.width, height: size.height, bytes: st.size, mime };
  }
}

function main() {
  const entries: Record<string, MediaEntry> = {};
  // Публичные файлы — ключ равен URL на сайте (/media/...)
  collect(join(ROOT, "public", "media"), "/media/", entries);
  // Обложки услуг — ключ по исходному пути в репозитории
  collect(join(ROOT, "src", "assets"), "src/assets/", entries);

  const outDir = join(ROOT, "src", "lib", "generated");
  mkdirSync(outDir, { recursive: true });

  const body = `// АВТОГЕНЕРАЦИЯ — не редактировать вручную.
// Обновить: npm run media:manifest
// Источник: реальные файлы public/media и src/assets.

export type MediaEntry = {
  width: number;
  height: number;
  bytes: number;
  mime: string;
  /** Длительность видео в секундах (только для видео). */
  durationSeconds?: number;
};

export const mediaManifest: Record<string, MediaEntry> = ${JSON.stringify(entries, null, 2)} as const;

/** Размеры/метаданные файла по пути (/media/... или src/assets/...). */
export function getMedia(path: string): MediaEntry | undefined {
  return mediaManifest[path];
}

/** Длительность видео в формате ISO-8601 (PT34S) — из реального файла. */
export function getMediaDuration(path: string): string | undefined {
  const seconds = mediaManifest[path]?.durationSeconds;
  if (!seconds) return undefined;
  return \`PT\${Math.round(seconds)}S\`;
}
`;

  writeFileSync(join(outDir, "mediaManifest.ts"), body, "utf8");
  console.log(`[media-manifest] записано записей: ${Object.keys(entries).length}`);
}

main();
