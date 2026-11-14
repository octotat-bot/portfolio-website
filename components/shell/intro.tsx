"use client";

// M01 intro counter. On the first page load of a session: a midnight screen,
// an Anton counter running 000 to 100 bottom-left while fonts and the page
// load, and a mono line that reads "loading". At 100 the wipe (M02) lifts it
// away. A session flag means it runs once. Skipped with reduced motion.
//
// The screen is in the server HTML. An inline script in <head> (INTRO_SCRIPT)
// sets data-intro on <html> before first paint when the intro should run, and
// CSS shows the screen only then, so the page never flashes underneath it.

import { useLenis } from "lenis/react";
import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { setCurtain } from "@/lib/curtain";
import { intro } from "@/lib/motion";
import { ease } from "@/lib/tokens";
import { lockScroll } from "./smooth-scroll";
import { useWipe } from "./wipe";

export const INTRO_SCRIPT = `try{if(!sessionStorage.getItem(${JSON.stringify(intro.storageKey)})&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute("data-intro","")}}catch(e){}`;

const pad = (n: number) => String(Math.round(n)).padStart(3, "0");

const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

export function Intro() {
  const counter = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const { play } = useWipe();
  const started = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (started.current || !root.hasAttribute("data-intro")) return;
    started.current = true;
    const unlock = lockScroll(lenis);
    const show = (n: number) => {
      if (counter.current) counter.current.textContent = pad(n);
    };

    void (async () => {
      // Run to 90 over the minimum time, hold until fonts and the page are in, then finish.
      await Promise.all([
        animate(0, 90, { duration: intro.minDuration, ease: ease.out, onUpdate: show }),
        document.fonts.ready,
        pageLoaded(),
      ]);
      await animate(90, 100, { duration: 0.25, ease: "linear", onUpdate: show });
      try {
        sessionStorage.setItem(intro.storageKey, "1");
      } catch {}
      await play({
        onCovered: () => {
          root.removeAttribute("data-intro");
          unlock();
          setCurtain("covered");
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="intro fixed inset-0 z-75 bg-midnight" aria-hidden="true">
      <div className="absolute bottom-6 left-4 flex flex-col gap-3 md:bottom-10 md:left-10">
        <p className="label text-ash">{site.intro.line}</p>
        <p className="poster-1 tabular-nums">
          <span ref={counter}>000</span>
        </p>
      </div>
    </div>
  );
}
