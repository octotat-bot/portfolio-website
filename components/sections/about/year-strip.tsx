"use client";

// About 3: the road so far. M17 year strip: from 810px the section pins for
// 300vh and a row of six wide year cards moves sideways as you scroll down.
// Every card is at full strength; the card nearest the centre has its year in
// claret (a crossfade between two copies, opacity only), and NOW always does.
// One hairline joins the years (down the side on phones). Each card: year in poster-1, title in poster-4, a
// line in `lede`, a mono place label (left out while it is a blank).
// Below 810px, and with reduced motion: a normal vertical list.

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { NavFade } from "@/components/motion/nav-fade";
import { RevealText } from "@/components/motion/reveal-text";
import { Label } from "@/components/ui/label";
import { about } from "@/content/about";
import type { YearCard } from "@/content/about";
import { useReduced } from "@/lib/hooks";
import { yearStrip } from "@/lib/motion";

function Card({ card, active }: { card: YearCard; active: boolean }) {
  return (
    <article className="flex flex-col gap-3 pt-6">
      <p className="poster-1 relative">
        <span className="text-ivory">{card.year}</span>
        <span aria-hidden="true" className="year-on absolute inset-0 text-claret" style={{ opacity: active || card.year === "NOW" ? 1 : 0 }}>
          {card.year}
        </span>
      </p>
      <h3 className="poster-4">{card.title}</h3>
      <p className="lede max-w-measure text-ivory">{card.text}</p>
      {card.place ? <Label>{card.place}</Label> : null}
    </article>
  );
}

function List() {
  return (
    <ol className="flex flex-col gap-16 border-l border-line pl-6">
      {about.road.map((card) => (
        <li key={card.year}>
          <NavFade>
            <Card card={card} active={false} />
          </NavFade>
        </li>
      ))}
    </ol>
  );
}

/** The card width as a CSS variable, read by .year-strip and .year-card. */
const cardWidth = { "--card": `${yearStrip.cardWidth}vw` } as CSSProperties;

function Strip() {
  const section = useRef<HTMLElement>(null);
  const strip = useRef<HTMLOListElement>(null);
  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -p * travel);

  useLayoutEffect(() => {
    const el = strip.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The card whose centre is nearest the middle of the screen.
  useMotionValueEvent(x, "change", () => {
    const cards = strip.current?.children;
    if (!cards) return;
    const middle = window.innerWidth / 2;
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    Array.from(cards).forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - middle);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    setActive(best);
  });

  return (
    <section ref={section} className="relative" style={{ height: yearStrip.height }}>
      <div className="sticky top-0 flex h-dvh flex-col justify-center gap-16 overflow-hidden">
        <div className="px-10">
          <RevealText as="h2" text={about.roadHeading} className="poster-3" />
        </div>
        <motion.ol
          ref={strip}
          className="year-strip flex w-max gap-16 border-t border-line"
          style={{ x, ...cardWidth }}
        >
          {about.road.map((card, i) => (
            <li
              key={card.year}
              className="year-card shrink-0"
            >
              <Card card={card} active={i === active} />
            </li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

export function YearStrip() {
  const reduced = useReduced();
  if (reduced) {
    return (
      <section className="flex flex-col gap-16 px-4 py-32 md:px-10">
        <RevealText as="h2" text={about.roadHeading} className="poster-3" />
        <List />
      </section>
    );
  }
  return (
    <>
      <section className="flex flex-col gap-16 px-4 py-32 md:hidden">
        <RevealText as="h2" text={about.roadHeading} className="poster-3" />
        <List />
      </section>
      <div className="hidden md:block">
        <Strip />
      </div>
    </>
  );
}
