"use client";

// M08 dither field. Burgundy fields are a slow two-colour dither (midnight
// back, burgundy front), 4x4 pattern, pixel size 3, speed 0.25. In the hero
// its centre drifts up to 6% toward the pointer on the default spring.
//
// - Paper Shaders loads lazily, only once a field is near the screen and the
//   page has finished loading and the browser is idle, so it never competes
//   with the first render. The dither then fades in (opacity only).
// - The container is a flat burgundy field underneath, so without WebGL2,
//   before the shader loads, or if it fails, the field is flat burgundy.
// - Only the most visible field animates (lib/shader-slot.ts). `still` fields,
//   such as tiles, never take the slot.
// - With reduced motion every field is one still frame.
// - While the menu is open every field holds still, so only the menu's own
//   portrait dithering draws.

import type { PaperShaderElement } from "@paper-design/shaders-react";
import { useMotionValueEvent, useSpring } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HOVER_QUERY, useMedia, useReduced } from "@/lib/hooks";
import { dither, spring } from "@/lib/motion";
import { hasWebGL2, joinShaderSlot } from "@/lib/shader-slot";
import { useMenu } from "@/components/shell/menu-state";

const DitherCanvas = dynamic(() => import("./dither-canvas").then((m) => m.DitherCanvas), { ssr: false });

type Props = {
  shape?: "wave" | "warp";
  /** Never animates. */
  still?: boolean;
  /** Centre drifts toward the pointer (hero only). */
  drift?: boolean;
  /** Offsets the still frame so neighbouring stills differ. */
  seed?: number;
  className?: string;
  children?: ReactNode;
};

const THRESHOLDS = [0, 0.1, 0.25, 0.5, 0.75, 1];

/** True once the window has loaded and the browser has had an idle moment. */
let pageIdle = false;
function useAfterLoadIdle() {
  const [ready, setReady] = useState(pageIdle);
  useEffect(() => {
    if (pageIdle) return setReady(true);
    let cancelled = false;
    const done = () => {
      pageIdle = true;
      if (!cancelled) setReady(true);
    };
    // Safari has no requestIdleCallback; a short timeout stands in for it.
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(done, { timeout: 2500 });
      else globalThis.setTimeout(done, 300);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

export function DitherField({ shape = "wave", still = false, drift = false, seed = 0, className = "", children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<PaperShaderElement>(null);
  const reduced = useReduced();
  const canHover = useMedia(HOVER_QUERY);
  const [near, setNear] = useState(false);
  const idle = useAfterLoadIdle();
  const [supported, setSupported] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => setSupported(hasWebGL2()), []);

  // Mount the canvas once the field is within a screen of the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: "25% 0px",
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Compete for the one animating slot.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || still || reduced) return;
    const slot = joinShaderSlot(setRunning);
    const observer = new IntersectionObserver(([entry]) => slot.report(entry.intersectionRatio), {
      threshold: THRESHOLDS,
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      slot.leave();
      setRunning(false);
    };
  }, [still, reduced]);

  // Hero: the centre leans toward the pointer.
  const offsetX = useSpring(0, spring);
  const offsetY = useSpring(0, spring);
  useEffect(() => {
    if (!drift || reduced || !canHover) return;
    const onMove = (event: PointerEvent) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      offsetX.set(Math.max(-1, Math.min(1, nx)) * dither.drift);
      offsetY.set(Math.max(-1, Math.min(1, ny)) * dither.drift);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [drift, reduced, canHover, offsetX, offsetY]);

  // The shader flips x and y (it adds (-offsetX, offsetY)), so these signs move
  // the pattern's centre toward the pointer.
  useMotionValueEvent(offsetX, "change", (x) => shaderRef.current?.paperShaderMount?.setUniforms({ u_offsetX: -x }));
  useMotionValueEvent(offsetY, "change", (y) =>
    shaderRef.current?.paperShaderMount?.setUniforms({ u_offsetY: dither.lift - y }),
  );

  const { open: menuOpen } = useMenu();
  const speed = running && !reduced && !still && !menuOpen ? dither.speed : 0;

  return (
    <div ref={rootRef} data-surface="burgundy" className={`relative isolate overflow-hidden bg-burgundy ${className}`}>
      {near && supported && idle ? (
        <div aria-hidden="true" className="dither-in absolute inset-0 -z-10">
          <DitherCanvas shape={shape} speed={speed} frame={dither.stillFrame + seed * 1500} shaderRef={shaderRef} />
        </div>
      ) : null}
      {children}
    </div>
  );
}
