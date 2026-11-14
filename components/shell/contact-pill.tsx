"use client";

// M23 floating contact pill. A small ivory pill, bottom-right, "say hello".
// It bobs 4px over 3s (CSS), leans up to 12px toward a nearby pointer on the
// default spring, and pops on hover (ease-pop). Not shown on Contact.
// Still with reduced motion.
//
// The lean started from React Bits "Magnet" (reactbits.dev, MIT + Commons
// Clause): its distance falloff is kept; its own spring loop is replaced by
// Motion springs, so there is one animation engine.

import { motion, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { HOVER_QUERY, useMedia, useReduced } from "@/lib/hooks";
import { dur, ease, pill, spring } from "@/lib/motion";
import { TransitionLink } from "./wipe";

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function ContactPill() {
  const pathname = usePathname();
  const reduced = useReduced();
  const canHover = useMedia(HOVER_QUERY);
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  useEffect(() => {
    if (reduced || !canHover) return;
    const onMove = (event: PointerEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const outside = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));
      if (outside > pill.reach) {
        x.set(0);
        y.set(0);
        return;
      }
      const pull = 1 - smoothstep(pill.reach * 0.5, pill.reach, outside);
      const length = Math.hypot(dx, dy) || 1;
      const reach = Math.min(pill.lean, length) * pull;
      x.set((dx / length) * reach);
      y.set((dy / length) * reach);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, canHover, x, y]);

  if (pathname === "/contact") return null;

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-30 md:bottom-10 md:right-10">
      <motion.div style={{ x, y }}>
        <div className="pill-bob">
          <motion.div
            whileHover={reduced ? undefined : { scale: pill.hoverScale }}
            transition={{ duration: dur.pop, ease: ease.pop }}
          >
            <TransitionLink
              href={site.pill.href}
              className="label flex min-h-target items-center rounded-pill bg-ivory px-6 text-midnight"
            >
              {site.pill.label}
            </TransitionLink>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
