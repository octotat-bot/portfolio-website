"use client";

// Home 3: statement. 150vh tall with the sentence sticky at mid-screen.
// M26 scroll-built statement: letters start scattered (offset up to 40px,
// turned up to 25 degrees, 30% opacity) and travel into place as the section
// scrolls up, in place and at full opacity once it is pinned at mid-screen.
// Then the note under it types itself (M10).
//
// Started from Skiper UI "skiper31" (Text scroll animation, skiper-ui.com,
// free with attribution): one variant kept, its per-letter transforms driven
// by the section's scroll progress; framer-motion replaced by motion/react,
// its own Lenis wrapper, demo images and styling removed, offsets set to M26.
// With reduced motion the sentence is flat text in place.

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { Note } from "@/components/ui/note";
import { home } from "@/content/pages";
import { useReduced } from "@/lib/hooks";
import { statement } from "@/lib/motion";
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

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const { sentence, note } = home.statement;
  // 0 as the section enters at the bottom, 1 when its top reaches the top and
  // the sentence is pinned at mid-screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const [assembled, setAssembled] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p >= 0.98) setAssembled(true);
  });

  let index = 0;
  return (
    <section ref={ref} className="statement-height relative">
      <div className="sticky top-0 flex h-dvh flex-col justify-center gap-6 px-4 md:px-10 motion-reduce:static motion-reduce:h-auto motion-reduce:py-32">
        <p className="poster-3">
          <span className="sr-only">{sentence}</span>
          <span aria-hidden="true">
            {splitWords(sentence).map((word, w) => (
              <span key={w}>
                <span className="inline-block whitespace-nowrap">
                  {word.letters.map((char) =>
                    reduced ? (
                      <span key={index++}>{char}</span>
                    ) : (
                      <Letter key={index} char={char} index={index++} progress={scrollYProgress} />
                    ),
                  )}
                </span>{" "}
              </span>
            ))}
          </span>
        </p>
        <Note text={note} tilt={-3} when={assembled || reduced} />
      </div>
    </section>
  );
}
