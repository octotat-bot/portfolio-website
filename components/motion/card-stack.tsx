"use client";

// M27 card stack, for tiles below 810px. Each card sticks near the top (below
// the nav zone); the next slides over it while the one beneath scales down
// to 0.92. Every card is opaque, so text only ever sits on its own card.
//
// Started from Skiper UI "skiper16" (Card stack scroll, skiper-ui.com, free
// with attribution): sticky cards with a scale driven by scroll are kept;
// framer-motion is replaced by motion/react, its own Lenis wrapper, demo
// images and rounded corners are removed, and each card's scale follows the
// on-screen approach of the card after it rather than one shared range.
// With reduced motion it is a plain vertical list.

import { frame, motion, motionValue, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useReduced } from "@/lib/hooks";
import { cardStack } from "@/lib/motion";
import { NavFade } from "./nav-fade";

export function CardStack({ items, className = "" }: { items: { key: string; node: ReactNode }[]; className?: string }) {
  const reduced = useReduced();
  const wrappers = useRef<(HTMLDivElement | null)[]>([]);
  // One scale per card, created once.
  const scales = useRef(items.map(() => motionValue(1)));
  const { scrollY } = useScroll();

  const update = () => {
    const h = window.innerHeight;
    wrappers.current.forEach((_, i) => {
      const next = wrappers.current[i + 1];
      const scale = scales.current[i];
      if (!scale) return;
      if (!next) return scale.set(1);
      // 0 while the next card is below the screen, 1 once it has reached its sticking point.
      const top = next.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (h - top) / (h - cardStack.top)));
      scale.set(1 - p * (1 - cardStack.scale));
    });
  };
  useMotionValueEvent(scrollY, "change", () => frame.postRender(update));
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduced) {
    return (
      <div className={`flex flex-col gap-16 ${className}`}>
        {items.map((item) => (
          <NavFade key={item.key}>{item.node}</NavFade>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-16 pb-16 ${className}`}>
      {items.map((item, i) => (
        <div
          key={item.key}
          ref={(el) => {
            wrappers.current[i] = el;
          }}
          className="sticky"
          style={{ top: cardStack.top }}
        >
          <NavFade>
            <motion.div className="origin-top bg-midnight" style={{ scale: scales.current[i] }}>
              {item.node}
            </motion.div>
          </NavFade>
        </div>
      ))}
    </div>
  );
}

