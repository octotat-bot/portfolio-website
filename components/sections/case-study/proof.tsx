"use client";

// Case study 4: proof.
//   No screens yet: empty hairline frames labelled "screens coming".
//   One or two: full width, one per row, with an optional small caption.
//   Three or more: M28 gallery. From 810px, columns that scroll at different
//   speeds; below 810px, a swipe carousel whose other slides are clipped.
// Media uses radius-sm and rests as a dither until 60% in view (M15). A demo
// video, if there is one, comes first. Each picture fades in the nav zone.
// With reduced motion the gallery is a plain vertical list.
//
// The columns started from Skiper UI "skiper30" (Oliver parallax, skiper-ui
// .com, free with attribution): columns moved by one scroll value at
// different rates; its own Lenis loop, demo images and styling are removed.
// The carousel follows Skiper UI "skiper54" (clip-path carousel) in idea only:
// that file needs Embla, the shadcn carousel and an icon library, none of
// which this site may use, so it is native scroll-snap with Motion clip-paths.

import { motion, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { DitherImage } from "@/components/motion/dither-image";
import { NavFade } from "@/components/motion/nav-fade";
import { Label } from "@/components/ui/label";
import { caseStudy } from "@/content/pages";
import type { Maybe } from "@/content/types";
import { useReduced } from "@/lib/hooks";
import type { Picture } from "@/lib/media";
import { dur, ease, gallery, resolveAt } from "@/lib/motion";

type Props = { name: string; shots: Picture[]; captions?: Maybe<string>[]; video: string | null };

function Screen({ shot, alt, sizes }: { shot: Picture; alt: string; sizes: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: resolveAt });
  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-sm bg-midnight-raised"
      style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
    >
      <DitherImage src={shot.src} alt={alt} resolved={seen} sizes={sizes} />
    </div>
  );
}

function Column({ shots, y, alt, start }: { shots: Picture[]; y: MotionValue<number>; alt: (i: number) => string; start: number }) {
  return (
    <motion.div className="flex flex-col gap-6" style={{ y }}>
      {shots.map((shot, i) => (
        <NavFade key={shot.src}>
          <Screen shot={shot} alt={alt(start + i * 3)} sizes="33vw" />
        </NavFade>
      ))}
    </motion.div>
  );
}

function Gallery({ shots, alt }: { shots: Picture[]; alt: (i: number) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const h = typeof window === "undefined" ? 0 : window.innerHeight;
  const y0 = useTransform(scrollYProgress, [0, 1], [0, gallery.columns[0] * h]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, gallery.columns[1] * h]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, gallery.columns[2] * h]);
  const ys = [y0, y1, y2];
  const columns = [0, 1, 2].map((c) => shots.filter((_, i) => i % 3 === c));
  return (
    <div ref={ref} className="grid grid-cols-3 gap-6 overflow-hidden py-32">
      {columns.map((col, c) => (
        <Column key={c} shots={col} y={ys[c]} alt={alt} start={c} />
      ))}
    </div>
  );
}

function Carousel({ shots, alt }: { shots: Picture[]; alt: (i: number) => string }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const reduced = useReduced();
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const slide = el.firstElementChild as HTMLElement | null;
    if (!slide) return;
    setCurrent(Math.round(el.scrollLeft / (slide.offsetWidth + 16)));
  };
  return (
    <div ref={track} onScroll={onScroll} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
      {shots.map((shot, i) => (
        <motion.div
          key={shot.src}
          className="w-4/5 shrink-0 snap-center"
          initial={false}
          animate={{ clipPath: i === current ? "inset(0% 0% 0% 0%)" : "inset(8% 0% 8% 0%)" }}
          transition={{ duration: reduced ? 0 : dur.roll, ease: ease.out }}
        >
          <Screen shot={shot} alt={alt(i)} sizes="80vw" />
        </motion.div>
      ))}
    </div>
  );
}

export function Proof({ name, shots, captions = [], video }: Props) {
  const reduced = useReduced();
  const alt = (i: number) => captions[i] ?? `${name} ${i + 1}`;

  if (shots.length === 0 && !video) {
    return (
      <section className="grid gap-6 px-4 py-16 md:grid-cols-2 md:px-10">
        {[0, 1].map((i) => (
          <div key={i} className="flex aspect-16/10 items-center justify-center rounded-sm border border-line">
            <Label>{caseStudy.screensComing}</Label>
          </div>
        ))}
      </section>
    );
  }

  const rows = shots.length < 3 || reduced;
  return (
    <section className="flex flex-col gap-10 px-4 py-16 md:px-10">
      {video ? (
        <NavFade>
          <video src={video} controls muted playsInline preload="metadata" className="w-full rounded-sm" />
        </NavFade>
      ) : null}
      {rows ? (
        shots.map((shot, i) => (
          <figure key={shot.src} className="flex flex-col gap-3">
            <NavFade>
              <Screen shot={shot} alt={alt(i)} sizes="100vw" />
            </NavFade>
            {captions[i] ? <figcaption className="small text-ash">{captions[i]}</figcaption> : null}
          </figure>
        ))
      ) : (
        <>
          <div className="hidden md:block">
            <Gallery shots={shots} alt={alt} />
          </div>
          <div className="md:hidden">
            <Carousel shots={shots} alt={alt} />
          </div>
        </>
      )}
    </section>
  );
}
