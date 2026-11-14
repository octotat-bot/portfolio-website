// Downloads Rubik Scribble and Rubik Marker Hatch from Google Fonts, cut down
// to the characters the site actually shows in them, into app/fonts/.
// next/font/google cannot subset to a character list, so these two faces are
// loaded with next/font/local from the files this script writes.
//
// Run again (pnpm fonts) only if a headline needs a character not listed here.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Headlines are uppercase, so: capitals, digits and the punctuation in CONTENT.md.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,?!'’&-/";
const FACES = [
  { family: "Rubik Scribble", file: "rubik-scribble-subset.woff2" },
  { family: "Rubik Marker Hatch", file: "rubik-marker-hatch-subset.woff2" },
];
// A current browser user agent makes Google Fonts answer with woff2.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

mkdirSync(resolve(root, "app/fonts"), { recursive: true });

for (const { family, file } of FACES) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}&text=${encodeURIComponent(CHARS)}`;
  const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/);
  if (!match) throw new Error(`No woff2 source for ${family}:\n${css}`);
  const bytes = Buffer.from(await (await fetch(match[1])).arrayBuffer());
  writeFileSync(resolve(root, "app/fonts", file), bytes);
  console.log(`fonts: ${file} ${(bytes.length / 1024).toFixed(1)} kB`);
}
