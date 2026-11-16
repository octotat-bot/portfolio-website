"use client";

// M01 loader, on every full page load (first visit and every refresh, not
// moves between pages). About 6.8 seconds:
//   0.0 picture 1 · 0.8 "NEED" · 1.4 picture 2 · 2.2 "MONEY" ·
//   2.8 picture 3 · 3.6 "FOR" · 4.2 picture 4 ·
//   5.0 "FERRARI." under the shutter · 5.9 shut, solid black ·
//   6.05 to 6.75 the bars part to show the page.
//
// The shutter is two black bars (scaleY from the top and bottom edges) on one
// motion value, in ONE continuous tween from open to shut over 0 to 5.9s,
// slow at first and speeding up. It never pauses or resets: it keeps running
// under the word cards, so each picture comes back where the motion left it,
// and the slit shrinks steadily across the pictures. FERRARI. sits under the
// bars, in the slit, and the bars squeeze it to a line, then black.
// Layers, bottom to top: picture, the FERRARI. card, the bars, the word
// cards, then the counter and grain. All words are burgundy on black. The
// page's entrance starts 0.15s into the bars parting. Timings: lib/motion.ts
// (intro). Beats: content/site.ts (intro.loaderSlides). Nothing re-renders
// per frame: the bars, push-in and counter run on motion values and refs.
//
// - All pictures are preloaded first (the head script adds preload links).
//   If they are not ready within 1 second, only the words play.
// - Any click, key, wheel or touch shows FERRARI. and runs the bars from
//   wherever they are to shut over 0.5s, then the hold and the reveal.
// - Scroll is locked (html.pl-lock) until the bars have parted; then the
//   loader unmounts.
// - Reduced motion: no shutter and no zoom. Each word for 0.4s, then a cut.
// - The pictures are aria-hidden. The line is real text that screen readers
//   hear once: "need money for ferrari".
//
// The screen is in the server HTML. The inline head script sets data-intro on
// <html> before first paint, and CSS shows it only then, so the page never
// flashes underneath.

import { useLenis } from "lenis/react";
import { animate, cubicBezier, motion, useMotionValue, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { setCurtain } from "@/lib/curtain";
import { ease, intro } from "@/lib/motion";
import { lockScroll } from "./smooth-scroll";

const slides = site.intro.loaderSlides;
const images = slides.map((s) => s.image);
const lastWord = slides[slides.length - 1].word;

/** Before first paint: show the loader and start loading the pictures. */
export const INTRO_SCRIPT = `try{var d=document.documentElement;d.setAttribute("data-intro",matchMedia("(prefers-reduced-motion: reduce)").matches?"still":"");if(d.getAttribute("data-intro")===""){${JSON.stringify(images)}.forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=h;document.head.appendChild(l)})}}catch(e){}`;

/** The whole line, as screen readers hear it. */
const SPOKEN = slides
  .map((s) => s.word)
  .join(" ")
  .toLowerCase()
  .replace(/[^\p{L}\p{N} ]/gu, "")
  .trim();

type Beat =
  | { kind: "image"; src: string; hold: number }
  | { kind: "word"; text: string; hold: number }
  | { kind: "slit" };

/** Picture, word, picture, word, … picture. The last word is the finale, in the slit. */
function beats(withImages: boolean): Beat[] {
  return slides.flatMap((s, i): Beat[] => {
    const image: Beat[] = withImages ? [{ kind: "image", src: s.image, hold: intro.imageHold }] : [];
    if (i === slides.length - 1) return image;
    return [...image, { kind: "word", text: s.word, hold: intro.wordHold }];
  });
}

const pad = (n: number) => String(Math.round(n)).padStart(3, "0");
const sleep = (s: number) => new Promise<void>((r) => window.setTimeout(r, s * 1000));

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

/** A full-screen black word card in monument size, burgundy, scaled down only if it would overflow a phone. */
function WordCard({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const box = el.parentElement;
      const pad = box ? Number.parseFloat(getComputedStyle(box).paddingLeft) + Number.parseFloat(getComputedStyle(box).paddingRight) : 0;
      const avail = (box ? box.clientWidth : window.innerWidth) - pad;
      setScale(Math.min(1, avail / Math.max(1, el.scrollWidth)));
    };
    fit();
    document.fonts.ready.then(fit);
  }, [text]);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black px-4 md:px-10">
      <p
        ref={ref}
        className="monument whitespace-nowrap text-center text-burgundy"
        style={{ transform: `scale(${scale})` }}
      >
        {text}
      </p>
    </div>
  );
}

type SlitFit = { w: number; h: number; size: number; baseline: number };

/**
 * The last word, centred in the shutter's slit: cap height `slitFill` of a
 * `slitSize` slit, or `widthFill` of the screen width, whichever is smaller.
 * Measured from the real font on a canvas, so the caps (not the line box) are
 * centred. Mounted from the start, hidden, so the size is ready in time.
 */
