"use client";

// M29 reading progress: a 2px claret line across the very top grows left to
// right with scroll. Idea from Skiper UI "skiper89" (Scroll progress 001,
// skiper-ui.com, free with attribution); its Number Flow counter is not used.
// It follows the scroll position directly, so with reduced motion it simply
// shows where you are.

import { motion, useScroll } from "motion/react";

export function ProgressLine() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-45 h-progress origin-left bg-claret"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
