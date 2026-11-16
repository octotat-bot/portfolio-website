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
 * M13 pinned title with drifting tiles, from 810px (phones use the card
 * stack). The section is 250vh; tiles start below the screen at different x
 * positions and rise at 0.8x to 1.4x.
 *
 * Timing: tile i's top passes the middle of the screen at `cross` of the
 * pin (25%, 45%, 65%, 85%). Its start is worked out from that and its speed,
 * so each spends about a fifth of the pin over the headline and at most two
 * are over it at once. Starts are in vh below the top of the screen.
 * Width: 16vw, never narrower than the longest project name needs.
 */
const DRIFT_TRAVEL = 260;
/** Where a tile's top sits when it is centred on the headline, in vh. */
const DRIFT_CENTRE = 35;
const driftTile = (xMd: string, speed: number, cross: number) => ({
  xMd,
  speed,
  start: Math.round(DRIFT_CENTRE + cross * DRIFT_TRAVEL * speed),
});

export const driftTiles = {
  height: "250vh",
  travel: DRIFT_TRAVEL,
  tiles: [driftTile("10%", 1.0, 0.25), driftTile("62%", 1.4, 0.45), driftTile("30%", 0.8, 0.65), driftTile("76%", 1.2, 0.85)],
  widthMd: "max(16vw, 210px)",
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

/**
 * Nav zone: a tile, card or image fades out as it scrolls into the top 120px,
 * gone by the bottom of the nav, so nothing passes under the nav name or the
 * menu button. In px from the top of the screen.
 */
export const navFade = { start: 120, end: 56 } as const;

/** M27 card stack: where cards stick (below the nav zone) and how small the one beneath gets. */
export const cardStack = { top: 136, scale: 0.92 } as const;

/** M16 word wall: px of sideways drift per px scrolled. */
export const wordWall = { drift: 0.25 } as const;

/** M30 image cursor trail. */
export const cursorTrail = {
  /** A new picture each time the pointer has travelled this far, px. */
  step: 80,
  width: 160,
  /** How long each picture stays after landing, s. */
  stay: 0.6,
  max: 5,
  from: 0.9,
  out: 0.85,
  /** At least this many covers before the trail runs. */
  minCovers: 2,
} as const;

/** M28 screen gallery: how far each column travels across the section, as a share of the screen height. */
export const gallery = { columns: [0.35, -0.25, 0.5] } as const;

/** M15 in case studies: a picture resolves once this much of it is in view. */
export const resolveAt = 0.6;

/** M17 year strip: the section pins for 300vh; each card is this wide on desktop. */
export const yearStrip = { height: "300vh", cardWidth: 56, dim: 0.4 } as const;

/** M18 skill pile. */
export const skillPile = {
  /** Start when this much of the area is in view. */
  startAt: 0.3,
  gravity: 1.4,
  bounciness: 0.3,
  /** Seconds between words leaving the top. */
  stagger: 0.12,
  /** How hard a fast pointer pushes the words. */
  push: 0.5,
  /** Fixed physics step, ms. */
  step: 1000 / 120,
} as const;

/** Lab shelf: each card's resting tilt, in degrees, by position. */
export const shelfTilts = [-2, 1.5, -1, 2, -1.5, 1] as const;

/**
 * M24 perspective credits. The section pins for `height`. The credits sit on
 * a plane leaning back `tilt` degrees from the bottom of the screen; across
 * the pin up to `crawlEnd` they travel from below the screen, up the plane
 * and away into the distance (`beyond` extra screen heights past their own
 * length). A line fades in over the bottom `edge` of the screen and fades
 * out as it recedes: fully drawn at `fadeTo` of its real height, gone at
 * `fadeFrom`. Opacity only. The note types at `noteAt`.
 */
export const credits = {
  height: "300vh",
  tilt: 50,
  perspective: 700,
  crawlEnd: 0.8,
  beyond: 1.2,
  edge: 0.18,
  fadeFrom: 0.3,
  fadeTo: 0.55,
  noteAt: 0.82,
} as const;

/**
 * Shader budget. Dither patterns are 3px blocks, so 1x pixel density is
 * enough; the cap keeps a large screen from drawing more than this many pixels.
 */
export const shaderBudget = { pixelRatio: 1, maxPixels: 1920 * 1080 } as const;

/**
 * Poster shapes (DESIGN.md "Shapes", MOTION.md G1 to G4).
 * G1 assemble: each shape flies in from outside its box over `flight`
 * seconds, `stagger` apart, ease-out, once `startAt` of the box is in view.
 * G2 push: within `reach` px of a fine pointer a shape moves away, up to
 * `push` px, on the default spring.
 * G3 idle loops run after assembly (speeds live in lib/shapes.ts).
 * 404: after `holdBeforeFall` seconds assembled, shapes fall out of the box.
 * G4 page mark: `markSize` px, swapped during the wipe in `markSwap` seconds.
 */
export const shapes = {
  startAt: 0.35,
  flight: 0.9,
  stagger: 0.045,
  reach: 240,
  push: 110,
  holdBeforeFall: 1,
  fallStagger: 0.05,
  gravity: 2600,
  markSize: 20,
  markSwap: 0.45,
} as const;

/**
 * M26 statement in two beats. The section is `height` tall and pinned; these
 * are shares of the pinned scroll. Beat 2's words rise over `rise`, then a
 * burgundy bar sweeps behind each word in turn over `check`. At `snapAt` the
 * crooked block in the composition snaps true; at `noteAt` the note types.
 */
export const statementBeats = {
  height: "280vh",
  rise: [0.08, 0.3],
  check: [0.36, 0.78],
  snapAt: 0.8,
  noteAt: 0.86,
} as const;
