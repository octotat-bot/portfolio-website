// Server only: reads the file system at build time.
import { existsSync, openSync, readSync, closeSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Pictures need no entry in content/. Pages are generated at build time and
// look in public/projects/<slug>/ for what exists. Drop a file in, rebuild,
// and the placeholder becomes the picture.

const PUBLIC = join(process.cwd(), "public");

export type Picture = { src: string; width: number; height: number };

export type ProjectMedia = {
  cover: string | null;
  shots: Picture[];
  video: string | null;
};

/** Width and height from a PNG or JPEG header, so screens keep their real shape. */
function imageSize(path: string): { width: number; height: number } | null {
  const fd = openSync(path, "r");
  try {
    const head = Buffer.alloc(64 * 1024);
    const n = readSync(fd, head, 0, head.length, 0);
    const b = head.subarray(0, n);
    // PNG: IHDR is the first chunk.
    if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    // JPEG: walk the markers to a start-of-frame.
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) return null;
        const marker = b[i + 1];
        const length = b.readUInt16BE(i + 2);
        const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
        if (isFrame) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
        i += 2 + length;
      }
    }
    return null;
  } finally {
    closeSync(fd);
  }
}

export function projectMedia(slug: string): ProjectMedia {
  const dir = join(PUBLIC, "projects", slug);
  const url = (file: string) => `/projects/${slug}/${file}`;
  if (!existsSync(dir)) return { cover: null, shots: [], video: null };
  const files = readdirSync(dir);
  const shots = files
    .filter((f) => /^shot-\d+\.(jpe?g|png)$/i.test(f))
    .sort()
    .flatMap((f) => {
      const size = imageSize(join(dir, f));
      return size ? [{ src: url(f), ...size }] : [];
    });
  return {
    cover: files.includes("cover.jpg") ? url("cover.jpg") : null,
    shots,
    video: files.includes("demo.mp4") ? url("demo.mp4") : null,
  };
}

export type Portrait = { src: string; width: number; height: number };

/** The menu portrait, public/me/menu.png, if it exists. */
export function menuPortrait(): Portrait | null {
  const path = join(PUBLIC, "me", "menu.png");
  if (!existsSync(path)) return null;
  const size = imageSize(path);
  return size ? { src: "/me/menu.png", ...size } : null;
}
