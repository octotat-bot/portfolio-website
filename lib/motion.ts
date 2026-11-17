import { color, dur, ease } from "./tokens";

// Pattern-specific values from docs/MOTION.md, keyed by pattern ID. Shared
// timings and curves come from tokens.json (via lib/tokens.ts); the numbers
// here are the ones MOTION.md gives for a single pattern.

export { dur, ease };

/** Default spring for anything that follows the pointer or scroll. */
export const spring = { stiffness: 140, damping: 30, mass: 0.5 } as const;

/** One loader frame: a word (index into site.intro.words) or a photo (into site.intro.photos). */
export type IntroFrame = {
  kind: "word" | "photo";
  i: number;
  ms: number;
  /** full: the word fills the screen. flip: mirrored. invert: colours swapped. */
  fx?: "full" | "flip" | "invert";
};

const f = (kind: IntroFrame["kind"], i: number, ms: number, fx?: IntroFrame["fx"]): IntroFrame => ({ kind, i, ms, fx });

/**
 * M01 loader, on every full page load. 31 hard-cut frames, 3.53s, each shown
 * by a scheduled timeout: words (NEED, MONEY, FOR, FERRARI.) and photos
 * (1 to 4) alternating, slowing to a held FERRARI. that fills the screen
 * (frame 7, ending at `shutter.from`), then a fast loop of 60ms frames with
 * some mirrored or inverted. The shutter bars stay open until `shutter.from`
 * and then close in one move (half a cosine) until `shutter.to`, so the fast
 * loop plays in a shrinking slit. At `shutter.to` the bars are shut and the
 * frame goes; `hold` later they part (`split`, ease-in-out) to show the page.
 *
 * Word size: the smaller of `word.width` of the screen width or a cap height
 * of `word.cap` of its height; the full frame fills the screen edge to edge.
 * Photos: a cover crop anchored at each photo's focal point, with grain at a
 * random offset on every frame. Pictures and the font must be ready within
 * `ready` seconds, or it starts anyway. `safety`: everything is released
 * after this long whatever happens. Reduced motion: only the last frame, the
 * bars at `reduced.bars`, held `reduced.hold`, then faded out over
 * `reduced.fade`.
 */
export const intro = {
  frames: [
    f("word", 0, 420),
    f("photo", 0, 360),
    f("word", 1, 310),
    f("photo", 1, 270),
    f("word", 2, 230),
    f("photo", 2, 200),
    f("word", 3, 190, "full"),
    f("photo", 3, 110),
    f("word", 0, 90),
    f("photo", 0, 80, "flip"),
    f("word", 1, 70),
    f("photo", 1, 60),
    f("word", 2, 60, "invert"),
    f("photo", 2, 60),
    f("word", 3, 60),
    f("photo", 3, 60, "flip"),
    f("word", 0, 60),
    f("photo", 0, 60, "invert"),
    f("word", 1, 60, "invert"),
    f("photo", 1, 60),
    f("word", 2, 60),
    f("photo", 2, 60, "invert"),
    f("word", 3, 60, "invert"),
    f("photo", 3, 60),
    f("word", 0, 60),
    f("photo", 0, 60),
    f("word", 1, 60),
    f("photo", 1, 60, "flip"),
    f("word", 2, 60),
    f("photo", 2, 60),
    f("word", 3, 60, "invert"),
  ] as IntroFrame[],
  word: { width: 0.9, cap: 0.76 },
  shutter: { from: 1.98, to: 3.53 },
  hold: 0.12,
  split: 0.9,
  ready: 1.5,
  safety: 15,
  grain: 256,
  reduced: { bars: 0.24, hold: 1.4, fade: 0.4 },
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
 * M31 rising pile: Home selected work. The section is (projects + `screens`)
 * screens tall; a stage pins for all but the last of them, with the headline
 * centred behind the cards. Section progress 0 to `start`: the headline alone.
 * From `start` to `end`, each card rises from `from` (in dvh below its spot)
 * to its resting spot in its own window; the windows are spread evenly and
 * overlap by `overlap`, so the next card starts while the last one settles.
 * `ease-out`; the card turns from 0 to its tilt as it rises. From `end` to
 * 1 everything holds, then the section scrolls away.
 *
 * Desktop: one centred row; each card overlaps the one before by `rowOverlap`
 * of its width, and the cards are as wide as that lets the row fill the
 * content width (about 400px at 1440), but never so tall that the pile leaves
 * the screen. Tilted `tilts`, dropped `drops` px at a 1440px-wide screen
 * (scaled with the width). Phones: the original
 * full-width tiles, one column, offset `phone.offset` vw left and right,
 * tilted `phone.tilt`, overlapped as deeply as it takes for the pile to fit
 * one screen between the nav band and `phone.bottom` px from the bottom.
 * Hover or focus: the card comes to the top, turns to 0 and scales to
 * `hover.scale`, dur-fast, ease-pop.
 */
export const pile = {
  screens: { sm: 1, md: 1.5 },
  start: 0.12,
  end: 0.8,
  overlap: 0.3,
  from: 110,
  ease: ease.out,
  tilts: [-3, 1, -2, 4],
  drops: [0, 96, 40, 64],
  dropBase: 1440,
  rowOverlap: 0.2,
  phone: { tilt: 2, offset: 8, bottom: 24 },
  hover: { scale: 1.03, duration: dur.fast, ease: ease.pop },
} as const;

/** M12 blur focus. */
export const blurFocus = { maxBlur: 7, minOpacity: 0.3 } as const;

/** M14 tile hop. */
export const tileHop = { lift: 10, duration: dur.pop, ease: ease.pop } as const;

/** M19 count up. */
export const countUp = { duration: 1.4, ease: ease.out } as const;

/** M20 ticker. */
export const ticker = { speed: 60 } as const;

/**
 * M32 footer flip line (the ghost marquee): a split-flap board. When it first
 * comes into view the letters flip in one after another (`enter`), from
 * edge-on; while it shows, a random letter flips over every `idle` seconds;
 * on desktop a letter flips as it passes under the pointer (`flip`); and the
 * whole line leans with scroll speed, up to `skew` degrees at `skewAt` px/s.
 */
export const flipLine = {
  enter: { stagger: 0.035, duration: 0.5 },
  flip: 0.6,
  idle: 1.2,
  skew: 10,
  skewAt: 2000,
  perspective: 800,
} as const;

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

/**
 * M21 menu portrait (desktop). After the circle reveal and the links:
 * the portrait scans in top to bottom over `scanIn`, then the page's shapes
 * fly in (`flight`, `stagger` apart). Changing link: the old shapes scatter
 * over `scatter` while the new ones assemble from `swapDelay` (`swapFlight`,
 * `swapStagger` apart), and the portrait re-dithers with a `rescan` scan.
 * The portrait leans at most `lean` px toward the pointer; the lens rings
 * pulse `pulse` in scale every `pulsePeriod` seconds and are `ringSize`% of
 * the portrait's width across. Closing: shapes scatter and the portrait
 * fades over `closeOut`, then the circle closes.
 */
export const menuPortrait = {
  scanIn: 0.5,
  flight: 0.45,
  stagger: 0.025,
  scatter: 0.2,
  swapDelay: 0.12,
  swapFlight: 0.26,
  swapStagger: 0.012,
  rescan: 0.4,
  lean: 8,
  pulse: 0.04,
  pulsePeriod: 2,
  ringSize: 11,
  closeOut: 0.2,
} as const;
