// The poster shape kit (DESIGN.md, "Shapes"): disc, ring, half disc, quarter
// disc, 8-point star, bar, triangle, square. Flat and square-edged. Every
// shape is drawn around its own centre (0, 0) so it can be moved, turned and
// scaled with one transform.
//
// A composition is 10 to 16 pieces laid out in a fixed viewBox. Pieces name a
// colour role, not a colour; the role becomes a colour for the surface the
// composition sits on (see `roleColour`).

import { color } from "./tokens";

export type Kind = "disc" | "ring" | "half" | "quarter" | "star" | "bar" | "tri" | "square";
export type Role = "field" | "light" | "accent" | "neutral";
export type Surface = "midnight" | "burgundy";

/** Idle motion after assembly (G3). Speeds are per second. */
export type Idle =
  | { t: "spin"; v: number }
  | { t: "rock"; a: number; sp: number; ph?: number }
  | { t: "bob"; a: number; sp: number; ph?: number }
  | { t: "breathe"; a: number; sp: number }
  | { t: "orbit"; rad: number; sp: number; ph: number }
  | { t: "step"; h: number; sp: number; ph: number }
  | { t: "none" };

export type Piece = {
  k: Kind;
  x: number;
  y: number;
  c: Role;
  /** Radius (disc, ring, half, quarter, star, tri, square's half side). */
  r?: number;
  /** Bar size. */
  w?: number;
  h?: number;
  /** Ring stroke width. */
  sw?: number;
  rot?: number;
  /** Override the default idle for this kind. */
  idle?: Idle;
  /** A ring drawn in segments that fill and empty (Repetite). */
  fill?: { segments: number; ph: number };
  /** A left-anchored bar that lights one line at a time (Marginalia). */
  scan?: { rows: { y: number; w: number }[]; x0: number; perRow: number };
};

export type Composition = { id: string; w: number; h: number; pieces: Piece[] };

/** Colour for a role on a surface. Claret never sits on burgundy (DESIGN.md). */
export function roleColour(role: Role, surface: Surface): string {
  if (surface === "burgundy") {
    return role === "light" || role === "accent" ? color.ivory : color.line;
  }
  return { field: color.burgundy, light: color.ivory, accent: color.claret, neutral: color.line }[role];
}

/** The default idle by kind: stars spin, half discs rock, small discs bob, large discs breathe. */
export function defaultIdle(p: Piece, i: number): Idle {
  if (p.idle) return p.idle;
  const r = p.r ?? 0;
  if (p.k === "star") return { t: "spin", v: i % 2 ? -10 : 12 };
  if (p.k === "half") return { t: "rock", a: 6, sp: 1.2, ph: i };
  if (p.k === "disc" && r <= 40) return { t: "bob", a: 8, sp: 2, ph: i * 0.9 };
  if (p.k === "disc" && r >= 100) return { t: "breathe", a: 0.02, sp: 1 };
  return { t: "none" };
}

const f = (n: number) => n.toFixed(1);

export function starPoints(r: number, n = 8, inner = 0.42): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    pts.push(`${f(Math.cos(a) * rr)},${f(Math.sin(a) * rr)}`);
  }
  return pts.join(" ");
}

export const halfPath = (r: number) => `M${-r} 0A${r} ${r} 0 0 1 ${r} 0Z`;
export const quarterPath = (r: number) => `M${-r / 2} ${r / 2}H${r / 2}A${r} ${r} 0 0 0 ${-r / 2} ${-r / 2}Z`;
export const triPoints = (r: number) => `0,${-r} ${f(r * 0.87)},${f(r / 2)} ${f(-r * 0.87)},${f(r / 2)}`;

/** One segment of a ring, from angle a0 to a1 (radians, 0 at the top). */
export function arcPath(r: number, a0: number, a1: number): string {
  const p = (a: number) => `${f(Math.sin(a) * r)} ${f(-Math.cos(a) * r)}`;
  return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
}

/* ---------------------------------------------------------------------------
   Compositions. Coordinates are in each composition's own viewBox.
   ------------------------------------------------------------------------- */

const repetite: Composition = {
  id: "repetite",
  w: 400,
  h: 400,
  pieces: [
    { k: "ring", r: 150, sw: 22, c: "neutral", x: 200, y: 200 },
    { k: "ring", r: 150, sw: 22, c: "accent", x: 200, y: 200, fill: { segments: 32, ph: 0 } },
    { k: "ring", r: 105, sw: 22, c: "neutral", x: 200, y: 200 },
    { k: "ring", r: 105, sw: 22, c: "light", x: 200, y: 200, fill: { segments: 24, ph: 1.4 } },
    { k: "disc", r: 52, c: "field", x: 200, y: 200, idle: { t: "breathe", a: 0.05, sp: 1.8 } },
    { k: "star", r: 18, c: "light", x: 335, y: 65 },
    { k: "disc", r: 10, c: "accent", x: 62, y: 340 },
    { k: "disc", r: 7, c: "light", x: 95, y: 368 },
    { k: "quarter", r: 60, c: "field", x: 360, y: 360, rot: 180 },
    { k: "bar", w: 90, h: 12, c: "light", x: 60, y: 45, rot: -8 },
    { k: "tri", r: 16, c: "accent", x: 360, y: 290, rot: 10 },
    { k: "square", r: 9, c: "light", x: 22, y: 200, rot: 20 },
  ],
};

