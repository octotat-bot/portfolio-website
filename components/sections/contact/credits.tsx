"use client";

// Contact 2: credits. A burgundy dither field (M08), pinned. M24 perspective
// credits: the lines, each a small `label` over a poster-3 line, sit on a
// plane leaning back about 50 degrees from the bottom of the screen and crawl
// up it and away into the distance as you scroll the section. Near the
// bottom of the screen a line fades in, and it fades out as it shrinks into
// the distance (opacity only: MOTION.md
// allows blur only in M12, and the site has no gradients). It ends on the
// typed note "thanks for scrolling" (M10, scrawl size, ivory on burgundy).
//
// Started from Skiper UI "skiper28" (3D perspective text, skiper-ui.com, free
// with attribution): a sticky stage with perspective and a block whose
// rotateX/translateY follows scroll; framer-motion replaced by motion/react,
// its Lenis wrapper, demo text and gradient fade removed.
// With reduced motion: flat, readable lines in place and the note shown.

import { frame, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { DitherField } from "@/components/motion/dither-field";
import { Note } from "@/components/ui/note";
import { contact } from "@/content/pages";
import { useReduced } from "@/lib/hooks";
import { credits } from "@/lib/motion";

function Lines({ refs }: { refs?: React.RefObject<(HTMLLIElement | null)[]> }) {
  return (
    <ol className="flex flex-col gap-16 text-center">
      {contact.credits.map((c, i) => (
        <li
          key={c.big}
          ref={(el) => {
            if (refs) refs.current[i] = el;
          }}
          className="flex flex-col gap-3"
        >
          <span className="label text-ivory">{c.small}</span>
          <span className="poster-3 text-ivory">{c.big}</span>
        </li>
      ))}
    </ol>
  );
}

function Crawl() {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const lines = useRef<(HTMLLIElement | null)[]>([]);
  const [noteOn, setNoteOn] = useState(false);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // From just below the plane's foot to past the horizon, in plane pixels.
  const y = useTransform(scrollYProgress, [0, credits.crawlEnd], [0, -travel]);

  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => setTravel(el.offsetHeight + window.innerHeight * credits.beyond);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Soft edges, opacity only: a line fades in as it rises from the bottom
  // of the screen, and fades out as it shrinks into the distance (its drawn
  // height against its real height).
  const fade = () => {
    const h = window.innerHeight;
    const edge = h * credits.edge;
    for (const el of lines.current) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const bottom = Math.min(1, Math.max(0, (h - (r.top + r.height / 2)) / edge));
      const size = r.height / Math.max(1, el.offsetHeight);
      const far = Math.min(1, Math.max(0, (size - credits.fadeFrom) / (credits.fadeTo - credits.fadeFrom)));
      el.style.opacity = String(Math.min(bottom, far));
    }
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    frame.postRender(fade);
    if (p >= credits.noteAt) setNoteOn(true);
  });

  return (
    <section ref={section} className="relative" style={{ height: credits.height }}>
      <DitherField className="sticky top-0 h-dvh">
        <div className="absolute inset-0 overflow-hidden" style={{ perspective: credits.perspective, perspectiveOrigin: "50% 30%" }}>
          {/* The plane: as tall as the screen, hinged at its foot, leaning back. */}
          <div className="absolute inset-0" style={{ transform: `rotateX(${credits.tilt}deg)`, transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}>
            <motion.div ref={list} className="absolute inset-x-0 top-full px-4 md:px-10" style={{ y }}>
              <Lines refs={lines} />
            </motion.div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-16 flex justify-center px-4">
          <Note text={contact.finalNote} tone="ivory" size="scrawl" tilt={-3} when={noteOn} immediate />
        </div>
      </DitherField>
    </section>
  );
}

export function Credits() {
  const reduced = useReduced();
  if (reduced) {
    return (
      <DitherField className="flex flex-col items-center gap-16 px-4 py-32 md:px-10">
        <Lines />
        <Note text={contact.finalNote} tone="ivory" size="scrawl" tilt={-3} />
      </DitherField>
    );
  }
  return <Crawl />;
}
