"use client";

// The footer's ghost marquee: one line in the `line` colour that runs right to
// left and speeds up with scroll (an M20 variant).
//
// Started from React Bits "Scroll Velocity" (reactbits.dev, MIT + Commons
// Clause): its scroll-velocity spring and wrap-around loop are kept; drag,
// skew, scale, fades, outlines and styling are removed. Paused off screen,
// still with reduced motion. Decorative, so hidden from screen readers.

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { useReduced } from "@/lib/hooks";
import { ticker } from "@/lib/motion";

const COPIES = 4;
/** Scroll velocity (px/s) to speed multiplier, as in the React Bits defaults. */
const VELOCITY_IN = [0, 1000];
const VELOCITY_OUT = [0, 5];

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export function GhostMarquee({ text, className = "" }: { text: string; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);
  const reduced = useReduced();
  const visible = useInView(rootRef);

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, VELOCITY_IN, VELOCITY_OUT, { clamp: false });
  const x = useTransform(baseX, (v) => (copyWidth ? `${wrap(-copyWidth, 0, v)}px` : "0px"));

  useLayoutEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setCopyWidth(el.offsetWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || !visible) return;
    const boost = 1 + Math.abs(factor.get());
    baseX.set(baseX.get() - ticker.speed * boost * (Math.min(delta, 64) / 1000));
  });

  return (
    <div ref={rootRef} aria-hidden="true" className={`overflow-hidden ${className}`}>
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {Array.from({ length: COPIES }, (_, i) => (
          <span key={i} ref={i === 0 ? copyRef : undefined} className="poster-1 shrink-0 pr-10 text-line">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
