"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { MenuProvider } from "./menu-state";
import { SmoothScroll } from "./smooth-scroll";
import { WipeProvider } from "./wipe";

// reducedMotion="user": with prefers-reduced-motion, Motion skips transform
// and layout animations everywhere; each pattern also handles its own still
// form (see the reduced-motion table in MOTION.md).
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <MenuProvider>
        <WipeProvider>{children}</WipeProvider>
      </MenuProvider>
    </MotionConfig>
  );
}
