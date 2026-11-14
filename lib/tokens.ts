import raw from "@/docs/tokens.json";

// Typed access to docs/tokens.json for code that cannot use a class name:
// Motion transitions, the shaders, the styleguide.

export const tokens = raw;

export type TypeStyle = (typeof raw.type.groups)[number]["styles"][number];
export type Bezier = [number, number, number, number];

const bezier = (name: string): Bezier => {
  const value = raw.easing.tokens.find((t) => t.name === name)?.value;
  const parts = value?.match(/-?\d*\.?\d+/g)?.map(Number);
  if (!parts || parts.length !== 4) throw new Error(`tokens: easing "${name}" is not a cubic-bezier`);
  return parts as Bezier;
};

const seconds = (name: string): number => {
  const value = raw.duration.tokens.find((t) => t.name === name)?.value;
  if (!value?.endsWith("ms")) throw new Error(`tokens: duration "${name}" is not in ms`);
  return Number.parseFloat(value) / 1000;
};

const colour = (name: string): string => {
  const value = raw.color.tokens.find((t) => t.name === name)?.value;
  if (!value) throw new Error(`tokens: colour "${name}" does not exist`);
  return value;
};

/** Easing curves as Motion expects them. */
export const ease = {
  out: bezier("ease-out"),
  pop: bezier("ease-pop"),
  inOut: bezier("ease-in-out"),
} as const;

/** Durations in seconds, as Motion expects them. */
export const dur = {
  fast: seconds("dur-fast"),
  roll: seconds("dur-roll"),
  pop: seconds("dur-pop"),
  page: seconds("dur-page"),
  staggerLetter: seconds("stagger-letter"),
} as const;

const length = (group: { tokens: { name: string; value: string }[] }, name: string): string => {
  const value = group.tokens.find((t) => t.name === name)?.value;
  if (!value) throw new Error(`tokens: "${name}" does not exist`);
  return value;
};

/** Breakpoints for media queries in code. */
export const breakpoint = {
  md: length(raw.breakpoint, "md"),
  lg: length(raw.breakpoint, "lg"),
} as const;

/** Colour values for canvases and shaders, which cannot read CSS variables. */
export const color = {
  midnight: colour("midnight"),
  midnightRaised: colour("midnight-raised"),
  line: colour("line"),
  burgundy: colour("burgundy"),
  burgundyDeep: colour("burgundy-deep"),
  claret: colour("claret"),
  ivory: colour("ivory"),
  ash: colour("ash"),
} as const;
