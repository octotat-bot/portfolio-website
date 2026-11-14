// Turns docs/tokens.json into styles/tokens.css: the Tailwind theme, the CSS
// variables and one utility per type style. tokens.json is the only source of
// values; nothing in this file adds a colour, size or timing of its own.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(resolve(root, "docs/tokens.json"), "utf8"));

// Faces loaded through next/font (see app/fonts.ts). next/font gives each face a
// hashed family name and exposes it as a CSS variable, so the stacks from
// tokens.json are rewritten to read that variable, with the plain name as the
// fallback for pages where a face is not loaded.
const LOADED_FACES = [
  "Anton",
  "Geist",
  "Geist Mono",
  "Reenie Beanie",
  "Rubik Scribble",
  "Rubik Marker Hatch",
];
export const faceVar = (name) => `--face-${name.toLowerCase().replace(/\s+/g, "-")}`;

const stack = (value) =>
  value
    .split(",")
    .map((part) => part.trim())
    .map((part) => {
      const name = part.replace(/^"|"$/g, "");
      return LOADED_FACES.includes(name) ? `var(${faceVar(name)}, "${name}")` : part;
    })
    .join(", ");

const lines = [];
const out = (line = "") => lines.push(line);

out("/* GENERATED from docs/tokens.json by scripts/build-tokens.mjs. Do not edit by hand. */");
out();
out("@theme static {");
out("  /* Wipe every Tailwind default so only the tokens below exist. */");
out("  --*: initial;");
out();
for (const c of tokens.color.tokens) out(`  --color-${c.name}: ${c.value};`);
out();
out("  --spacing-0: 0px;");
for (const s of tokens.spacing.tokens) out(`  --spacing-${s.name.replace(/^space-/, "")}: ${s.value};`);
for (const s of tokens.size.tokens) out(`  --spacing-${s.name}: ${s.value};`);
out();
for (const r of tokens.radius.tokens) out(`  --radius-${r.name.replace(/^radius-/, "")}: ${r.value};`);
out();
for (const b of tokens.breakpoint.tokens) out(`  --breakpoint-${b.name}: ${b.value};`);
out();
for (const e of tokens.easing.tokens) out(`  --${e.name}: ${e.value};`);
out();
for (const d of tokens.duration.tokens) out(`  --${d.name}: ${d.value};`);
out("}");
out();
out("@theme inline {");
for (const [name, value] of Object.entries(tokens.type.families)) out(`  --font-${name}: ${stack(value)};`);
out("}");
out();

const styleNames = [];
for (const group of tokens.type.groups) {
  for (const style of group.styles) {
    const family = tokens.type.families[style.family ?? group.family];
    styleNames.push(style.name);
    out(`@utility ${style.name} {`);
    out(`  font-family: ${stack(family)};`);
    out(`  font-size: ${style.fluid ?? style.fontSize};`);
    out(`  line-height: ${style.lineHeight};`);
    out(`  font-weight: ${style.fontWeight};`);
    if (style.letterSpacing) out(`  letter-spacing: ${style.letterSpacing};`);
    if (style.textTransform) out(`  text-transform: ${style.textTransform};`);
    out("}");
    out();
  }
}

for (const d of tokens.duration.tokens.filter((d) => d.name.startsWith("dur-"))) {
  out(`@utility ${d.name} {`);
  out(`  --tw-duration: var(--${d.name});`);
  out(`  transition-duration: var(--${d.name});`);
  out("}");
  out();
}

// Type styles are looked up by name from data (the styleguide, content-driven
// components), so they are always generated.
out(`@source inline("${styleNames.join(" ")}");`);

const target = resolve(root, "styles/tokens.css");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, lines.join("\n") + "\n");
console.log(`tokens: wrote styles/tokens.css (${tokens.color.tokens.length} colours, ${styleNames.length} type styles)`);
