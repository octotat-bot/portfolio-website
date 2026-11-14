// Server only: reads the file system at build time.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Pictures need no entry in content/. Pages are generated at build time and
// look in public/projects/<slug>/ for what exists. Drop a file in, rebuild,
// and the placeholder becomes the picture.

const PUBLIC = join(process.cwd(), "public");

export type ProjectMedia = {
  cover: string | null;
  shots: string[];
  video: string | null;
};

export function projectMedia(slug: string): ProjectMedia {
  const dir = join(PUBLIC, "projects", slug);
  const url = (file: string) => `/projects/${slug}/${file}`;
  if (!existsSync(dir)) return { cover: null, shots: [], video: null };
  const files = readdirSync(dir);
  return {
    cover: files.includes("cover.jpg") ? url("cover.jpg") : null,
    shots: files.filter((f) => /^shot-\d+\.(jpe?g|png|webp)$/i.test(f)).sort().map(url),
    video: files.includes("demo.mp4") ? url("demo.mp4") : null,
  };
}