const MARGINALIA_ROWS = [300, 260, 300, 220, 280, 300, 180].map((w, i) => ({ w, y: 70 + i * 42 }));
const marginalia: Composition = {
  id: "marginalia",
  w: 400,
  h: 400,
  pieces: [
    ...MARGINALIA_ROWS.map((row): Piece => ({ k: "bar", w: row.w, h: 18, c: "neutral", x: 50 + row.w / 2, y: row.y })),
    {
      k: "bar",
      w: 1,
      h: 18,
      c: "accent",
      x: 50,
      y: MARGINALIA_ROWS[0].y,
      scan: { rows: MARGINALIA_ROWS, x0: 50, perRow: 1.8 },
    },
    { k: "quarter", r: 90, c: "field", x: 345, y: 345, rot: 180 },
    { k: "star", r: 16, c: "light", x: 350, y: 45 },
    { k: "disc", r: 9, c: "light", x: 30, y: 372 },
  ],
};

const trailboard: Composition = {
  id: "trailboard",
  w: 400,
  h: 400,
  pieces: [
    { k: "ring", r: 120, sw: 2, c: "neutral", x: 200, y: 200 },
    { k: "disc", r: 46, c: "field", x: 200, y: 200, idle: { t: "breathe", a: 0.04, sp: 1.4 } },
    { k: "disc", r: 26, c: "light", x: 200, y: 200, idle: { t: "orbit", rad: 120, sp: 0.6, ph: 0 } },
    { k: "disc", r: 20, c: "accent", x: 200, y: 200, idle: { t: "orbit", rad: 120, sp: 0.6, ph: 2.1 } },
    { k: "disc", r: 14, c: "light", x: 200, y: 200, idle: { t: "orbit", rad: 120, sp: 0.6, ph: 4.2 } },
    { k: "square", r: 14, c: "light", x: 350, y: 55, rot: 20, idle: { t: "spin", v: 8 } },
    { k: "ring", r: 40, sw: 6, c: "accent", x: 60, y: 60 },
    { k: "bar", w: 80, h: 10, c: "neutral", x: 60, y: 345 },
    { k: "bar", w: 50, h: 10, c: "neutral", x: 45, y: 365 },
    { k: "star", r: 14, c: "light", x: 345, y: 348 },
    { k: "disc", r: 6, c: "light", x: 205, y: 30 },
  ],
};

const bumpfix: Composition = {
  id: "bumpfix",
  w: 400,
  h: 400,
  pieces: [
    { k: "bar", w: 320, h: 16, c: "neutral", x: 200, y: 345 },
    { k: "bar", w: 80, h: 10, c: "neutral", x: 100, y: 322 },
    { k: "bar", w: 80, h: 10, c: "neutral", x: 200, y: 272 },
    { k: "bar", w: 80, h: 10, c: "neutral", x: 300, y: 222 },
    { k: "tri", r: 40, c: "field", x: 100, y: 290, idle: { t: "step", h: 26, sp: 0.4, ph: 0 } },
    { k: "tri", r: 40, c: "accent", x: 200, y: 240, idle: { t: "step", h: 26, sp: 0.4, ph: 0.33 } },
    { k: "tri", r: 40, c: "light", x: 300, y: 190, idle: { t: "step", h: 26, sp: 0.4, ph: 0.66 } },
    { k: "star", r: 28, c: "light", x: 330, y: 70 },
    { k: "half", r: 50, c: "field", x: 75, y: 110 },
    { k: "disc", r: 8, c: "accent", x: 365, y: 300 },
    { k: "disc", r: 6, c: "light", x: 40, y: 250 },
  ],
};

/** Home closing, right side: wide. */
const closing: Composition = {
  id: "closing",
  w: 1200,
  h: 600,
  pieces: [
    { k: "disc", r: 190, c: "field", x: 720, y: 330 },
    { k: "half", r: 120, c: "light", x: 720, y: 300 },
    { k: "quarter", r: 140, c: "field", x: 220, y: 300 },
    { k: "ring", r: 70, sw: 10, c: "accent", x: 420, y: 170 },
    { k: "star", r: 60, c: "light", x: 1020, y: 150 },
    { k: "tri", r: 50, c: "accent", x: 560, y: 90, rot: 12, idle: { t: "rock", a: 8, sp: 1.6 } },
    { k: "bar", w: 300, h: 26, c: "light", x: 300, y: 470, rot: -8 },
    { k: "bar", w: 220, h: 26, c: "light", x: 280, y: 515, rot: -8 },
    { k: "bar", w: 150, h: 26, c: "accent", x: 320, y: 560, rot: -8 },
    { k: "square", r: 30, c: "light", x: 1000, y: 470, rot: 20, idle: { t: "spin", v: -8 } },
    { k: "disc", r: 22, c: "light", x: 960, y: 330 },
    { k: "disc", r: 14, c: "accent", x: 1040, y: 380 },
    { k: "half", r: 90, c: "field", x: 1060, y: 600, rot: 180 },
    { k: "star", r: 34, c: "accent", x: 150, y: 500 },
  ],
};

