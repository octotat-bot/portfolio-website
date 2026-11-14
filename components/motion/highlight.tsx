"use client";

import { useInView } from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { useStageClear } from "@/lib/curtain";

// M11 highlight sweep. A burgundy bar grows from the left behind the word
// (scaleX 0 to 1) in dur-roll when it enters view, once. The word stays ivory.
// The bar is a pseudo-element; see .highlight in globals.css. With reduced
// motion the bar is simply there.

export function Highlight({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const clear = useStageClear();
  return (
    <span
      ref={ref}
      className="highlight"
      data-on={inView && clear ? "true" : "false"}
      style={delay ? ({ "--highlight-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}
