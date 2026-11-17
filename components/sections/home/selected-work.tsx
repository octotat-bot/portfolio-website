"use client";

// Home 5: selected work as a sticky deck (M31), on desktop and phones.
// The headline and the note, then one poster card per project (from
// content/projects.ts, in that order), each pinned by native sticky
// positioning: card i sticks at the nav band plus i steps, so every earlier
// card keeps a strip with its index, title and year, like a stack of posters.
//
// Each project gets one screen of scroll (a zero-height marker, the sticky
// card, then a spacer). The cards are siblings inside the deck, so each stays
// pinned until the deck ends; their bottom margins line their release up, so
// after the last card pins and the deck holds for 40dvh, they all leave
// together.
//
// While the next card travels in (Motion's page scroll against each card's
// measured start), the card
// under it scales to 0.94 from its top centre and a midnight shade rises over
// its body (not its strip). Once covered, it turns to its resting tilt over
// dur-pop, ease-pop: alternating minus and plus; the top card stays straight.
// The strip's text is centred, where the tilts move it least, so it stays
// readable between tilted neighbours.
//
// The whole card is one link, so a buried strip is clickable too. Only the top
// card's shapes (G1-G3) move, and only it answers hover: the arrow nudges and
// the title gets an underline. No scroll-jacking, no snap.
// Reduced motion: the same sticky stacking, without scale, tilt or shade.

import { animate, frame, motion, motionValue, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DitherField } from "@/components/motion/dither-field";
import { DitherImage } from "@/components/motion/dither-image";
import { NavFade } from "@/components/motion/nav-fade";
import { RevealText } from "@/components/motion/reveal-text";
import { ShapeComposition } from "@/components/motion/shape-composition";
import { TransitionLink } from "@/components/shell/wipe";
import { Note } from "@/components/ui/note";
import { home } from "@/content/pages";
import { MD_QUERY, useMedia, useReduced } from "@/lib/hooks";
import { deck, dur, ease, navFade } from "@/lib/motion";
import { projectComposition } from "@/lib/shapes";
import { tokens } from "@/lib/tokens";

export type HomeTile = {
  slug: string;
  name: string;
  kind: string;
  year: string | null;
  oneLiner: string;
  cover: string | null;
};

const NAV_BAND = Number.parseFloat(tokens.size.tokens.find((t) => t.name === "nav-band")?.value ?? "");
if (Number.isNaN(NAV_BAND)) throw new Error('tokens: size "nav-band" is missing');
const pad = (n: number) => String(n).padStart(2, "0");

