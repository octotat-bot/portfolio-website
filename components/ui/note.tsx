"use client";

// Note: a typed margin note in Mukund's own voice.
// M10 typed note: when it enters view it types itself at 35ms a character with
// a block caret; the caret blinks three times and goes; then the note "boils",
// nudging 1px and half a degree three times a second. Changing `text` retypes
// it (the menu uses this). Notes never carry information a visitor needs.
// With reduced motion the full note is shown, still.

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useStageClear } from "@/lib/curtain";
import { useReduced } from "@/lib/hooks";
import { typedNote } from "@/lib/motion";

type Props = {
  text: string;
  /** claret on midnight, ivory on burgundy. */
  tone?: "claret" | "ivory";
  /** Degrees, 2 to 5 either way. */
  tilt?: number;
  /** note (34px) or scrawl (72px). */
  size?: "note" | "scrawl";
  className?: string;
  /** Start typing on mount instead of on entering view. */
  immediate?: boolean;
  /** Extra gate: the note waits for this as well, e.g. until a sentence has assembled. */
  when?: boolean;
};

type Phase = "idle" | "typing" | "blinking" | "boiling";

export function Note({ text, tone = "claret", tilt = -3, size = "note", className = "", immediate = false, when = true }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const typed = useRef<HTMLSpanElement>(null);
  const reduced = useReduced();
  const clear = useStageClear();
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [phase, setPhase] = useState<Phase>("idle");
  const go = (immediate || inView) && clear && when;

  useEffect(() => {
    const node = typed.current;
    if (!node) return;
    if (reduced) {
      node.textContent = text;
      setPhase("idle");
      return;
    }
    if (!go) {
      node.textContent = "";
      return;
    }
    const chars = Array.from(text);
    setPhase("typing");
    const controls = animate(0, chars.length, {
      duration: chars.length * typedNote.perChar,
      ease: "linear",
      onUpdate: (n) => (node.textContent = chars.slice(0, Math.round(n)).join("")),
      onComplete: () => {
        node.textContent = text;
        setPhase("blinking");
      },
    });
    return () => controls.stop();
  }, [text, go, reduced]);

  const style = { "--tilt": `${tilt}deg` } as CSSProperties;
  const colour = tone === "claret" ? "text-claret" : "text-ivory";

  return (
    <p ref={ref} className={`${size} ${colour} note-tilt ${className}`} style={style} data-boil={phase === "boiling"}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        <span ref={typed}>{text}</span>
        {phase === "typing" || phase === "blinking" ? (
          <span
            className="note-caret"
            data-blink={phase === "blinking"}
            onAnimationEnd={() => setPhase("boiling")}
          />
        ) : null}
      </span>
    </p>
  );
}
