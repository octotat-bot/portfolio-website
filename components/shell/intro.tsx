"use client";

// M01 loader. On the first page load of a session, a run of hard cuts:
//   0.0 picture 1 · 0.6 "NEED MONEY" · 1.1 picture 2 · 1.7 "FOR" ·
//   2.1 picture 3 · 2.7 "FERRARI." in claret · 3.3 shut.
// Meanwhile a closing shutter: two midnight bars grow from the top and bottom
// edges (scaleY, one shared value), so picture 1 is full-screen, picture 2 a
// letterbox and picture 3 a slit. The word cards sit above the bars, full
// midnight. At 3.3 the bars meet; then they part, top up and bottom down, and
// the page shows through the gap. Its entrance starts 0.15s into that.
// Timings are in lib/motion.ts (intro); the beats come from content/site.ts
// (intro.loaderSlides). A small 000 to 100 counter runs bottom-left, and the
// grain sits over everything until the bars part.
//
// - All pictures are preloaded first (the head script adds preload links).
//   If they are not ready within 1 second, the loader shows the word cards only.
// - Any click, key, wheel or touch skips straight to the bars parting.
// - Adding ?intro to any URL clears the session flag, so the loader plays again.
// - Scroll stays locked until the bars have parted; then the loader unmounts.
// - Reduced motion: no shutter and no push-in. The three word cards, 0.4s
//   each, then a cut to the page.
// - The pictures are aria-hidden. The line is real text that screen readers
//   hear once: "need money for ferrari".
//
// The screen is in the server HTML. The inline head script sets data-intro on
// <html> before first paint when the loader should run, and CSS shows it only
// then, so the page never flashes underneath.

import { useLenis } from "lenis/react";
import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { setCurtain } from "@/lib/curtain";
import { ease, intro } from "@/lib/motion";
import { lockScroll } from "./smooth-scroll";

const slides = site.intro.loaderSlides;
const images = slides.map((s) => s.image);

/** Before first paint: decide whether to run, and start loading the pictures. */
export const INTRO_SCRIPT = `try{if(new URLSearchParams(location.search).has("intro"))sessionStorage.removeItem(${JSON.stringify(intro.storageKey)});if(!sessionStorage.getItem(${JSON.stringify(intro.storageKey)})){var d=document.documentElement;d.setAttribute("data-intro",matchMedia("(prefers-reduced-motion: reduce)").matches?"still":"");if(d.getAttribute("data-intro")===""){${JSON.stringify(images)}.forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=h;document.head.appendChild(l)})}}}catch(e){}`;

/** The whole line, as screen readers hear it. */
const SPOKEN = slides
  .map((s) => s.word)
  .join(" ")
  .toLowerCase()
  .replace(/[^\p{L}\p{N} ]/gu, "")
  .trim();

type Word = { kind: "word"; text: string; accent: boolean; hold: number };
type Beat = { kind: "image"; src: string; hold: number } | Word;

const wordHold = (i: number) => intro.wordHolds[Math.min(i, intro.wordHolds.length - 1)];

