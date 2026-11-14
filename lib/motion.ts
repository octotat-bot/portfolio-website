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
