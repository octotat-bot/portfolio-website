"use client";

// WordList: a column of poster-2 words, one per line, five to eight words.
// M12 blur focus: a word is sharp and at full opacity when its centre is at
// mid-screen; away from it blur rises to 7px and opacity falls to 0.3.
// With reduced motion every word is sharp. The server renders the words without
// the effect; the client adds it once it knows the visitor's preference.

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReduced } from "@/lib/hooks";
import { blurFocus } from "@/lib/motion";

function FocusWord({ word }: { word: string }) {
  const ref = useRef<HTMLLIElement>(null);
  // 0 when the word's top meets the bottom of the screen, 1 when its bottom
  // leaves the top, 0.5 when its centre is at mid-screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const distance = useTransform(scrollYProgress, (p) => Math.min(1, Math.abs(p - 0.5) / 0.3));
  const filter = useTransform(distance, (d) => `blur(${(d * blurFocus.maxBlur).toFixed(2)}px)`);
  const opacity = useTransform(distance, (d) => 1 - d * (1 - blurFocus.minOpacity));
  return (
    <motion.li ref={ref} className="poster-2" style={{ filter, opacity }}>
      {word}
    </motion.li>
  );
}

export function WordList({ words, className = "" }: { words: string[]; className?: string }) {
  const reduced = useReduced();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <ul className={className}>
      {words.map((word) =>
        reduced || !mounted ? (
          <li key={word} className="poster-2">
            {word}
          </li>
        ) : (
          <FocusWord key={word} word={word} />
        ),
      )}
    </ul>
  );
}
