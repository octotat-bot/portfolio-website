"use client";

// M21 menu collage, desktop only (from 810px): the right half of the menu.
// Back to front:
//   1. the poster-shape composition for the hovered or focused link,
//   2. the portrait (public/me/menu.png), aligned to the bottom of its stage,
//   3. a claret ring over each binocular lens (content/site.ts menuPortrait),
//   4. under the stage, never over the portrait: the link's number and its
//      typed note, which retypes per link.
// Shapes are only ever behind the portrait. The stage is clear of the links
// (left half), the nav and the menu button, so nothing sits over text.
// Opening: after the circle reveal and the links, the portrait scans in, then
// the shapes fly in. Without the photo, the composition alone is centred.
// The portrait leans at most 8px toward the pointer on the default spring.
// All of it is decoration: aria-hidden, no pointer events.

import { motion, useSpring } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Scramble } from "@/components/motion/scramble";
import { Note } from "@/components/ui/note";
import { site } from "@/content/site";
import { HOVER_QUERY, useMedia } from "@/lib/hooks";
import type { Portrait } from "@/lib/media";
import { dur, ease, menu as m, menuPortrait as mp, spring } from "@/lib/motion";
import { menuCompositions, type MenuKey } from "@/lib/shapes";
import { color } from "@/lib/tokens";
import { MenuPortrait } from "./menu-portrait";
import { MenuShapes } from "./menu-shapes";

/** The optimised (smaller, same alpha) version of the photo. */
const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

/** When the links have finished sliding in, seconds after the menu opens. */
const LINKS_IN = m.linksDelay + 4 * m.linkStagger + dur.roll;

export function MenuCollage({
  portrait,
  target,
  number,
  note,
  reduced,
}: {
  portrait: Portrait | null;
  target: MenuKey;
  number: string;
  note: string;
  reduced: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [scan, setScan] = useState(reduced);
  const [shapesOn, setShapesOn] = useState(reduced);
  const fine = useMedia(HOVER_QUERY);
  const leanX = useSpring(0, spring);
  const leanY = useSpring(0, spring);
  const comp = menuCompositions[target];
  const ratio = portrait ? portrait.width / portrait.height : comp.w / comp.h;

  // The frame: as tall as the stage allows, in the photo's proportions.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const h = Math.min(r.height, r.width / ratio);
      setBox({ w: h * ratio, h });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ratio]);

  // Opening sequence.
  useEffect(() => {
    if (reduced) {
      setScan(true);
      setShapesOn(true);
      return;
    }
    const a = window.setTimeout(() => setScan(true), LINKS_IN * 1000);
    const b = window.setTimeout(() => setShapesOn(true), (LINKS_IN + (portrait ? mp.scanIn : 0)) * 1000);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduced, portrait]);

  // The portrait leans toward the pointer, at most 8px.
  useEffect(() => {
    if (reduced || !fine || !portrait) return;
    const onMove = (e: PointerEvent) => {
      const r = stageRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / Math.max(r.width, r.height));
      leanX.set((dx / d) * mp.lean * k);
      leanY.set((dy / d) * mp.lean * k);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, fine, portrait, leanX, leanY]);

  const lenses = site.menuPortrait.lenses.filter(
    (l): l is { lensX: number; lensY: number } => l.lensX !== null && l.lensY !== null,
  );
  const src = portrait ? optimised(portrait.src) : null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none flex h-full flex-col"
      exit={{ opacity: 0, transition: { duration: reduced ? 0 : mp.closeOut, ease: ease.out } }}
    >
      <div ref={stageRef} className="relative min-h-0 flex-1">
        {box ? (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: box.w, height: box.h }}>
            <MenuShapes target={target} start={shapesOn} reduced={reduced} />
            {src ? (
              <motion.div className="absolute inset-0" style={{ x: leanX, y: leanY }}>
                <MenuPortrait src={src} target={target} show={scan} reduced={reduced} />
                {lenses.map((l, i) => (
                  <span
                    key={i}
                    className="lens-ring absolute"
                    data-on={scan ? "true" : "false"}
                    style={{ left: `${l.lensX}%`, top: `${l.lensY}%`, width: `${mp.ringSize}%` }}
                  >
                    <svg viewBox="0 0 100 100" className="block h-full w-full overflow-visible">
                      <circle cx="50" cy="50" r="46" fill="none" stroke={color.claret} strokeWidth="6" />
                    </svg>
                  </span>
                ))}
              </motion.div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex min-h-24 items-center gap-6 pt-6">
        <Scramble text={number} trigger="none" className="label text-ash" />
        <Note text={note} immediate tilt={-3} />
      </div>
    </motion.div>
  );
}