function DeckCard({
  tile,
  index,
  active,
  shade,
  reduced,
}: {
  tile: HomeTile;
  index: number;
  active: boolean;
  shade: MotionValue<number>;
  reduced: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const on = active && (hover || focus);
  // Alternate midnight-raised and burgundy-deep. On burgundy-deep all text is
  // ivory and the shapes use the burgundy surface (no claret on burgundy).
  const raised = index % 2 === 0;
  const quiet = raised ? "text-ash" : "text-ivory";
  const comp = tile.cover ? null : projectComposition(tile.slug);

  return (
    <TransitionLink
      href={`/work/${tile.slug}`}
      className={`relative flex h-full flex-col border border-line ${raised ? "bg-midnight-raised" : "bg-burgundy-deep"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      {/* The strip: what stays visible once the card is buried. */}
      <span className={`deck-strip label flex shrink-0 items-center justify-center gap-4 ${quiet}`}>
        <span>{pad(index + 1)}</span>
        <span>{tile.name}</span>
        {tile.year ? <span>{tile.year}</span> : null}
      </span>

      <span className="relative flex min-h-0 flex-1 flex-col gap-6 border-t border-line p-4 md:grid md:grid-cols-2 md:gap-10 md:p-10">
        <span className="flex flex-col gap-4 md:justify-between">
          <span className="flex flex-col gap-4">
            <span className={`label ${quiet}`}>{tile.kind}</span>
            <span
              className={`poster-2 block text-ivory underline-offset-8 ${on ? "underline" : ""} ${raised ? "decoration-claret" : "decoration-ivory"}`}
              style={{ textDecorationThickness: "4px" }}
            >
              {tile.name}
            </span>
            <span className="lede block max-w-measure text-ivory">{tile.oneLiner}</span>
          </span>
          <span className="label flex items-center gap-2 text-ivory">
            View project
            <motion.span
              aria-hidden="true"
              className="inline-block"
              animate={{ x: on ? deck.nudge : 0 }}
              transition={{ duration: dur.fast, ease: ease.out }}
            >
              →
            </motion.span>
          </span>
        </span>
        <span className="relative block min-h-0 flex-1 md:h-full">
          {comp ? (
            <ShapeComposition comp={comp} surface={raised ? "midnight" : "burgundy"} push paused={!active} className="absolute inset-0" />
          ) : (
            <DitherField still seed={index} className="absolute inset-0 block">
              {tile.cover ? <DitherImage src={tile.cover} alt="" resolved={on} back="burgundy-deep" sizes="(min-width: 810px) 45vw, 90vw" /> : null}
            </DitherField>
          )}
        </span>

        {/* The shade over a card being covered: its body only, so the strip stays readable. */}
        {reduced ? null : (
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-midnight" style={{ opacity: shade }} />
        )}
      </span>
    </TransitionLink>
  );
}

function DeckSlot({
  tile,
  index,
  count,
  arrivals,
  marker,
  card,
  active,
  tilt,
  reduced,
}: {
  tile: HomeTile;
  index: number;
  count: number;
  arrivals: MotionValue<number>[];
  marker: (el: HTMLDivElement | null) => void;
  card: (el: HTMLDivElement | null) => void;
  active: boolean;
  tilt: number;
  reduced: boolean;
}) {

  // How far the next card has come over this one.
  const none = useMotionValue(0);
  const next = arrivals[index + 1] ?? none;
  const scale = useTransform(next, [0, 1], [1, deck.scale]);
  const shade = useTransform(next, [0, 1], [0, deck.shade]);
  const rotate = useMotionValue(0);
  useEffect(() => {
    if (reduced || index === count - 1) return;
    let buried: boolean | null = null;
    const check = (v: number) => {
      const now = v >= 0.99;
      if (now === buried) return;
      buried = now;
      animate(rotate, now ? tilt : 0, { duration: deck.tiltDuration, ease: deck.tiltEase });
    };
    check(next.get());
    return next.on("change", check);
  }, [next, reduced, index, count, tilt, rotate]);

  const left = count - 1 - index;
  return (
    <>
      <div ref={marker} aria-hidden="true" className="h-0" />
      <motion.div
        ref={card}
        className="deck-card sticky"
        style={{
          top: `calc(var(--spacing-nav-band) + ${index} * var(--deck-step))`,
          // Every card's margin box ends at the same place, so they release together.
          marginBottom: `calc(${left} * var(--deck-step))`,
        }}
      >
        <motion.div className="h-full origin-top" style={reduced ? undefined : { scale, rotate }}>
          <DeckCard tile={tile} index={index} active={active} shade={shade} reduced={reduced} />
        </motion.div>
      </motion.div>
      <div
        aria-hidden="true"
        style={{
          height:
            left === 0
              ? "var(--deck-hold)"
              : `calc(var(--deck-slot) - var(--deck-card) - ${left} * var(--deck-step))`,
        }}
      />
    </>
  );
}

export function SelectedWork({ tiles }: { tiles: HomeTile[] }) {
  const reduced = useReduced();
  const desktop = useMedia(MD_QUERY);
  const step = desktop ? deck.step.md : deck.step.sm;
  const tiltBy = desktop ? deck.tilt.md : deck.tilt.sm;
  const { headline, note } = home.selectedWork;

  // One arrival value per card: 0 when its top enters at the bottom of the
  // screen, 1 when it pins. Shared, so each card can follow the one after it.
  // Worked out from the page scroll and each card's start (a zero-height
  // marker, measured on mount and whenever the page changes size), so a
  // scroll frame does no layout reads.
  const arrivals = useMemo(() => tiles.map(() => motionValue(0)), [tiles]);
  const markers = useRef<(HTMLDivElement | null)[]>([]);
  const starts = useRef<number[]>([]);
  const { scrollY } = useScroll();
  const update = () => {
    const y = scrollY.get();
    const h = window.innerHeight;
    starts.current.forEach((start, i) => {
      const pin = NAV_BAND + i * step;
      arrivals[i].set(Math.min(1, Math.max(0, (y - (start - h)) / Math.max(1, h - pin))));
    });
  };
  // Keep the nav clear once the deck has released: the whole deck fades as
  // one layer (so no card turns see-through over the ones under it) while the
  // top card rises from its pin to the end of the nav zone. While anything is
  // pinned, nothing fades.
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const leave = useMotionValue(1);
  const clearNav = () => {
    const last = cards.current[cards.current.length - 1];
    if (!last) return;
    const pin = NAV_BAND + (tiles.length - 1) * step;
    const top = last.getBoundingClientRect().top;
    leave.set(Math.min(1, Math.max(0, (top - navFade.end) / Math.max(1, pin - navFade.end))));
  };
  useMotionValueEvent(scrollY, "change", () => {
    update();
    frame.postRender(clearNav);
  });
  useEffect(() => {
    const measure = () => {
      starts.current = markers.current.map((m) => (m ? m.getBoundingClientRect().top + window.scrollY : 0));
      update();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, arrivals]);
  // The top card: the last one at least `activeAt` of the way in. Only it moves.
  const [active, setActive] = useState(0);
  useEffect(() => {
    const update = () => {
      let top = 0;
      arrivals.forEach((a, i) => {
        if (a.get() >= deck.activeAt) top = i;
      });
      setActive(top);
    };
    update();
    const offs = arrivals.map((a) => a.on("change", update));
    return () => offs.forEach((off) => off());
  }, [arrivals]);

  const vars = {
    "--deck-step-sm": `${deck.step.sm}px`,
    "--deck-step-md": `${deck.step.md}px`,
    "--deck-card-sm": deck.card.sm,
    "--deck-card-md": deck.card.md,
    "--deck-slot": deck.slot,
    "--deck-hold": deck.hold,
  } as CSSProperties;

  return (
    <section className="deck overflow-x-clip px-4 pt-32 md:px-10" style={vars}>
      <NavFade className="flex flex-col gap-10 pb-16">
        <RevealText as="h2" text={headline} className="poster-1" />
        <Note text={note} tilt={4} />
      </NavFade>
      <motion.div style={{ opacity: leave }}>
        {tiles.map((tile, i) => (
          <DeckSlot
            key={tile.slug}
            tile={tile}
            index={i}
            count={tiles.length}
            arrivals={arrivals}
            marker={(el) => {
              markers.current[i] = el;
            }}
            card={(el) => {
              cards.current[i] = el;
            }}
            active={i === active}
            tilt={tiltBy * (i % 2 === 0 ? -1 : 1)}
            reduced={reduced}
          />
        ))}
      </motion.div>
    </section>
  );
}
