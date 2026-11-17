"use client";

// M01 loader, on every full page load (first visit and every refresh, not
// moves between pages). About 4.6 seconds, no skip:
//   0 to 3.53s  31 hard-cut frames (lib/motion.ts, intro.frames): words NEED,
//               MONEY, FOR, FERRARI. and photos 1 to 4, alternating, slowing to
//               FERRARI. filling the screen (frame 7, to 1.98s), then a fast
//               loop of 60ms frames, some mirrored or inverted;
//   1.98 to 3.53s  the shutter's two black bars close in one move (half a
//               cosine), so the fast loop plays in a shrinking slit;
//   3.53s       shut: the frame goes, solid black;
//   3.65 to 4.55s  the bars part (ease-in-out) to show the page, already
//               rendered underneath; then the loader unmounts, the scroll lock
//               lifts, the page goes to the top (or the URL's #hash) and the
//               hero's entrance plays.
//
// Word frames: black, the word in burgundy Anton (inverted: burgundy, the word
// in black), centred on its capitals, the smaller of 90% of the screen width
// or a cap height of 76% of its height; the full frame fills the screen edge
// to edge. Measured on a canvas once the font has loaded. Photo frames: black,
// the photo as a cover crop anchored at its focal point, film grain on top at
// a random offset each frame; flip mirrors, invert inverts.
//
// Every frame is mounted up front, hidden; each scheduled timeout shows one
// and hides the last (a DOM attribute, no React render), so a cut is only a
// repaint and no frame is ever blank. The bars run on a Motion value.
//
// Before it starts: all photos decoded and Anton loaded, or 1.5s, whichever
// comes first. The head script (INTRO_SCRIPT) sets html.pl-cover (hides the
// page) and html.pl-lock (blocks wheel, touch and scroll keys) before
// hydration; the loader drops pl-cover as it mounts and pl-lock when it ends;
// both are released after 15s whatever happens.
// Reduced motion: only the last frame, the bars at 0.24, held 1.4s, then the
// loader fades out over 0.4s.
// The photos are aria-hidden; screen readers hear "need money for ferrari".

import { useLenis } from "lenis/react";
import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/content/site";
import { setCurtain } from "@/lib/curtain";
import { ease, intro } from "@/lib/motion";
import { lockScroll } from "./smooth-scroll";

const { words, photos, grain } = site.intro;
const frames = intro.frames;
const LAST = frames.length - 1;
const preloads = [...photos.map((p) => p.src), grain];

/**
 * Before first paint: show the loader, hide the page, block scrolling, start
 * loading the pictures, and release everything after the safety time.
 */
export const INTRO_SCRIPT = `try{var d=document.documentElement,r=matchMedia("(prefers-reduced-motion: reduce)").matches;d.setAttribute("data-intro",r?"still":"");d.classList.add("pl-cover","pl-lock");if(!r){${JSON.stringify(preloads)}.forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=h;document.head.appendChild(l)})}var k={" ":1,Spacebar:1,PageUp:1,PageDown:1,ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,Home:1,End:1},b=function(e){if(d.classList.contains("pl-lock")&&(e.type!=="keydown"||k[e.key]))e.preventDefault()};addEventListener("wheel",b,{passive:false});addEventListener("touchmove",b,{passive:false});addEventListener("keydown",b);setTimeout(function(){d.classList.remove("pl-cover","pl-lock");d.removeAttribute("data-intro")},${intro.safety * 1000})}catch(e){}`;

/** The whole line, as screen readers hear it. */
const SPOKEN = words.join(" ").toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").trim();

/** Where each frame starts, in ms from the first. */
const STARTS = frames.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + frames[i - 1].ms], []);
const END = STARTS[LAST] + frames[LAST].ms;

/** A word's place on the screen: drawn from x (left ink edge lined up), baseline y, at size px. */
type Place = { x: number; y: number; size: number };
type Fits = { w: number; h: number; words: Place[]; full: Place[] };

function measure(family: string): Fits {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ctx = document.createElement("canvas").getContext("2d");
  const none = words.map(() => ({ x: 0, y: 0, size: 0 }));
  if (!ctx) return { w, h, words: none, full: none };
  ctx.font = `400 100px ${family}`;
  const cap = ctx.measureText("H").actualBoundingBoxAscent / 100;
  const place = (word: string, widthShare: number, capShare: number): Place => {
    const m = ctx.measureText(word);
    const left = m.actualBoundingBoxLeft / 100;
    const ink = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / 100;
    const size = Math.min((widthShare * w) / ink, (capShare * h) / cap);
    return { x: (w - ink * size) / 2 + left * size, y: h / 2 + (cap * size) / 2, size };
  };
  return {
    w,
    h,
    words: words.map((word) => place(word, intro.word.width, intro.word.cap)),
    full: words.map((word) => place(word, 1, 1)),
  };
}

const halfCosine = (p: number) => (1 - Math.cos(Math.PI * p)) / 2;
const rand = (n: number) => Math.floor(Math.random() * n);

type Phase = "waiting" | "playing" | "split" | "gone";

