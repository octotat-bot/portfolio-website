import { Anton, Geist, Geist_Mono, Reenie_Beanie } from "next/font/google";
import localFont from "next/font/local";

// The variable names here are the ones scripts/build-tokens.mjs writes into the
// font stacks (--face-<family name, lowercase, dashed>). Keep them in step.

export const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--face-anton",
});

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--face-geist",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--face-geist-mono",
});

export const reenieBeanie = Reenie_Beanie({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--face-reenie-beanie",
});

// The two effect faces. Files are cut down to capitals, digits and headline
// punctuation by scripts/fetch-effect-fonts.mjs. They are not preloaded, so a
// browser downloads them only on a page that sets text in them (the font
// shuffle loads them just before it starts).
export const rubikScribble = localFont({
  src: "./fonts/rubik-scribble-subset.woff2",
  weight: "400",
  display: "swap",
  variable: "--face-rubik-scribble",
  preload: false,
  adjustFontFallback: false,
});

export const rubikMarkerHatch = localFont({
  src: "./fonts/rubik-marker-hatch-subset.woff2",
  weight: "400",
  display: "swap",
  variable: "--face-rubik-marker-hatch",
  preload: false,
  adjustFontFallback: false,
});

export const baseFaces = [anton.variable, geist.variable, geistMono.variable, reenieBeanie.variable].join(" ");
export const effectFaces = [rubikScribble.variable, rubikMarkerHatch.variable].join(" ");
