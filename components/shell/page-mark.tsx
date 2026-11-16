"use client";

// G4 page mark: a 20px ivory shape just right of the nav name, one per page
// (Home disc, Work half disc, About quarter disc, Lab star, Contact square).
// It sits in its own layer above the stairs wipe, so while the burgundy
// columns cover the page the old shape turns and shrinks away and the new one
// turns and grows in: transform and opacity only. Ivory reads on midnight,
// burgundy and the wipe. Pages without a mark (the 404) show none. Hidden
// while the menu is open or the intro is showing. Reduced motion: it swaps.

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useReduced } from "@/lib/hooks";
import { ease, shapes as cfg } from "@/lib/motion";
import { halfPath, pageMarks, quarterPath, starPoints, type Kind } from "@/lib/shapes";
import { color, tokens } from "@/lib/tokens";
import { useMenu } from "./menu-state";
import { useUnderTicker } from "./nav";

const GAP = Number.parseFloat(tokens.spacing.tokens.find((t) => t.name === "space-3")?.value ?? "0");
const S = cfg.markSize;

function MarkShape({ kind }: { kind: Kind }) {
  const r = S / 2;
  return (
    <svg width={S} height={S} viewBox={`${-r} ${-r} ${S} ${S}`} aria-hidden="true" focusable="false">
      {kind === "disc" && <circle r={r} fill={color.ivory} />}
      {kind === "half" && <path d={halfPath(r)} transform={`translate(0 ${r / 2})`} fill={color.ivory} />}
      {kind === "quarter" && <path d={quarterPath(S)} fill={color.ivory} />}
      {kind === "star" && <polygon points={starPoints(r)} fill={color.ivory} />}
      {kind === "square" && <rect x={-r * 0.8} y={-r * 0.8} width={r * 1.6} height={r * 1.6} fill={color.ivory} />}
    </svg>
  );
}

export function PageMark() {
  const pathname = usePathname();
  const reduced = useReduced();
  const { open } = useMenu();
  const y = useUnderTicker();
  const [left, setLeft] = useState<number | null>(null);
  const kind = pageMarks.find((m) => m.match(pathname))?.kind ?? null;

  // Sit just right of the nav name, whatever its width.
  useEffect(() => {
    const name = document.getElementById("nav-name");
    if (!name) return;
    const measure = () => setLeft(name.getBoundingClientRect().right + GAP);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(name);
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const swap = reduced ? { duration: 0 } : { duration: cfg.markSwap, ease: ease.inOut };
  return (
    <motion.div
      aria-hidden="true"
      className="page-mark pointer-events-none fixed top-0 z-85 flex h-nav items-center"
      style={{ y, left: left ?? 0, opacity: left === null || open ? 0 : 1 }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {kind ? (
          <motion.span
            key={kind}
            className="block"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={swap}
          >
            <MarkShape kind={kind} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
