"use client";

// Label: small mono text in the `label` style. Numbers only where things are
// really in order. The tag variant sits in a 1px ivory box. Can scramble (M05).

import type { ElementType } from "react";
import { Scramble } from "@/components/motion/scramble";

type Props = {
  children: string;
  as?: ElementType;
  tag?: boolean;
  /** Colour class. ash on midnight, ivory on burgundy. */
  tone?: "ash" | "ivory";
  scramble?: "view" | "hover" | "both";
  className?: string;
};

export function Label({ children, as = "span", tag = false, tone = "ash", scramble, className = "" }: Props) {
  const colour = tone === "ash" ? "text-ash" : "text-ivory";
  const box = tag ? "inline-block border border-ivory px-2 py-1 text-ivory" : colour;
  const classes = `label ${box} ${className}`;
  if (scramble) return <Scramble as={as} text={children} trigger={scramble} className={classes} />;
  const Tag = as;
  return <Tag className={classes}>{children}</Tag>;
}