function SlitCard({ text, shown }: { text: string; shown: boolean }) {
  const probe = useRef<SVGTextElement>(null);
  const [fit, setFit] = useState<SlitFit | null>(null);
  useEffect(() => {
    let alive = true;
    const measure = async () => {
      const el = probe.current;
      if (!el) return;
      const family = getComputedStyle(el).fontFamily;
      try {
        await document.fonts.load(`400 100px ${family}`, text);
      } catch {}
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx || !alive) return;
      ctx.font = `400 100px ${family}`;
      const word = ctx.measureText(text);
      const cap = ctx.measureText("H").actualBoundingBoxAscent / 100;
      const wide = (word.actualBoundingBoxLeft + word.actualBoundingBoxRight) / 100;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const slit = intro.slitSize * h;
      const size = Math.min((intro.slitFill * slit) / cap, (intro.widthFill * w) / wide);
      setFit({ w, h, size, baseline: h / 2 + (cap * size) / 2 });
    };
    void measure();
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      window.removeEventListener("resize", measure);
    };
  }, [text]);
  return (
    <div className={`absolute inset-0 bg-black ${shown ? "" : "invisible"}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox={fit ? `0 0 ${fit.w} ${fit.h}` : undefined}>
        <text
          ref={probe}
          className="font-display fill-burgundy uppercase"
          x={fit ? fit.w / 2 : 0}
          y={fit ? fit.baseline : 0}
          fontSize={fit ? fit.size : 1}
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
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
      setPhase("gone");
      return;
    }
    const unlockScroll = lockScroll(lenis);
    root.classList.add("pl-lock");
    let shown = 0;
    const show = (n: number) => {
      shown = n;
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
    /** Wait, unless a skip comes first. */
    const wait = (s: number) => Promise.race([sleep(s), skipped]);

    const end = () => {
      root.removeAttribute("data-intro");
      root.classList.remove("pl-lock");
      unlockScroll();
      setPhase("gone");
    };

    void (async () => {
      if (mode === "still") {
        // Reduced motion: each word on its own card, then a cut.
        show(100);
        for (const s of slides) {
          setBeat({ kind: "word", text: s.word, hold: intro.reducedHold });
          await wait(intro.reducedHold);
          if (isSkipped) break;
        }
        stopListening();
        setCurtain("clear");
        end();
        return;
      }

      const ready = await Promise.race([preload(intro.preloadBudget), skipped.then(() => false)]);
      const list = beats(ready);
      const { duration, ease: curve } = intro.shutter;
      const t0 = performance.now();
      // Every beat is timed from the same start, so the cuts stay on the shutter's clock.
      const until = (t: number) => wait(Math.max(0, t - (performance.now() - t0) / 1000));
      // With the pictures: one tween, 0 to 1, from the first picture. Words
      // only: FERRARI. comes early, so the bars start from where the tween
      // would be at that point and finish over the same remaining time.
      const tail = duration - intro.ferrariAt;
      const run = list.reduce((sum, b) => sum + ("hold" in b ? b.hold : 0), 0);
      const count = animate(0, 100, { duration: run + tail, ease: "linear", onUpdate: show });
      let closing: AnimationPlaybackControls | null = ready ? animate(shut, 1, { duration, ease: curve }) : null;

      let clock = 0;
      for (const b of list) {
        if (isSkipped) break;
        setBeat(b);
        clock += "hold" in b ? b.hold : 0;
        await until(clock);
      }
      setBeat({ kind: "slit" });
      if (!isSkipped) {
        if (!closing) {
          shut.set(cubicBezier(...curve)(intro.ferrariAt / duration));
          closing = animate(shut, 1, { duration: tail, ease: "easeIn" });
        }
        await Promise.race([closing, skipped]);
      }
      stopListening();
      if (isSkipped) {
        // From wherever the bars are, shut over skipClose, FERRARI. under them.
        closing?.stop();
        count.stop();
        animate(shown, 100, { duration: intro.skipClose, ease: "linear", onUpdate: show });
        await animate(shut, 1, { duration: intro.skipClose, ease: "easeIn" });
      }
      count.stop();
      show(100);
      setBeat(null);
      await sleep(intro.shutHold);

      // Part the bars to show the page.
      setPhase("reveal");
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
    <div className={`intro fixed inset-0 z-75 overflow-hidden ${revealing ? "pointer-events-none" : "bg-black"}`}>
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
        <SlitCard text={lastWord} shown={beat?.kind === "slit"} />
        <motion.div className="shutter-top" style={{ scaleY: shut, y: topY }} />
        <motion.div className="shutter-bottom" style={{ scaleY: shut, y: bottomY }} />
        {beat?.kind === "word" ? <WordCard key={beat.text} text={beat.text} /> : null}
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