/** Contact, right side: tall. */
const contactComp: Composition = {
  id: "contact",
  w: 800,
  h: 900,
  pieces: [
    { k: "disc", r: 230, c: "field", x: 470, y: 560 },
    { k: "quarter", r: 180, c: "light", x: 300, y: 300 },
    { k: "ring", r: 90, sw: 14, c: "accent", x: 610, y: 220 },
    { k: "star", r: 70, c: "light", x: 650, y: 770 },
    { k: "half", r: 110, c: "field", x: 150, y: 790, rot: 180 },
    { k: "bar", w: 300, h: 28, c: "light", x: 300, y: 845, rot: -6 },
    { k: "tri", r: 55, c: "accent", x: 150, y: 140, rot: -10, idle: { t: "rock", a: 8, sp: 1.3 } },
    { k: "square", r: 26, c: "light", x: 700, y: 430, rot: 15, idle: { t: "spin", v: 8 } },
    { k: "disc", r: 24, c: "light", x: 110, y: 470 },
    { k: "disc", r: 14, c: "accent", x: 690, y: 600 },
    { k: "star", r: 30, c: "accent", x: 430, y: 90 },
    { k: "ring", r: 40, sw: 8, c: "light", x: 730, y: 80 },
    { k: "disc", r: 10, c: "light", x: 560, y: 390 },
  ],
};

/** About bio, under the heading: small and wide. */
const bio: Composition = {
  id: "bio",
  w: 800,
  h: 320,
  pieces: [
    { k: "half", r: 130, c: "field", x: 170, y: 310 },
    { k: "disc", r: 34, c: "light", x: 170, y: 225 },
    { k: "ring", r: 50, sw: 8, c: "accent", x: 430, y: 120 },
    { k: "bar", w: 220, h: 18, c: "light", x: 500, y: 250 },
    { k: "bar", w: 150, h: 18, c: "neutral", x: 465, y: 282 },
    { k: "star", r: 30, c: "light", x: 680, y: 90 },
    { k: "tri", r: 28, c: "accent", x: 600, y: 180, idle: { t: "rock", a: 10, sp: 1.5 } },
    { k: "square", r: 16, c: "light", x: 330, y: 45, rot: 20 },
    { k: "disc", r: 10, c: "accent", x: 745, y: 250 },
    { k: "quarter", r: 70, c: "field", x: 765, y: 320, rot: 180 },
  ],
};

/** 404: assembles, then falls apart. */
const lost: Composition = {
  id: "lost",
  w: 800,
  h: 800,
  pieces: [
    { k: "disc", r: 200, c: "field", x: 420, y: 430 },
    { k: "half", r: 140, c: "light", x: 420, y: 330 },
    { k: "square", r: 60, c: "accent", x: 190, y: 200, rot: 15 },
    { k: "star", r: 60, c: "light", x: 640, y: 170 },
    { k: "ring", r: 70, sw: 12, c: "accent", x: 170, y: 570 },
    { k: "bar", w: 260, h: 26, c: "light", x: 560, y: 670, rot: -10 },
    { k: "bar", w: 180, h: 26, c: "accent", x: 540, y: 715, rot: -10 },
    { k: "tri", r: 50, c: "light", x: 310, y: 100, rot: -8 },
    { k: "disc", r: 24, c: "light", x: 690, y: 470 },
    { k: "disc", r: 14, c: "accent", x: 105, y: 350 },
    { k: "quarter", r: 110, c: "field", x: 720, y: 770, rot: 180 },
    { k: "star", r: 26, c: "accent", x: 360, y: 710 },
  ],
};

export const compositions = { repetite, marginalia, trailboard, bumpfix, closing, contact: contactComp, bio, lost } as const;
export type CompositionId = keyof typeof compositions;

/** The composition for a project slug, if it has one. */
export const projectComposition = (slug: string): Composition | null =>
  slug in compositions ? compositions[slug as CompositionId] : null;

/** G4 page mark: the shape for each page. */
export const pageMarks: { match: (path: string) => boolean; kind: Kind }[] = [
  { match: (p) => p === "/", kind: "disc" },
  { match: (p) => p === "/work" || p.startsWith("/work/"), kind: "half" },
  { match: (p) => p === "/about", kind: "quarter" },
  { match: (p) => p === "/lab", kind: "star" },
  { match: (p) => p === "/contact", kind: "square" },
];
