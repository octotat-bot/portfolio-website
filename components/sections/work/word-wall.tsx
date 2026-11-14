"use client";

// Work 1: M16 word wall. One word repeated to fill the screen in poster-2,
// fixed behind everything. Odd rows drift left and even rows right as you
// scroll. One row is the page's line in claret; it is the page's h1 and does
// not drift, so it stays readable and wraps on phones. As the first tile
// arrives, the whole wall fades to the `line` colour: the ivory words and the
// claret line fade out over `line` copies (opacity only, no colour animation).
// With reduced motion the wall sits still in the first screen.

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { useReduced } from "@/lib/hooks";
import { wordWall } from "@/lib/motion";

/** Rows above and below the line; enough to fill a tall phone screen. */
const ROWS_ABOVE = 3;
const ROWS_BELOW = 12;
/** Copies of the word in each half of a row; one half is wider than any screen. */
const COPIES = 16;

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// A row is two identical halves; it moves within one half's width and wraps,
// so it never runs out of words however far the page scrolls.
function Row({ word, index, scrollY, still }: { word: string; index: number; scrollY: MotionValue<number>; still: boolean }) {
  const half = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = half.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const direction = index % 2 === 0 ? -1 : 1;
  const x = useTransform(scrollY, (y) => (still || !width ? 0 : wrap(-width, 0, direction * y * wordWall.drift - width / 2)));
  const text = Array.from({ length: COPIES }, () => word).join(" ") + " ";
  return (
    <motion.p className="poster-2 flex whitespace-pre" style={{ x }}>
      <span ref={half}>{text}</span>
      <span>{text}</span>
    </motion.p>
  );
}

export function WordWall({ word, line }: { word: string; line: string }) {
  const reduced = useReduced();
  const { scrollY } = useScroll();
  // The first tile sits one screen down; fade as it comes up.
  const ivory = useTransform(scrollY, (y) => {
    if (reduced) return 1;
    const h = typeof window === "undefined" ? 1 : window.innerHeight;
    return Math.max(0, 1 - y / (h * 0.6));
  });

  const rows = (from: number, count: number) =>
    Array.from({ length: count }, (_, i) => (
      <Row key={from + i} word={word} index={from + i} scrollY={scrollY} still={reduced} />
    ));

  const layer = (colour: string) => (
    <div aria-hidden="true" className={`flex flex-col ${colour}`}>
      {rows(0, ROWS_ABOVE)}
      <p className="poster-2 invisible px-4 md:px-10">{line}</p>
      {rows(ROWS_ABOVE, ROWS_BELOW)}
    </div>
  );

  return (
    <div className={`${reduced ? "absolute" : "fixed"} inset-x-0 top-0 z-0 h-dvh overflow-hidden`}>
      <div className="relative">
        {layer("text-line")}
        <motion.div className="absolute inset-0" style={{ opacity: ivory }}>
          {layer("text-ivory")}
        </motion.div>
        {/* The line itself, in the same place as the invisible row above. */}
        <div className="absolute inset-x-0 top-0 flex flex-col">
          <div aria-hidden="true" className="invisible">
            {Array.from({ length: ROWS_ABOVE }, (_, i) => (
              <p key={i} className="poster-2">
                {word}
              </p>
            ))}
          </div>
          <div className="relative">
            <p aria-hidden="true" className="poster-2 px-4 text-line md:px-10">
              {line}
            </p>
            <motion.h1 className="poster-2 absolute inset-0 px-4 text-claret md:px-10" style={{ opacity: ivory }}>
              {line}
            </motion.h1>
          </div>
        </div>
      </div>
    </div>
  );
}
