import { color, dur, ease } from "./tokens";

// Pattern-specific values from docs/MOTION.md, keyed by pattern ID. Shared
// timings and curves come from tokens.json (via lib/tokens.ts); the numbers
// here are the ones MOTION.md gives for a single pattern.

export { dur, ease };

/** Default spring for anything that follows the pointer or scroll. */
export const spring = { stiffness: 140, damping: 30, mass: 0.5 } as const;

/** M01 intro counter. */
export const intro = {
  /** Session flag: the intro runs once per session. */
  storageKey: "mm-intro-seen",
  /** The counter takes at least this long, longer if fonts are still loading. */
  minDuration: 1.6,
} as const;

/** M02 burgundy stairs wipe. */
export const wipe = {
  columns: 5,
  stagger: 0.06,
  duration: dur.page,
  ease: ease.inOut,
} as const;

/**
 * M03 line reveal. MOTION.md says 110%. The mask has 0.12em of padding so
 * tall glyphs are not cut, and Anton reaches past its 0.9 line height, so
 * words start at 135% to sit fully below the mask.
 */
export const lineReveal = { from: "135%", stagger: 0.06, duration: dur.roll, ease: ease.out } as const;

/** M04 font shuffle. */
export const fontShuffle = { interval: 0.07, settle: 0.9 } as const;

/** M05 scramble label. */
export const scramble = {
  duration: 0.6,
  /** How often the unresolved characters change. */
  step: 0.04,
  pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
} as const;

/** M06 letter roll. */
export const letterRoll = { duration: dur.roll, ease: ease.out, stagger: dur.staggerLetter } as const;

/** M10 typed note. */
export const typedNote = { perChar: 0.035 } as const;

/** M09 hero lift-off: over the first screen of scroll. */
export const heroLift = { scale: 1.35, rise: -20, fadeBy: 0.8, clipSteps: 8 } as const;

/** Home status line: one line every three seconds. */
export const statusCycle = 3;

/** M26 scroll-built statement. Letters start scattered and are in place by the middle. */
export const statement = { offset: 40, rotate: 25, opacity: 0.3 } as const;

/**
 * M13 pinned title with drifting tiles. The section is 250vh; tiles start
 * below the screen at different x positions and rise at 0.8x to 1.4x.
 * x and width are CSS lengths for phones and for md up; start is in vh
 * below the top of the screen; speed multiplies the shared travel.
 */
export const driftTiles = {
  height: "250vh",
  /**
   * Phones: narrower tiles, timed so each crosses the middle of the screen in
   * turn (at about 25%, 45%, 65% and 85% of the pin), about two on screen at once.
   */
  travel: 260,
  travelMd: 220,
  tiles: [
    { x: "4%", xMd: "8%", start: 100, startMd: 100, speed: 1.0 },
    { x: "46%", xMd: "58%", start: 195, startMd: 135, speed: 1.4 },
    { x: "4%", xMd: "30%", start: 170, startMd: 115, speed: 0.8 },
    { x: "46%", xMd: "74%", start: 300, startMd: 155, speed: 1.2 },
  ],
  width: "50vw",
  widthMd: "20vw",
} as const;

/** M12 blur focus. */
export const blurFocus = { maxBlur: 7, minOpacity: 0.3 } as const;

/** M14 tile hop. */
export const tileHop = { lift: 10, duration: dur.pop, ease: ease.pop } as const;

/** M19 count up. */
export const countUp = { duration: 1.4, ease: ease.out } as const;

/** M20 ticker. */
export const ticker = { speed: 60 } as const;

/** M21 takeover menu. */
export const menu = {
  open: { duration: dur.page, ease: ease.inOut },
  close: { duration: dur.roll, ease: ease.inOut },
  linksDelay: 0.2,
  linkStagger: 0.08,
  linkFrom: 160,
  dim: 0.35,
  fadeOut: 0.15,
} as const;

/** M23 floating contact pill. */
export const pill = { lean: 12, reach: 120, hoverScale: 1.06 } as const;

/** M08 dither field. */
export const dither = {
  colorBack: color.midnight,
  colorFront: color.burgundy,
  type: "4x4",
  size: 3,
  speed: 0.25,
  /**
   * Lifts the wave so the field reads as burgundy with a dithered crest near
   * the top, rather than half midnight. Chosen by eye from a side-by-side.
   */
  lift: -0.4,
  /** How far the hero field's centre drifts toward the pointer, as a fraction. */
  drift: 0.06,
  /** The frame shown when the field is still. */
  stillFrame: 4000,
} as const;
