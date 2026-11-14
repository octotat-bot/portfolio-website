"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { cancelFrame, frame, type FrameData } from "motion/react";
import { useEffect } from "react";
import { useReduced } from "@/lib/hooks";
import "lenis/dist/lenis.css";

// M25 smooth scroll. Lenis at its defaults, ticked by Motion's frame loop so
// scroll-linked values and the scroll position update in the same frame.
// Lenis leaves touch scrolling native by default. With reduced motion it is
// not mounted at all.
//
// Lenis is mounted in root mode with no children: it renders nothing and
// publishes its instance to a global store that useLenis() reads, so turning
// it on or off never remounts the page.

function LenisOnMotionFrame() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const update = (data: FrameData) => lenis.raf(data.timestamp);
    frame.update(update, true);
    return () => cancelFrame(update);
  }, [lenis]);
  return null;
}

export function SmoothScroll() {
  const reduced = useReduced();
  if (reduced) return null;
  return (
    <>
      <ReactLenis root options={{ autoRaf: false }} />
      <LenisOnMotionFrame />
    </>
  );
}

type LenisLike = { stop: () => void; start: () => void } | undefined;

/** Locks page scroll, with or without Lenis. Returns the unlock function. */
export function lockScroll(lenis: LenisLike): () => void {
  lenis?.stop();
  const root = document.documentElement;
  const previous = root.style.overflow;
  root.style.overflow = "hidden";
  return () => {
    root.style.overflow = previous;
    lenis?.start();
  };
}
