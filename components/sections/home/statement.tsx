"use client";

// Home 3: statement, in two beats (M26). The section is pinned; the sentence
// is played in its two halves and the motion acts it out.
//   Beat 1, the build: "I BUILD THE THING," assembles from scattered letters
//   as the section scrolls up (offset up to 40px, turned up to 25 degrees,
//   30% opacity), while a poster-shape composition builds itself beside it
//   (G1), one block deliberately crooked.
//   Beat 2, the check: "THEN I CHECK IF IT'S ACTUALLY RIGHT." rises in word by
//   word, then a burgundy bar sweeps behind each word in turn, ticking them
//   off. When the last word is checked the crooked block snaps into its true
//   place, and the note types itself: "most people skip the second part".
// Everything is tied to scroll, so it plays backwards too. Desktop: text left,
// composition right. Phones: composition above the text.
// With reduced motion: nothing pinned, the sentence in place, every word
// checked, the block straight and the note shown.
//
// The scattered letters started from Skiper UI "skiper31" (Text scroll
// animation, skiper-ui.com, free with attribution).

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { ShapeComposition } from "@/components/motion/shape-composition";
import { Note } from "@/components/ui/note";
import { home } from "@/content/pages";
import { useReduced } from "@/lib/hooks";
import { lineReveal, statement, statementBeats as beats } from "@/lib/motion";
import { compositions } from "@/lib/shapes";
import { splitWords } from "@/lib/split";

/**
 * A stable pseudo-random number in -1..1 for a letter and a channel, rounded
 * so the server and the browser write the same starting transform.
 */
const scatter = (index: number, channel: number) => {
  const s = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453;
  return Math.round(((s - Math.floor(s)) * 2 - 1) * 100) / 100;
};

function Letter({ char, index, progress }: { char: string; index: number; progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 1], [scatter(index, 1) * statement.offset, 0]);
  const y = useTransform(progress, [0, 1], [scatter(index, 2) * statement.offset, 0]);
  const rotate = useTransform(progress, [0, 1], [scatter(index, 3) * statement.rotate, 0]);
  const opacity = useTransform(progress, [0, 1], [statement.opacity, 1]);
  return (
    <motion.span className="inline-block" style={{ x, y, rotate, opacity }}>
      {char}
    </motion.span>
  );
}

/** Beat 1: scattered letters that assemble as the section arrives. */
function Build({ text, progress, still }: { text: string; progress: MotionValue<number>; still: boolean }) {
  let index = 0;
  return (
    <span className="block">
      {splitWords(text).map((word, w) => (
        <span key={w}>
          <span className="inline-block whitespace-nowrap">
            {word.letters.map((char) =>
              still ? (
                <span key={index++}>{char}</span>
              ) : (
                <Letter key={index} char={char} index={index++} progress={progress} />
              ),
            )}
          </span>{" "}
        </span>
      ))}
    </span>
  );
}

/** Beat 2: one word that rises in, then gets its burgundy check bar. */
function CheckWord({ word, i, n, progress }: { word: string; i: number; n: number; progress: MotionValue<number> }) {
  const [r0, r1] = beats.rise;
  const [c0, c1] = beats.check;
  const riseStart = r0 + (r1 - r0) * (i / n) * 0.6;
  const y = useTransform(progress, [riseStart, riseStart + (r1 - r0) * 0.4], [lineReveal.from, "0%"]);
  const span = (c1 - c0) / n;
  const scaleX = useTransform(progress, [c0 + span * i, c0 + span * (i + 1)], [0, 1]);
  return (
    <span className="reveal-mask">
      <motion.span className="relative isolate inline-block" style={{ y }}>
        <motion.span aria-hidden="true" className="check-bar" style={{ scaleX }} />
        {word}
      </motion.span>
    </span>
  );
}

function StillWord({ word }: { word: string }) {
  return (
    <span className="relative isolate inline-block">
      <span aria-hidden="true" className="check-bar check-bar-on" />
      {word}
    </span>
  );
}

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const { sentence, beats: lines, note } = home.statement;
  const [build, check] = lines;

  // Beat 1: 0 as the section enters at the bottom, 1 once it is pinned.
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ["start end", "start start"] });
  // The pinned stretch: 0 when pinning starts, 1 when it lets go.
  const { scrollYProgress: pinned } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [checked, setChecked] = useState(false);
  const [noteOn, setNoteOn] = useState(false);
  useMotionValueEvent(pinned, "change", (q) => {
    setChecked(q >= beats.snapAt);
    if (q >= beats.noteAt) setNoteOn(true);
  });

  const words = splitWords(check);
  return (
    <section ref={ref} className="statement-height relative" style={reduced ? undefined : { height: beats.height }}>
      <div className="statement-stage sticky top-0 h-dvh px-4 pb-10 pt-24 md:px-10 motion-reduce:static motion-reduce:h-auto motion-reduce:py-32">
        <div className="statement-shapes">
          <ShapeComposition comp={compositions.statement} checked={checked || reduced} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <p className="poster-3">
            <span className="sr-only">{sentence}</span>
            <span aria-hidden="true">
              <Build text={build} progress={arrive} still={reduced} />
              <span className="block">
                {words.map((w, i) => (
                  <span key={i}>
                    {reduced ? (
                      <StillWord word={w.text} />
                    ) : (
                      <CheckWord word={w.text} i={i} n={words.length} progress={pinned} />
                    )}{" "}
                  </span>
                ))}
              </span>
            </span>
          </p>
          <Note text={note} tilt={-3} when={noteOn || reduced} />
        </div>
      </div>
    </section>
  );
}
