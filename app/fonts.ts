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
// punctuation by scripts/fetch-effect-fonts.mjs. They are not on <html>: a page
// that uses the font shuffle or the scribble style adds `effectFaces` itself,
// so pages that do not use them never download them.
export const rubikScribble = localFont({
  src: "./fonts/rubik-scribble-subset.woff2",
  weight: "400",
  display: "swap",
  variable: "--face-rubik-scribble",
  adjustFontFallback: false,
});

export const rubikMarkerHatch = localFont({
  src: "./fonts/rubik-marker-hatch-subset.woff2",
  weight: "400",
  display: "swap",
  variable: "--face-rubik-marker-hatch",
  adjustFontFallback: false,
});

export const baseFaces = [anton.variable, geist.variable, geistMono.variable, reenieBeanie.variable].join(" ");
export const effectFaces = [rubikScribble.variable, rubikMarkerHatch.variable].join(" ");
