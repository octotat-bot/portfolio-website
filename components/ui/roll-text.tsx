"use client";

// M06 letter roll. Each letter moves up one line and an identical copy follows
// it into place, letters stagger-letter apart, dur-roll, ease-out.
//
// Started from Skiper UI "skiper58" (Text roll navigation, skiper-ui.com, free
// with attribution): its two stacked letter rows and per-letter variants are
// kept; framer-motion is replaced by motion/react, the centre stagger, demo
// links, colours and type are removed and the timing is set to the tokens.
//
// The mask has 0.12em of padding so tall glyphs are not cut, and Anton's
// glyphs reach past its 0.9 line height, so the hidden copy rests at 150%
// (and leaving letters go to -150%) to sit fully outside the mask.
//
// With reduced motion, Motion skips transform animations, so the copy simply
// replaces the original: a colour change only.

import { motion } from "motion/react";
import { letterRoll } from "@/lib/motion";

type Props = {
  text: string;
  active: boolean;
  /** Colour class of the resting letters. */
  base: string;
  /** Colour class of the copy that rolls in. */
  roll: string;
  className?: string;
};

const OUT_TOP = "-150%";
const OUT_BOTTOM = "150%";

const letters = (text: string) => Array.from(text).map((c) => (c === " " ? " " : c));

export function RollText({ text, active, base, roll, className = "" }: Props) {
  const chars = letters(text);
  return (
    <motion.span
      aria-hidden="true"
      className={`roll-mask ${className}`}
      initial={false}
      animate={active ? "roll" : "rest"}
    >
      <span className={`block ${base}`}>
        {chars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{ rest: { y: "0%" }, roll: { y: OUT_TOP } }}
            transition={{ duration: letterRoll.duration, ease: letterRoll.ease, delay: i * letterRoll.stagger }}
          >
            {char}
          </motion.span>
        ))}
      </span>
      <span className={`absolute inset-0 block ${roll}`}>
        {chars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{ rest: { y: OUT_BOTTOM }, roll: { y: "0%" } }}
            transition={{ duration: letterRoll.duration, ease: letterRoll.ease, delay: i * letterRoll.stagger }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}
