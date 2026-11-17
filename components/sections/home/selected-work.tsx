"use client";

// Home 5: selected work as a rising pile (M31), desktop and phones.
// The section is (projects + 1.5) screens tall on desktop, (projects + 1) on
// phones. Inside it a stage pins (native sticky, top 0, one screen) with the
// headline and the note centred behind the cards. Driven by Motion useScroll
// on the section:
//   0 to 0.12  the headline alone;
//   0.12 to 0.8  each card rises from 110dvh below to its spot in its own
//                window (spread evenly, overlapping by 30%), ease-out, turning
//                from 0 to its tilt;
//   0.8 to 1  everything holds, then the section scrolls away.
// Transform only. Each card's shapes (G1, G3) wait to assemble until it has
// landed, and stop when the section is off screen.
//
// The cards are the original ProjectTiles at their original sizes (16vw, at
// least 210px, on desktop; the content width on phones). Desktop: one centred
// row, each overlapping the one before by 30%, tilted -3, 1, -2, 4deg and
// dropped 0, 96, 40, 64px (at 1440, scaled with the width). Phones: one
// column, offset 8vw left and right, tilted -2 and 2deg, overlapping as deeply
// as it takes to fit one screen. Each new card lands on top.
//
// Hover or focus: the card comes to the top, turns to 0 and scales to 1.03
// (dur-fast, ease-pop), and goes back on leave. The whole card links to its
// project. As the section leaves, the stage fades at the nav line.
// Reduced motion: no pin, no rise; the cards sit in their finished pile.

