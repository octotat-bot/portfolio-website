"use client";

import { animate, motion, useInView } from "motion/react";
import { Fragment, useEffect, useRef, useState, type ElementType } from "react";
import { useStageClear } from "@/lib/curtain";
import { useIsomorphicLayoutEffect, useReduced } from "@/lib/hooks";
import { fontShuffle, lineReveal } from "@/lib/motion";
import { lineIndexes, splitWords, type Word } from "@/lib/split";
import { Highlight } from "./highlight";

// A headline that can:
//   M03 line reveal: each line rises from behind its own baseline, lines 60ms apart.
//   M04 font shuffle: letters flip between Anton and the two Rubik faces, then
//       settle on Anton left to right. Letter boxes keep their Anton width.
//   M11 highlight sweep on one word.
//
// Each word sits in its own clipping mask. Words on the same line share a
// delay, so the result reads as whole lines rising. Line membership is measured
// after layout and again whenever the width changes.
//
// The visual copy is hidden from screen readers; the full text is in an
// sr-only span inside the same element, so a heading keeps its real name.
// With reduced motion, CSS keeps every word in place (see [data-reveal] in
// globals.css) and the shuffle never runs.

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Force line breaks, e.g. ["MUKUND", "MANGLA"]. Otherwise lines are measured. */
  lines?: string[];
  /** Class for each forced line. "block" by default; "block md:inline" joins them from md. */
  lineClassName?: string;
  reveal?: boolean;
  shuffle?: boolean;
  /** A word to sweep with the highlight bar. Matched without punctuation or case. */
  highlight?: string;
  /** Seconds to wait after the trigger. */
  delay?: number;
  id?: string;
};

const FACES = ["", "var(--face-rubik-scribble)", "var(--face-rubik-marker-hatch)"];
const normalise = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

async function loadShuffleFaces() {
  const root = getComputedStyle(document.documentElement);
  const families = ["--face-rubik-scribble", "--face-rubik-marker-hatch"]
    .map((name) => root.getPropertyValue(name).trim())
    .filter(Boolean);
  await Promise.all(families.map((family) => document.fonts.load(`400 1em ${family}`).catch(() => [])));
}

export function RevealText({
  text,
  as: Tag = "p",
  className,
  lines,
  lineClassName = "block",
  reveal = true,
  shuffle = false,
  highlight,
  delay = 0,
  id,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReduced();
  const clear = useStageClear();
  const inView = useInView(rootRef, { once: true, amount: 0.25 });
  const go = inView && clear;

  const groups: Word[][] = (lines ?? [text]).map((line) => splitWords(line));
  const words = groups.flat().map((w, index) => ({ ...w, index }));
  const [lineOf, setLineOf] = useState<number[]>(() => words.map(() => 0));

  // Measure which line each word sits on.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !reveal) return;
    const measure = () => {
      const next = lineIndexes(wordRefs.current.slice(0, words.length));
      setLineOf((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [text, lines?.join("|"), reveal]);

  const lineCount = Math.max(...lineOf, 0) + 1;
  const revealEnd = delay + (reveal ? (lineCount - 1) * lineReveal.stagger + lineReveal.duration : 0);

  // M04: one Motion timeline drives every letter's face.
  useEffect(() => {
    if (!shuffle || !go || reduced) return;
    const glyphs = glyphRefs.current.filter((g): g is HTMLSpanElement => g !== null);
    if (glyphs.length === 0) return;
    let controls: ReturnType<typeof animate> | undefined;
    let cancelled = false;
    const start = window.setTimeout(async () => {
      await loadShuffleFaces();
      if (cancelled) return;
      const n = glyphs.length;
      controls = animate(0, fontShuffle.settle, {
        duration: fontShuffle.settle,
        ease: "linear",
        onUpdate: (t) => {
          const tick = Math.floor(t / fontShuffle.interval);
          glyphs.forEach((glyph, i) => {
            const settled = t >= (fontShuffle.settle * (i + 1)) / n;
            glyph.style.fontFamily = settled ? "" : FACES[(tick + i) % FACES.length];
          });
        },
        onComplete: () => glyphs.forEach((glyph) => (glyph.style.fontFamily = "")),
      });
    }, revealEnd * 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      controls?.stop();
      glyphs.forEach((glyph) => (glyph.style.fontFamily = ""));
    };
  }, [shuffle, go, reduced, revealEnd]);

  let glyphIndex = 0;
  const renderWord = (word: Word & { index: number }) => {
    const letters = shuffle
      ? word.letters.map((letter, i) => {
          const g = glyphIndex++;
          return (
            <span key={i} className="relative inline-block">
              <span className="invisible">{letter}</span>
              <span
                ref={(el) => {
                  glyphRefs.current[g] = el;
                }}
                className="absolute inset-x-0 top-0 whitespace-nowrap text-center"
              >
                {letter}
              </span>
            </span>
          );
        })
      : word.text;
    const content = highlight && normalise(word.text) === normalise(highlight) ? (
      <Highlight delay={revealEnd}>{letters}</Highlight>
    ) : (
      letters
    );

    if (!reveal) {
      return (
        <span key={word.index} ref={(el) => void (wordRefs.current[word.index] = el)} className="inline-block">
          {content}
        </span>
      );
    }
    return (
      <span key={word.index} ref={(el) => void (wordRefs.current[word.index] = el)} className="reveal-mask">
        <motion.span
          data-reveal
          className="inline-block"
          initial={{ y: lineReveal.from }}
          animate={go ? { y: "0%" } : { y: lineReveal.from }}
          transition={{
            duration: lineReveal.duration,
            ease: lineReveal.ease,
            delay: delay + (lineOf[word.index] ?? 0) * lineReveal.stagger,
          }}
        >
          {content}
        </motion.span>
      </span>
    );
  };

  let w = 0;
  return (
    <Tag ref={rootRef} id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {groups.map((group, g) => (
          <Fragment key={g}>
          {g > 0 ? " " : null}
          <span className={lines ? lineClassName : undefined}>
            {group.map((word, i) => {
              const indexed = { ...word, index: w++ };
              return (
                <Fragment key={i}>
                  {renderWord(indexed)}
                  {i < group.length - 1 ? " " : null}
                </Fragment>
              );
            })}
          </span>
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
