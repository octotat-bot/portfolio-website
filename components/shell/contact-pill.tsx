"use client";

// M23 floating contact pill. A small ivory pill, bottom-right, "say hello".
// It bobs 4px over 3s (CSS), leans up to 12px toward a nearby pointer on the
// default spring, and pops on hover (ease-pop). Not shown on Contact, and it
// steps aside (fades out, unfocusable) while anything marked data-hide-pill is
// on screen: the hero buttons, the closing button, the footer.
// Still with reduced motion.
//
// The lean started from React Bits "Magnet" (reactbits.dev, MIT + Commons
// Clause): its distance falloff is kept; its own spring loop is replaced by
// Motion springs, so there is one animation engine.

import { motion, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { HOVER_QUERY, useMedia, usePath, useReduced } from "@/lib/hooks";
import { dur, ease, pill, spring } from "@/lib/motion";
import { TransitionLink } from "./wipe";

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function ContactPill() {
  const pathname = usePath();
  const reduced = useReduced();
  const canHover = useMedia(HOVER_QUERY);
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const [blocked, setBlocked] = useState(false);

  // Watch every element that asks the pill to step aside, on each page.
  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const frame = requestAnimationFrame(() => {
      const targets = Array.from(document.querySelectorAll("[data-hide-pill]"));
      const visible = new Set<Element>();
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setBlocked(visible.size > 0);
        // A target only counts once it is a little way into view, not when it
        // merely touches the bottom edge.
      }, { rootMargin: "0px 0px -24px 0px" });
      targets.forEach((el) => observer?.observe(el));
      if (targets.length === 0) setBlocked(false);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname]);

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
    <motion.div
      ref={ref}
      className="fixed bottom-4 right-4 z-30 md:bottom-10 md:right-10"
      aria-hidden={blocked || undefined}
      inert={blocked}
      initial={false}
      animate={{ opacity: blocked ? 0 : 1 }}
      transition={{ duration: reduced ? 0 : dur.fast, ease: ease.out }}
      style={{ pointerEvents: blocked ? "none" : undefined }}
    >
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
    </motion.div>
  );
}