export function Intro() {
  const lenis = useLenis();
  const started = useRef(false);
  const probe = useRef<HTMLSpanElement>(null);
  const frameEls = useRef<(HTMLDivElement | null)[]>([]);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [fits, setFits] = useState<Fits | null>(null);
  // 0 = open, 1 = the bars meet in the middle. Both bars share it.
  const shut = useMotionValue(0);
  const topY = useMotionValue("0%");
  const bottomY = useMotionValue("0%");
  const opacity = useMotionValue(1);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const html = document.documentElement;
    const mode = html.getAttribute("data-intro");
    if (mode === null) {
      setPhase("gone");
      return;
    }
    // The loader covers the page itself from here.
    html.classList.remove("pl-cover");
    const unlockScroll = lockScroll(lenis);
    const reduced = mode === "still";
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const family = probe.current ? getComputedStyle(probe.current).fontFamily : "Anton";
    const onResize = () => setFits(measure(family));

    let current: HTMLElement | null = null;
    const show = (k: number | null) => {
      current?.removeAttribute("data-on");
      current = k === null ? null : frameEls.current[k];
      if (!current || k === null) return;
      current.setAttribute("data-on", "");
      if (frames[k].kind === "photo") {
        const g = current.querySelector<HTMLElement>("[data-grain]");
        if (g) g.style.backgroundPosition = `${rand(intro.grain)}px ${rand(intro.grain)}px`;
      }
    };

    const finish = () => {
      html.removeAttribute("data-intro");
      html.classList.remove("pl-lock", "pl-cover");
      window.removeEventListener("resize", onResize);
      unlockScroll();
      // To the top, or to the URL's #hash.
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (lenis) lenis.scrollTo(target ?? 0, { immediate: true, force: true });
      else if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
      setPhase("gone");
      setCurtain("clear");
    };

    void (async () => {
      // Photos decoded and the font loaded, or the time runs out.
      const fontReady = document.fonts.load(`400 100px ${family}`, words.join("")).then(
        () => undefined,
        () => undefined,
      );
      const photosReady = reduced
        ? Promise.resolve()
        : Promise.all(
            photos.map(
              (p) =>
                new Promise<void>((resolve) => {
                  const img = new Image();
                  img.onload = () => img.decode().then(resolve, resolve);
                  img.onerror = () => resolve();
                  img.src = p.src;
                }),
            ),
          ).then(() => undefined);
      await Promise.race([
        Promise.all([fontReady, photosReady]),
        new Promise((r) => window.setTimeout(r, intro.ready * 1000)),
      ]);
      setFits(measure(family));
      window.addEventListener("resize", onResize);
      setPhase("playing");
      // Let the sized frames render before the first cut.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      if (reduced) {
        show(LAST);
        shut.set(intro.reduced.bars);
        at(intro.reduced.hold * 1000, () => {
          void animate(opacity, 0, { duration: intro.reduced.fade, ease: "linear" }).then(finish);
        });
        return;
      }

      frames.forEach((_, k) => at(STARTS[k], () => show(k)));
      // The shutter: open until frame 7 ends, then one move to shut.
      at(intro.shutter.from * 1000, () => {
        animate(shut, 1, { duration: intro.shutter.to - intro.shutter.from, ease: halfCosine });
      });
      at(END, () => {
        shut.set(1);
        show(null);
        setPhase("split");
      });
      at(END + intro.hold * 1000, () => {
        const part = { duration: intro.split, ease: ease.inOut };
        void Promise.all([animate(topY, "-100%", part), animate(bottomY, "100%", part)]).then(finish);
      });
    })();

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;
  const splitting = phase === "split";

  return (
    <motion.div
      className={`intro fixed inset-0 z-75 overflow-hidden ${splitting ? "pointer-events-none" : "bg-black"}`}
      style={{ opacity }}
    >
      <p className="sr-only">{SPOKEN}</p>
      <span ref={probe} aria-hidden="true" className="font-display pointer-events-none absolute opacity-0">
        {words.join("")}
      </span>
      <div aria-hidden="true" className="absolute inset-0">
        {fits
          ? frames.map((frame, k) => {
              const invert = frame.fx === "invert";
              const ref = (el: HTMLDivElement | null) => {
                frameEls.current[k] = el;
              };
              if (frame.kind === "word") {
                const p = frame.fx === "full" ? fits.full[frame.i] : fits.words[frame.i];
                return (
                  <div key={k} ref={ref} className={`intro-frame absolute inset-0 ${invert ? "bg-burgundy" : "bg-black"}`}>
                    <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${fits.w} ${fits.h}`}>
                      <text className={`font-display uppercase ${invert ? "fill-black" : "fill-burgundy"}`} x={p.x} y={p.y} fontSize={p.size}>
                        {words[frame.i]}
                      </text>
                    </svg>
                  </div>
                );
              }
              const photo = photos[frame.i];
              const style: CSSProperties = {
                objectPosition: `${photo.fx * 100}% ${photo.fy * 100}%`,
                transform: frame.fx === "flip" ? "scaleX(-1)" : undefined,
                filter: invert ? "invert(1)" : undefined,
              };
              return (
                <div key={k} ref={ref} className="intro-frame absolute inset-0 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt="" className="absolute inset-0 h-full w-full object-cover" style={style} />
                  <div data-grain="" className="intro-grain absolute inset-0" style={{ backgroundImage: `url(${grain})` }} />
                </div>
              );
            })
          : null}
        <motion.div className="shutter-top" style={{ scaleY: shut, y: topY }} />
        <motion.div className="shutter-bottom" style={{ scaleY: shut, y: bottomY }} />
      </div>
    </motion.div>
  );
}