import { animate, cubicBezier, frame, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { RevealText } from "@/components/motion/reveal-text";
import { Note } from "@/components/ui/note";
import { ProjectTile } from "@/components/ui/project-tile";
import { home } from "@/content/pages";
import { MD_QUERY, useMedia, useReduced } from "@/lib/hooks";
import { navFade, pile } from "@/lib/motion";
import { tokens } from "@/lib/tokens";

export type HomeTile = { slug: string; name: string; caption: string; cover: string | null };

const NAV_BAND = Number.parseFloat(tokens.size.tokens.find((t) => t.name === "nav-band")?.value ?? "");
if (Number.isNaN(NAV_BAND)) throw new Error('tokens: size "nav-band" is missing');
const riseEase = cubicBezier(...pile.ease);

type Spot = { x: number; y: number };

/** Each card's window in section progress: spread from `start` to `end`, overlapping by `overlap`. */
function windows(n: number) {
  const span = pile.end - pile.start;
  const length = span / (1 + (1 - pile.overlap) * Math.max(0, n - 1));
  return Array.from({ length: n }, (_, i) => {
    const from = pile.start + i * length * (1 - pile.overlap);
    return { from, to: from + length };
  });
}

function PileCard({
  tile,
  index,
  spot,
  tilt,
  window: w,
  progress,
  reduced,
  measure,
}: {
  tile: HomeTile;
  index: number;
  spot: Spot | null;
  tilt: number;
  window: { from: number; to: number };
  progress: MotionValue<number>;
  reduced: boolean;
  measure: (el: HTMLDivElement | null) => void;
}) {
  // 0 waiting below, 1 landed.
  const rise = useTransform(progress, (p) => (reduced ? 1 : riseEase(Math.min(1, Math.max(0, (p - w.from) / (w.to - w.from))))));
  // 0 resting, 1 lifted by hover or focus.
  const lift = useMotionValue(0);
  const y = useTransform(rise, (r) => `${(1 - r) * pile.from}dvh`);
  const rotate = useTransform([rise, lift] as MotionValue<number>[], ([r, l]: number[]) => tilt * r * (1 - l));
  const scale = useTransform(lift, (l) => 1 + (pile.hover.scale - 1) * l);

  const [up, setUp] = useState(false);
  // Only re-renders when it lands or lifts off again, not per frame.
  const [landed, setLanded] = useState(reduced);
  const landedRef = useRef(landed);
  const settle = (r: number) => {
    const now = r >= 1;
    if (now === landedRef.current) return;
    landedRef.current = now;
    setLanded(now);
  };
  useMotionValueEvent(rise, "change", settle);
  useEffect(() => settle(rise.get()), [rise]);

  const hover = (on: boolean) => {
    setUp(on);
    animate(lift, on ? 1 : 0, reduced ? { duration: 0 } : { duration: pile.hover.duration, ease: pile.hover.ease });
  };

  return (
    <motion.div
      ref={measure}
      className="pile-card absolute left-0 top-0"
      style={{
        x: spot?.x ?? 0,
        top: spot?.y ?? 0,
        y,
        rotate,
        scale,
        zIndex: up ? 50 : index + 1,
        visibility: spot ? "visible" : "hidden",
      }}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
    >
      <ProjectTile
        href={`/work/${tile.slug}`}
        name={tile.name}
        caption={tile.caption}
        cover={tile.cover}
        index={index}
        tilt={0}
        hop={false}
        paused={!landed}
        sizes="(min-width: 810px) 16vw, 90vw"
      />
    </motion.div>
  );
}

export function SelectedWork({ tiles }: { tiles: HomeTile[] }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const desktop = useMedia(MD_QUERY);
  const { headline, note } = home.selectedWork;
  const n = tiles.length;
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const spans = windows(n);
  const tilts = tiles.map((_, i) =>
    desktop ? pile.tilts[i % pile.tilts.length] : (i % 2 === 0 ? -1 : 1) * pile.phone.tilt,
  );

  // Resting spots, worked out from the stage size and each card's real height
  // (on mount and whenever the stage changes size), not per frame.
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [spots, setSpots] = useState<Spot[] | null>(null);
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const place = () => {
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const wide = window.matchMedia(MD_QUERY).matches;
      const gutter = Number.parseFloat(getComputedStyle(el).getPropertyValue("--spacing-gutter")) || 16;
      const sizes = cards.current.map((c) => ({ w: c?.offsetWidth ?? 0, h: c?.offsetHeight ?? 0 }));
      if (!sizes.length || !sizes[0].w) return;
      if (wide) {
        const w = sizes[0].w;
        const step = w * (1 - pile.rowOverlap);
        const row = w + step * (n - 1);
        const left = (vw - row) / 2;
        const drops = sizes.map((_, i) => (pile.drops[i % pile.drops.length] * vw) / pile.dropBase);
        const tall = Math.max(...sizes.map((s, i) => s.h + drops[i]));
        const top = Math.max(NAV_BAND, (vh - tall) / 2);
        setSpots(sizes.map((_, i) => ({ x: left + i * step, y: top + drops[i] })));
      } else {
        const offset = (pile.phone.offset * vw) / 100;
        const last = sizes[n - 1].h;
        const room = vh - NAV_BAND - pile.phone.bottom - last;
        const step = n > 1 ? Math.max(0, room / (n - 1)) : 0;
        setSpots(sizes.map((_, i) => ({ x: gutter + (i % 2 === 0 ? -offset : offset), y: NAV_BAND + i * step })));
      }
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    cards.current.forEach((c) => c && observer.observe(c));
    return () => observer.disconnect();
  }, [n, desktop]);

  // Keep the nav clear as the section leaves: the stage fades as one layer
  // while its highest card rises from its spot to the end of the nav zone.
  const leave = useMotionValue(1);
  const { scrollY } = useScroll();
  const clearNav = () => {
    const el = stage.current;
    if (!el || !spots) return;
    const rest = Math.min(...spots.map((s) => s.y));
    const top = el.getBoundingClientRect().top + rest;
    // Over at least NavFade's own range, so a pile resting near the nav does not blink out.
    const span = Math.max(rest - navFade.end, navFade.start - navFade.end);
    leave.set(Math.min(1, Math.max(0, (top - (rest - span)) / span)));
  };
  useMotionValueEvent(scrollY, "change", () => frame.postRender(clearNav));

  const vars = {
    "--pile-screens-sm": n + pile.screens.sm,
    "--pile-screens-md": n + pile.screens.md,
  } as CSSProperties;

  return (
    <section ref={section} className={reduced ? "" : "pile"} style={reduced ? undefined : vars}>
      <motion.div
        ref={stage}
        className={`${reduced ? "relative" : "sticky top-0"} h-dvh overflow-clip`}
        style={{ opacity: reduced ? 1 : leave }}
      >
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-6 px-4 text-center md:px-10">
          <RevealText as="h2" text={headline} className="poster-1" />
          <Note text={note} tilt={4} />
        </div>
        {tiles.map((tile, i) => (
          <PileCard
            key={tile.slug}
            tile={tile}
            index={i}
            spot={spots?.[i] ?? null}
            tilt={tilts[i]}
            window={spans[i]}
            progress={scrollYProgress}
            reduced={reduced}
            measure={(el) => {
              cards.current[i] = el;
            }}
          />
        ))}
      </motion.div>
    </section>
  );
}
