"use client";

// Work: M30 image cursor trail. Desktop with a fine pointer, only once at
// least two project covers exist. As the pointer moves over empty page area,
// covers drop behind it, a new one every 80px of travel, cycling through the
// covers that exist. Each is 4:5, 160px wide, the plain image (no shader). It
// lands with ease-pop (scale 0.9 to 1, dur-pop), stays 600ms, then fades and
// scales to 0.85 in dur-fast. At most five at once. Nothing is drawn while
// the pointer is over a link or a button. Decorative: hidden from screen
// readers. Off with reduced motion.

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HOVER_QUERY, useMedia, useReduced } from "@/lib/hooks";
import { cursorTrail, dur, ease } from "@/lib/motion";

type Drop = { id: number; x: number; y: number; src: string };

export function CursorTrail({ covers }: { covers: string[] }) {
  const reduced = useReduced();
  const canHover = useMedia(HOVER_QUERY);
  const [drops, setDrops] = useState<Drop[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const count = useRef(0);
  const active = !reduced && canHover && covers.length >= cursorTrail.minCovers;

  useEffect(() => {
    if (!active) return;
    const timers = new Set<number>();
    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("a, button, [data-no-trail]")) {
        last.current = null;
        return;
      }
      const point = { x: event.clientX, y: event.clientY };
      if (last.current && Math.hypot(point.x - last.current.x, point.y - last.current.y) < cursorTrail.step) return;
      last.current = point;
      const id = count.current++;
      const src = covers[id % covers.length];
      setDrops((list) => [...list, { id, ...point, src }].slice(-cursorTrail.max));
      const timer = window.setTimeout(() => {
        setDrops((list) => list.filter((d) => d.id !== id));
        timers.delete(timer);
      }, (dur.pop + cursorTrail.stay) * 1000);
      timers.add(timer);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [active, covers]);

  if (!active) return null;
  const height = cursorTrail.width * 1.25;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-5">
      <AnimatePresence>
        {drops.map((d) => (
          <motion.img
            key={d.id}
            src={d.src}
            alt=""
            width={cursorTrail.width}
            height={height}
            className="absolute object-cover"
            style={{ left: d.x - cursorTrail.width / 2, top: d.y - height / 2, width: cursorTrail.width, height }}
            initial={{ scale: cursorTrail.from }}
            animate={{ scale: 1, transition: { duration: dur.pop, ease: ease.pop } }}
            exit={{ opacity: 0, scale: cursorTrail.out, transition: { duration: dur.fast, ease: ease.out } }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
