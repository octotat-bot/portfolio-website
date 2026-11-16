"use client";

// M01 loader. On the first page load of a session, a run of hard cuts:
//   picture 1 (pushing in 1 to 1.04) · "NEED MONEY" · picture 2 · "FOR" ·
//   picture 3 · "FERRARI." in claret, held a little longer.
// Then the stairs wipe (M02), already covering, lifts away to the page.
// The beats come from content/site.ts (intro.loaderSlides). A small 000 to
// 100 counter runs bottom-left throughout, and the grain sits over everything.
// About 3 seconds of beats in all.
//
// - All pictures are preloaded first (the head script adds preload links).
//   If they are not ready within 1 second, the loader shows the word cards only.
// - Any click, key, wheel or touch skips straight to the wipe.
// - Reduced motion: one still card with the whole line, then a cut to the page.
// - The pictures are aria-hidden. The line is real text that screen readers
//   hear once: "need money for ferrari".
//
// The screen is in the server HTML. The inline head script sets data-intro on
// <html> before first paint when the loader should run, and CSS shows it only
// then, so the page never flashes underneath.

import { useLenis } from "lenis/react";
import { animate, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { setCurtain } from "@/lib/curtain";
import { intro } from "@/lib/motion";
import { lockScroll } from "./smooth-scroll";
import { useWipe } from "./wipe";

const slides = site.intro.loaderSlides;
const images = slides.map((s) => s.image);

/** Before first paint: decide whether to run, and start loading the pictures. */
export const INTRO_SCRIPT = `try{if(!sessionStorage.getItem(${JSON.stringify(intro.storageKey)})){var d=document.documentElement;d.setAttribute("data-intro",matchMedia("(prefers-reduced-motion: reduce)").matches?"still":"");if(d.getAttribute("data-intro")===""){${JSON.stringify(images)}.forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=h;document.head.appendChild(l)})}}}catch(e){}`;

/** The whole line, as screen readers hear it. */
const SPOKEN = slides
  .map((s) => s.word)
  .join(" ")
  .toLowerCase()
  .replace(/[^\p{L}\p{N} ]/gu, "")
  .trim();

type Beat = { kind: "image"; src: string; hold: number } | { kind: "word"; text: string; accent: boolean; hold: number };

function beats(withImages: boolean): Beat[] {
  return slides.flatMap((s, i) => {
    const word: Beat = {
      kind: "word",
      text: s.word,
      accent: !!s.accent,
      hold: i === slides.length - 1 ? intro.lastHold : intro.wordHold,
    };
    return withImages ? [{ kind: "image", src: s.image, hold: intro.imageHold } as Beat, word] : [word];
  });
}

const pad = (n: number) => String(Math.round(n)).padStart(3, "0");

function preload(budget: number) {
  const all = Promise.all(
    images.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => img.decode().then(resolve, resolve);
          img.onerror = reject;
          img.src = src;
        }),
    ),
  ).then(
    () => true,
    () => false,
  );
  const timeout = new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), budget * 1000));
  return Promise.race([all, timeout]);
}

/** A word card in monument size, scaled down only if it would overflow a phone. */
function WordCard({ text, accent }: { text: string; accent: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const avail = el.parentElement ? el.parentElement.clientWidth : window.innerWidth;
      setScale(Math.min(1, avail / Math.max(1, el.scrollWidth)));
    };
    fit();
    document.fonts.ready.then(fit);
  }, [text]);
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4 md:px-10">
      <p
        ref={ref}
        className={`monument whitespace-nowrap text-center ${accent ? "text-claret" : "text-ivory"}`}
        style={{ transform: `scale(${scale})` }}
      >
        {text}
      </p>
    </div>
  );
}

export function Intro() {
  const counter = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const { play } = useWipe();
  const started = useRef(false);
  const [beat, setBeat] = useState<Beat | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const mode = root.getAttribute("data-intro");
    if (started.current || mode === null) return;
    started.current = true;
    const unlock = lockScroll(lenis);
    const show = (n: number) => {
      if (counter.current) counter.current.textContent = pad(n);
    };
    let done = false;
    let skip: () => void = () => {};
    const skipped = new Promise<void>((resolve) => (skip = resolve));
    const wait = (s: number) => Promise.race([new Promise<void>((r) => window.setTimeout(r, s * 1000)), skipped]);

    const finish = async () => {
      if (done) return;
      done = true;
      show(100);
      try {
        sessionStorage.setItem(intro.storageKey, "1");
      } catch {}
      const reveal = () => {
        root.removeAttribute("data-intro");
        unlock();
      };
      if (mode === "still") {
        reveal();
        setCurtain("clear");
        return;
      }
      await play({ fromCovered: true, onCovered: reveal });
    };

    const events = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    const onSkip = () => skip();
    events.forEach((e) => window.addEventListener(e, onSkip, { passive: true }));

    void (async () => {
      if (mode === "still") {
        setStill(true);
        show(100);
        await wait(intro.reducedHold);
      } else {
        const ready = await Promise.race([preload(intro.preloadBudget), skipped.then(() => false)]);
        const list = beats(ready);
        const total = list.reduce((sum, b) => sum + b.hold, 0);
        const count = animate(0, 100, { duration: total, ease: "linear", onUpdate: show });
        for (const b of list) {
          setBeat(b);
          await wait(b.hold);
          if (done) break;
        }
        count.stop();
      }
      events.forEach((e) => window.removeEventListener(e, onSkip));
      await finish();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="intro fixed inset-0 z-75 overflow-hidden bg-midnight">
      <p className="sr-only">{SPOKEN}</p>
      <div aria-hidden="true" className="absolute inset-0">
        {still ? (
          <div className="absolute inset-0 flex items-center justify-center px-4 md:px-10">
            <p className="poster-1 text-center text-ivory">
              {slides.map((s, i) => (
                <span key={i} className={s.accent ? "text-claret" : undefined}>
                  {s.word}{" "}
                </span>
              ))}
            </p>
          </div>
        ) : beat?.kind === "image" ? (
          <motion.img
            key={beat.src}
            src={beat.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: intro.push }}
            transition={{ duration: beat.hold, ease: "linear" }}
          />
        ) : beat?.kind === "word" ? (
          <WordCard key={beat.text} text={beat.text} accent={beat.accent} />
        ) : null}
        <div className="absolute bottom-6 left-4 flex flex-col gap-1 md:bottom-10 md:left-10">
          <p className="label text-ash">{site.intro.line}</p>
          <p className="poster-4 tabular-nums text-ivory">
            <span ref={counter}>000</span>
          </p>
        </div>
        <div className="grain" />
      </div>
    </div>
  );
}
