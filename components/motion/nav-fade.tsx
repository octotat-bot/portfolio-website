"use client";

// Keeps the nav clear: anything wrapped in NavFade fades out as its top edge
// scrolls into the top 120px of the screen, and is gone by the bottom of the
// nav. It reads the element's real position each scroll frame, so it also
// works for sticky cards and for tiles moved by transforms.

import { frame, motion, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { navFade } from "@/lib/motion";

export function NavFade({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(1);
  const { scrollY } = useScroll();

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const t = (top - navFade.end) / (navFade.start - navFade.end);
    opacity.set(Math.min(1, Math.max(0, t)));
  };

  // After Motion has written this frame's transforms, read where things are.
  useMotionValueEvent(scrollY, "change", () => frame.postRender(update));
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div ref={ref} className={className} style={{ opacity }}>
      {children}
    </motion.div>
  );
}
