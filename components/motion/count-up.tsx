"use client";

// M19 count up. Numerals count from 0 to the value in 1.4s, ease-out, when
// they enter view, once. Idea from Skiper UI "skiper37" (Animated Number,
// skiper-ui.com, free with attribution); its Number Flow, icon and
// intersection-observer dependencies are not used, only Motion's animate().
// With reduced motion the final value is shown at once.

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { useStageClear } from "@/lib/curtain";
import { useReduced } from "@/lib/hooks";
import { countUp } from "@/lib/motion";

type Props = {
  value: number;
  className?: string;
  /** Pad with leading zeros to this many digits, e.g. 3 for "007". */
  pad?: number;
};

const format = (n: number, pad?: number) => {
  const whole = Math.round(n);
  return pad ? String(whole).padStart(pad, "0") : whole.toLocaleString("en-US");
};

export function CountUp({ value, className, pad }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const visual = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const clear = useStageClear();
  const reduced = useReduced();

  // The server renders the final value. Before it is seen, rest at zero.
  useEffect(() => {
    if (!reduced && !inView && visual.current) visual.current.textContent = format(0, pad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    const node = visual.current;
    if (!node || !inView || !clear) return;
    if (reduced) {
      node.textContent = format(value, pad);
      return;
    }
    const controls = animate(0, value, {
      duration: countUp.duration,
      ease: countUp.ease,
      onUpdate: (n) => (node.textContent = format(n, pad)),
    });
    return () => controls.stop();
  }, [inView, clear, reduced, value, pad]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{format(value, pad)}</span>
      <span ref={visual} aria-hidden="true" className="tabular-nums">
        {format(value, pad)}
      </span>
    </span>
  );
}
