"use client";

// M05 scramble label. Characters cycle through random A–Z and digits and
// resolve left to right in about 600ms. Runs when it enters view, on hover of
// the nearest [data-scramble-hover] ancestor or itself, and whenever `text`
// changes (the status line cycles through its lines this way).
//
// Started from React Bits "Decrypted Text" (reactbits.dev, MIT + Commons
// Clause), cut down to the scramble effect, its timing moved onto Motion's
// animate(), its pool limited to A–Z and digits, its styling removed.
// Labels are set in Geist Mono, so every character has the same width and
// nothing reflows while it scrambles.

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState, type ElementType } from "react";
import { useStageClear } from "@/lib/curtain";
import { useReduced } from "@/lib/hooks";
import { scramble } from "@/lib/motion";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** "view" scrambles once when it enters view; "hover" on pointer or focus; "both". */
  trigger?: "view" | "hover" | "both" | "none";
  /** What screen readers get, if not `text` (e.g. every line of a cycling label). */
  srText?: string;
};

const isBlank = (char: string) => /\s/.test(char);
const randomChar = () => scramble.pool[Math.floor(Math.random() * scramble.pool.length)];

function scrambled(text: string, resolved: number): string {
  return Array.from(text)
    .map((char, i) => (i < resolved || isBlank(char) ? char : randomChar()))
    .join("");
}

export function Scramble({ text, as: Tag = "span", className, trigger = "view", srText }: Props) {
  const ref = useRef<HTMLElement>(null);
  const visual = useRef<HTMLSpanElement>(null);
  const reduced = useReduced();
  const clear = useStageClear();
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [hoverKey, setHoverKey] = useState(0);
  const firstText = useRef(text);
  const played = useRef(false);

  const run = (target: string) => {
    const node = visual.current;
    if (!node) return () => {};
    if (reduced) {
      node.textContent = target;
      return () => {};
    }
    const length = Array.from(target).length;
    let lastStep = -1;
    const controls = animate(0, scramble.duration, {
      duration: scramble.duration,
      ease: "linear",
      onUpdate: (t) => {
        const step = Math.floor(t / scramble.step);
        if (step === lastStep) return;
        lastStep = step;
        node.textContent = scrambled(target, Math.floor((t / scramble.duration) * length));
      },
      onComplete: () => {
        node.textContent = target;
      },
    });
    return () => {
      controls.stop();
      node.textContent = target;
    };
  };

  // Enter view, once.
  useEffect(() => {
    if (!(trigger === "view" || trigger === "both") || !inView || !clear || played.current) return;
    played.current = true;
    return run(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, clear]);

  // Text changed.
  useEffect(() => {
    if (text === firstText.current) return;
    firstText.current = text;
    return run(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Hover or focus.
  useEffect(() => {
    if (hoverKey === 0) return;
    return run(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverKey]);

  const hoverable = trigger === "hover" || trigger === "both";
  const replay = () => setHoverKey((k) => k + 1);

  return (
    <Tag
      ref={ref}
      className={className}
      onMouseEnter={hoverable ? replay : undefined}
      onFocus={hoverable ? replay : undefined}
    >
      <span className="sr-only">{srText ?? text}</span>
      <span ref={visual} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
