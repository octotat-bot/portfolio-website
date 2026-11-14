// Two checks that keep the site on its tokens.
//   1. Compile the theme and prove that Tailwind's defaults produce no CSS
//      while the token classes do.
//   2. Scan the source for values that bypass the tokens: hex colours,
//      arbitrary values, shadows, gradients, off-scale radii and durations.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const failures = [];

// ---- 1. Theme reachability -------------------------------------------------

const compiler = await compile('@import "tailwindcss";\n@import "./styles/tokens.css";', {
  base: root,
  loadStylesheet: async (id, base) => {
    const path = id === "tailwindcss" ? require.resolve("tailwindcss/index.css") : resolve(base, id);
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  },
});

const mustNotExist = [
  "bg-red-500", "text-blue-600", "bg-white", "text-black", "border-gray-200", "bg-slate-900",
  "from-pink-500", "ring-indigo-500", "fill-emerald-400",
  "rounded-xs", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl",
  "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl", "inset-shadow-sm", "drop-shadow-md", "text-shadow-sm",
  "text-xs", "text-sm", "text-base", "text-xl", "text-9xl",
  "p-5", "m-7", "gap-8", "px-12", "mt-20", "w-64",
  "font-serif", "font-bold", "tracking-wide", "leading-tight",
  "blur-sm", "animate-spin", "animate-pulse", "sm:block", "xl:block", "max-w-md",
];
const mustExist = [
  "bg-midnight", "bg-midnight-raised", "border-line", "bg-burgundy", "bg-burgundy-deep", "text-claret",
  "text-ivory", "text-ash",
  "p-1", "p-2", "p-3", "p-4", "p-6", "p-10", "p-16", "p-24", "p-32",
  "h-nav", "h-button", "h-ticker", "min-h-target", "max-w-measure",
  "rounded-0", "rounded-sm", "rounded-pill",
  "ease-out", "ease-pop", "ease-in-out", "dur-fast", "dur-roll", "dur-pop", "dur-page",
  "font-display", "font-sans", "font-mono", "font-hand", "font-scribble",
  "monument", "poster-1", "poster-2", "poster-3", "poster-4", "menu", "lede", "body", "small", "label", "meta",
  "note", "scrawl", "scribble",
  "md:px-10", "lg:block",
];

const escape = (cls) => cls.replace(/[:/.]/g, "\\$&");
const css = compiler.build([...mustNotExist, ...mustExist]);
for (const cls of mustNotExist) {
  if (css.includes(`.${escape(cls)} `) || css.includes(`.${escape(cls)}{`)) {
    failures.push(`theme: Tailwind default "${cls}" still generates CSS`);
  }
}
for (const cls of mustExist) {
  if (!css.includes(`.${escape(cls)} `) && !css.includes(`.${escape(cls)}{`)) {
    failures.push(`theme: token class "${cls}" generates no CSS`);
  }
}

// Every token value must appear in the compiled CSS exactly as written.
const tokens = JSON.parse(readFileSync(resolve(root, "docs/tokens.json"), "utf8"));
const expect = (name, value) => {
  if (!css.includes(`${name}: ${value};`)) failures.push(`theme: ${name} is not ${value} in the compiled CSS`);
};
for (const t of tokens.color.tokens) expect(`--color-${t.name}`, t.value);
for (const t of tokens.spacing.tokens) expect(`--spacing-${t.name.replace(/^space-/, "")}`, t.value);
for (const t of tokens.size.tokens) expect(`--spacing-${t.name}`, t.value);
for (const t of tokens.radius.tokens) expect(`--radius-${t.name.replace(/^radius-/, "")}`, t.value);
for (const t of tokens.breakpoint.tokens) expect(`--breakpoint-${t.name}`, t.value);
for (const t of tokens.easing.tokens) expect(`--${t.name}`, t.value);
for (const t of tokens.duration.tokens) expect(`--${t.name}`, t.value);
for (const group of tokens.type.groups) {
  for (const style of group.styles) {
    const block = css.slice(css.indexOf(`.${style.name} {`));
    const rule = block.slice(0, block.indexOf("}"));
    const want = [
      `font-size: ${style.fluid ?? style.fontSize}`,
      `line-height: ${style.lineHeight}`,
      `font-weight: ${style.fontWeight}`,
      ...(style.letterSpacing ? [`letter-spacing: ${style.letterSpacing}`] : []),
    ];
    for (const decl of want) {
      if (!rule.includes(decl)) failures.push(`theme: .${style.name} is missing "${decl}"`);
    }
  }
}

// ---- 2. Source scan --------------------------------------------------------

const SCAN_DIRS = ["app", "components", "content", "lib"];
const SCAN_EXT = /\.(tsx?|css)$/;
const banned = [
  [/#[0-9a-fA-F]{3,8}\b(?![\w-])/, "hex colour (use a colour token)"],
  [/\b(rgb|rgba|hsl|hsla|oklch|oklab)\(/, "colour function (use a colour token)"],
  [/\b(bg|text|border|outline|fill|stroke|ring|from|via|to|decoration|caret|accent)-\[/, "arbitrary colour or size class"],
  [/\b(p[xytrbl]?|m[xytrbl]?|gap|space-[xy]|w|h|min-[wh]|max-[wh]|size|inset|top|left|right|bottom|rounded|text|leading|tracking)-\[\d/, "arbitrary size class"],
  [/\brounded-(none|full)\b/, "radius outside the tokens (rounded-0, rounded-sm, rounded-pill)"],
  [/\b(shadow|drop-shadow|inset-shadow|text-shadow)(-|\b(?=["'\s`]))/, "shadow"],
  [/\bbox-shadow\s*:|\btext-shadow\s*:/, "shadow"],
  [/\bbg-(gradient|linear|radial|conic)-|\b(linear|radial|conic)-gradient\(/, "gradient"],
  [/\bduration-\d+/, "raw duration (use dur-fast, dur-roll, dur-pop, dur-page)"],
  [/\bcursor-none\b|cursor:\s*none/, "custom cursor"],
  [/from\s+["']framer-motion["']/, "framer-motion import (use motion/react)"],
  [/from\s+["'](gsap|three|@react-three\/fiber|ogl|lottie-web|lucide-react)["']/, "banned library"],
];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : SCAN_EXT.test(name) ? [path] : [];
  });

for (const dir of SCAN_DIRS) {
  let files = [];
  try {
    files = walk(resolve(root, dir));
  } catch {
    continue;
  }
  for (const file of files) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (line.includes("check-tokens-ignore")) return;
        for (const [pattern, why] of banned) {
          if (pattern.test(line)) failures.push(`${relative(root, file)}:${i + 1}: ${why}\n    ${line.trim()}`);
        }
      });
  }
}

if (failures.length) {
  console.error(`check-tokens: ${failures.length} problem(s)\n`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log(
  `check-tokens: ok. ${mustNotExist.length} Tailwind defaults unreachable, ${mustExist.length} token classes present, all token values match, source is clean.`,
);
