"use client";

// M21 menu portrait: public/me/menu.png, a cut-out, shown as a two-colour
// dither (Paper Shaders ImageDithering) and re-dithered per link:
//   Home ivory · Work claret · About the real photo · Lab coarse 8x8 · Contact burgundy.
// Each dither canvas is masked by the photo's own alpha, so only the person
// shows and the shapes behind stay visible around them.
//   Opening: once `show` turns true the portrait scans in top to bottom.
//   Change of link: the new treatment scans down over the old one. Two
//   canvases take turns, so no canvas is created per change; the real photo
//   sits underneath both.
// Only clip-path and opacity animate. Reduced motion: no scan, the
// treatment swaps at once. Without WebGL2 the plain photo shows.

import { animate } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { menuPortrait as mp, ease } from "@/lib/motion";
import { hasWebGL2 } from "@/lib/shader-slot";
import type { MenuKey } from "@/lib/shapes";
import { color } from "@/lib/tokens";

const PortraitDitherCanvas = dynamic(() => import("@/components/motion/dither-canvas").then((m) => m.PortraitDitherCanvas), {
  ssr: false,
});

type Treatment = { photo: true } | { photo: false; front: string; type: "4x4" | "8x8"; size: number };

const TREATMENTS: Record<MenuKey, Treatment> = {
  home: { photo: false, front: color.ivory, type: "4x4", size: 3 },
  work: { photo: false, front: color.claret, type: "4x4", size: 3 },
  about: { photo: true },
  lab: { photo: false, front: color.ivory, type: "8x8", size: 6 },
  contact: { photo: false, front: color.burgundy, type: "4x4", size: 3 },
};

const HIDDEN_BELOW = "inset(0% 0% 100% 0%)";
const HIDDEN_ABOVE = "inset(100% 0% 0% 0%)";
const SHOWN = "inset(0% 0% 0% 0%)";

type Slot = { t: Exclude<Treatment, { photo: true }> | null };

export function MenuPortrait({ src, target, show, reduced }: { src: string; target: MenuKey; show: boolean; reduced: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [webgl, setWebgl] = useState(false);
  const [slots, setSlots] = useState<[Slot, Slot]>([{ t: null }, { t: null }]);
  /** Which canvas is on top and fully shown, or null when the photo shows. */
  const top = useRef<0 | 1 | null>(null);
  const shown = useRef<MenuKey | null>(null);
  const running = useRef<{ stop: () => void }[]>([]);

  useEffect(() => setWebgl(hasWebGL2()), []);

  // Scan the whole portrait in, once.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !show) return;
    if (reduced) {
      el.style.clipPath = SHOWN;
      return;
    }
    const c = animate(el, { clipPath: [HIDDEN_BELOW, SHOWN] }, { duration: mp.scanIn, ease: ease.inOut });
    return () => c.stop();
  }, [show, reduced]);

  // Apply the treatment for the current link.
  useEffect(() => {
    if (!webgl) return;
    const want = TREATMENTS[target];
    const first = shown.current === null;
    if (shown.current === target) return;
    shown.current = target;
    running.current.forEach((c) => c.stop());
    running.current = [];
    const instant = reduced || first;

    if (want.photo) {
      // Uncover the real photo: the shown canvas is scanned away top to bottom.
      const t = top.current;
      top.current = null;
      if (t === null) return;
      const el = layerRefs[t].current;
      if (!el) return;
      if (instant) el.style.clipPath = HIDDEN_ABOVE;
      else running.current.push(animate(el, { clipPath: [SHOWN, HIDDEN_ABOVE] }, { duration: mp.rescan, ease: ease.inOut }));
      return;
    }

    // Draw the new treatment on the canvas that is not on top, then scan it in over the other.
    const next: 0 | 1 = top.current === 0 ? 1 : 0;
    const prev = top.current;
    setSlots((s) => {
      const copy: [Slot, Slot] = [s[0], s[1]];
      copy[next] = { t: want };
      return copy;
    });
    const el = layerRefs[next].current;
    const other = prev === null ? null : layerRefs[prev].current;
    if (!el) return;
    el.style.zIndex = "2";
    if (other) other.style.zIndex = "1";
    top.current = next;
    if (instant) {
      el.style.clipPath = SHOWN;
      if (other) other.style.clipPath = HIDDEN_BELOW;
      return;
    }
    el.style.clipPath = HIDDEN_BELOW;
    // Wait a frame so the canvas has drawn the new treatment before it shows.
    const id = requestAnimationFrame(() => {
      const c = animate(el, { clipPath: [HIDDEN_BELOW, SHOWN] }, { duration: mp.rescan, ease: ease.inOut });
      running.current.push(c);
      c.then(() => {
        if (other && top.current === next) other.style.clipPath = HIDDEN_BELOW;
      });
    });
    running.current.push({ stop: () => cancelAnimationFrame(id) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, webgl, reduced]);

  const mask = { maskImage: `url(${src})`, WebkitMaskImage: `url(${src})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" } as CSSProperties;

  return (
    <div ref={frameRef} className="absolute inset-0" style={{ clipPath: reduced && show ? SHOWN : HIDDEN_BELOW }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      {webgl
        ? slots.map((slot, i) => (
            <div key={i} ref={layerRefs[i]} className="absolute inset-0" style={{ ...mask, clipPath: HIDDEN_BELOW }}>
              {slot.t ? (
                <PortraitDitherCanvas src={src} back={color.midnight} front={slot.t.front} type={slot.t.type} size={slot.t.size} />
              ) : null}
            </div>
          ))
        : null}
    </div>
  );
}