function beats(withImages: boolean): Beat[] {
  return slides.flatMap((s, i) => {
    const word: Beat = { kind: "word", text: s.word, accent: !!s.accent, hold: wordHold(i) };
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

/** A full-screen midnight word card in monument size, scaled down only if it would overflow a phone. */
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
    <div className="absolute inset-0 flex items-center justify-center bg-midnight px-4 md:px-10">
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

type Phase = "beats" | "reveal" | "gone";

export function Intro() {
  const counter = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const started = useRef(false);
  const [beat, setBeat] = useState<Beat | null>(null);
  const [phase, setPhase] = useState<Phase>("beats");
  // 0 = open, 1 = the bars meet in the middle. Both bars share it.
  const shut = useMotionValue(0);
  const topY = useMotionValue("0%");
  const bottomY = useMotionValue("0%");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const root = document.documentElement;
    const mode = root.getAttribute("data-intro");
    if (mode === null) {
      // No loader this time: take the hidden screen out of the DOM.
      setPhase("gone");
      return;
    }
    const unlock = lockScroll(lenis);
    const show = (n: number) => {
      if (counter.current) counter.current.textContent = pad(n);
    };
    let isSkipped = false;
    let skip: () => void = () => {};
    const skipped = new Promise<void>((resolve) => (skip = resolve));
    const events = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    const onSkip = () => {
      isSkipped = true;
      skip();
    };
    events.forEach((e) => window.addEventListener(e, onSkip, { passive: true }));
    const stopListening = () => events.forEach((e) => window.removeEventListener(e, onSkip));

    const end = () => {
      root.removeAttribute("data-intro");
      unlock();
      setPhase("gone");
    };

    void (async () => {
      if (mode === "still") {
        // Reduced motion: the word cards, then a cut. No shutter, no push-in.
        show(100);
        for (const b of beats(false)) {
          setBeat(b);
          await Promise.race([new Promise<void>((r) => window.setTimeout(r, intro.reducedHold * 1000)), skipped]);
          if (isSkipped) break;
        }
        stopListening();
        try {
          sessionStorage.setItem(intro.storageKey, "1");
        } catch {}
        setCurtain("clear");
        end();
        return;
      }

      const ready = await Promise.race([preload(intro.preloadBudget), skipped.then(() => false)]);
      const list = beats(ready);
      const total = list.reduce((sum, b) => sum + b.hold, 0);
      const t0 = performance.now();
      // Every beat is timed from the same start, so the cuts stay on the shutter's clock.
      const until = (t: number) =>
        Promise.race([
          new Promise<void>((r) => window.setTimeout(r, Math.max(0, t * 1000 - (performance.now() - t0)))),
          skipped,
        ]);
      const count = animate(0, 100, { duration: total, ease: "linear", onUpdate: show });
      const { at, value, ease: segment } = intro.shutter;
      const last = at[at.length - 1];
      const closing = ready
        ? animate(shut, [...value], { duration: last, times: at.map((t) => t / last), ease: at.slice(1).map(() => segment) })
        : null;

      let clock = 0;
      for (const b of list) {
        if (isSkipped) break;
        setBeat(b);
        clock += b.hold;
        await until(clock);
      }
      count.stop();
      closing?.stop();
      stopListening();
      show(100);

      // Shut, then part the bars to show the page.
      shut.set(1);
      setBeat(null);
      setPhase("reveal");
      try {
        sessionStorage.setItem(intro.storageKey, "1");
      } catch {}
      const hero = window.setTimeout(() => setCurtain("clear"), intro.heroDelay * 1000);
      const part = { duration: intro.reveal, ease: ease.inOut };
      await Promise.all([animate(topY, "-100%", part), animate(bottomY, "100%", part)]);
      window.clearTimeout(hero);
      setCurtain("clear");
      end();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;
  const revealing = phase === "reveal";

  return (
    <div className={`intro fixed inset-0 z-75 overflow-hidden ${revealing ? "pointer-events-none" : "bg-midnight"}`}>
      <p className="sr-only">{SPOKEN}</p>
      <div aria-hidden="true" className="absolute inset-0">
        {beat?.kind === "image" ? (
          <motion.img
            key={beat.src}
            src={beat.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: intro.push }}
            animate={{ scale: 1 }}
            transition={{ duration: beat.hold, ease: "linear" }}
          />
        ) : null}
        <motion.div className="shutter-top" style={{ scaleY: shut, y: topY }} />
        <motion.div className="shutter-bottom" style={{ scaleY: shut, y: bottomY }} />
        {beat?.kind === "word" ? <WordCard key={beat.text} text={beat.text} accent={beat.accent} /> : null}
        {revealing ? null : (
          <>
            <div className="absolute bottom-6 left-4 flex flex-col gap-1 md:bottom-10 md:left-10">
              <p className="label text-ash">{site.intro.line}</p>
              <p className="poster-4 tabular-nums text-ivory">
                <span ref={counter}>000</span>
              </p>
            </div>
            <div className="grain" />
          </>
        )}
      </div>
    </div>
  );
}
