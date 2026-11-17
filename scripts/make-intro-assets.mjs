// Builds the M01 loader's pictures and grain (public/intro/).
//
//   node scripts/make-intro-assets.mjs
//
// Pictures: the full-size originals in assets/intro-originals/ (git-ignored),
// turned black and white with contrast 1.1, at most 1600px wide, WebP
// quality 75. Needs ffmpeg (grayscale, contrast, resize) and cwebp (WebP).
// Grain: a 256px tileable film-grain tile with transparency, drawn here
// (independent random pixels tile seamlessly), then encoded with cwebp.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crc32, deflateSync } from "node:zlib";

const ORIGINALS = "assets/intro-originals";
const OUT = "public/intro";
/** public/intro/<n>.webp from each original, in loader order. */
const PICTURES = [
  ["02.png", "1.webp"], // Las Vegas
  ["04.png", "2.webp"], // beach and car
  ["scream.png", "3.webp"], // screaming man
  ["03.png", "4.webp"], // Ferraris
];
const QUALITY = "75";
const MAX_WIDTH = 1600;
const CONTRAST = 1.1;
const GRAIN = 256;

const tmp = mkdtempSync(join(tmpdir(), "intro-"));
const kb = (path) => `${Math.round(statSync(path).size / 1024)} KB`;

try {
  for (const [source, target] of PICTURES) {
    const flat = join(tmp, `${target}.png`);
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", join(ORIGINALS, source),
      "-vf", `scale='min(${MAX_WIDTH},iw)':-2:flags=lanczos,format=gray,eq=contrast=${CONTRAST}`,
      "-frames:v", "1", flat,
    ]);
    execFileSync("cwebp", ["-quiet", "-q", QUALITY, flat, "-o", join(OUT, target)]);
    console.log(`${source} -> ${OUT}/${target} (${kb(join(OUT, target))})`);
  }

  // Grain: each pixel a white or black speck at a random, mostly faint, alpha.
  const row = GRAIN * 4 + 1;
  const raw = Buffer.alloc(row * GRAIN);
  for (let y = 0; y < GRAIN; y++) {
    raw[y * row] = 0; // PNG filter: none
    for (let x = 0; x < GRAIN; x++) {
      // Roughly normal noise from the sum of three uniforms.
      const n = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const v = n > 0 ? 255 : 0;
      const i = y * row + 1 + x * 4;
      raw[i] = raw[i + 1] = raw[i + 2] = v;
      // Alpha in steps of 16: looks the same, and compresses far better.
      raw[i + 3] = Math.min(255, Math.round((Math.abs(n) * 90) / 16) * 16);
    }
  }
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(GRAIN, 0);
  header.writeUInt32BE(GRAIN, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  const grainPng = join(tmp, "grain.png");
  writeFileSync(grainPng, png);
  execFileSync("cwebp", ["-quiet", "-lossless", "-z", "9", "-exact", grainPng, "-o", join(OUT, "grain.webp")]);
  console.log(`grain -> ${OUT}/grain.webp ${GRAIN}px (${kb(join(OUT, "grain.webp"))})`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
