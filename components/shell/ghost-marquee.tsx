"use client";

// The footer's ghost marquee (M32 footer flip line): one line in the `line`
// colour that runs right to left and speeds up with scroll (an M20 variant),
// with split-flap motion on top:
// - when it first comes into view, its letters flip in one after another,
//   from edge-on;
// - while it shows, a random letter flips over now and then;
// - on desktop with a fine pointer, a letter flips as it passes under it;
// - the whole line leans (skew) with scroll speed.
// With `upsideDown`, each copy is turned 180 degrees; it still runs right to
// left. Transform only.
//
// Started from React Bits "Scroll Velocity" (reactbits.dev, MIT + Commons
// Clause): its scroll-velocity spring and wrap-around loop are kept; drag,
// scale, fades, outlines and styling are removed. Paused off screen, still
// with reduced motion. Decorative, so hidden from screen readers; each letter
// is drawn by a pseudo-element from data-text, so the words are not page
// text (the low-contrast `line` colour is deliberate and carries nothing).

import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { HOVER_QUERY, MD_QUERY, useMedia, useReduced } from "@/lib/hooks";
import { ease, flipLine, ticker } from "@/lib/motion";

const COPIES = 4;
/** Scroll velocity (px/s) to speed multiplier, as in the React Bits defaults. */
const VELOCITY_IN = [0, 1000];
const VELOCITY_OUT = [0, 5];

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export function GhostMarquee({
  text,
  upsideDown = false,
  className = "",
}: {
  text: string;
  upsideDown?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);
  const reduced = useReduced();
  const visible = useInView(rootRef);
  const arrived = useInView(rootRef, { once: true, amount: 0.5 });
  const desktop = useMedia(MD_QUERY);
  const fine = useMedia(HOVER_QUERY);
  const letters = Array.from(text);

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, VELOCITY_IN, VELOCITY_OUT, { clamp: false });
  const x = useTransform(baseX, (v) => (copyWidth ? `${wrap(-copyWidth, 0, v)}px` : "0px"));
  // Lean with scroll speed (none with reduced motion).
  const skewX = useTransform(smooth, [-flipLine.skewAt, 0, flipLine.skewAt], reduced ? [0, 0, 0] : [flipLine.skew, 0, -flipLine.skew]);

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

  const all = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-letter]") ?? []);
  const flipping = useRef(new WeakSet<HTMLElement>());
  /** One full flip over (rotateX 0 to 360), unless it is already turning. */
  const flip = (el: HTMLElement) => {
    if (reduced || flipping.current.has(el)) return;
    flipping.current.add(el);
    void animate(el, { rotateX: [0, 360] }, { duration: flipLine.flip, ease: ease.inOut }).then(() => {
      el.style.transform = "";
      flipping.current.delete(el);
    });
  };

  // Before it arrives, the letters wait edge-on; then they flip in.
  useEffect(() => {
    const els = all();
    if (reduced) {
      // Reduced motion can arrive after the first render: undo the wait.
      els.forEach((el) => (el.style.transform = ""));
      return;
    }
    if (!arrived) {
      els.forEach((el) => (el.style.transform = "rotateX(90deg)"));
      return;
    }
    els.forEach((el) => {
      const i = Number(el.dataset.letter);
      flipping.current.add(el);
      void animate(el, { rotateX: [90, 0] }, { duration: flipLine.enter.duration, ease: ease.out, delay: i * flipLine.enter.stagger }).then(() => {
        el.style.transform = "";
        flipping.current.delete(el);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrived, reduced]);

  // Now and then, while it shows, a random letter flips over.
  useEffect(() => {
    if (reduced || !arrived || !visible) return;
    const id = window.setInterval(() => {
      const els = all().filter((el) => el.dataset.char !== " ");
      const el = els[Math.floor(Math.random() * els.length)];
      if (el) flip(el);
    }, flipLine.idle * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrived, visible, reduced]);

  // Desktop: a letter flips as it passes under the pointer.
  const onPointerOver = (e: PointerEvent<HTMLDivElement>) => {
    if (!desktop || !fine) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-letter]");
    if (el && el.dataset.char !== " ") flip(el);
  };

  return (
    <div ref={rootRef} aria-hidden="true" className={`overflow-hidden ${className}`} onPointerOver={onPointerOver}>
      <motion.div className="flex whitespace-nowrap" style={{ x, skewX }}>
        {Array.from({ length: COPIES }, (_, c) => (
          <span
            key={c}
            ref={c === 0 ? copyRef : undefined}
            className={`poster-1 flex shrink-0 select-none pr-10 text-line ${upsideDown ? "rotate-180" : ""}`}
            style={{ perspective: flipLine.perspective }}
          >
            {letters.map((char, i) => (
              <span
                key={i}
                data-letter={i}
                data-char={char}
                data-text={char}
                className="ghost-word inline-block whitespace-pre"
              />
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
