"use client";

// Home 7: closing. 90dvh, midnight. The question in poster-1 rises in (M03),
// one line with a highlight sweep on one word (M11), and the primary button
// to Contact. A poster-shape composition (G1 + G2) fills the empty space to
// the right of the line and button from 1025px, and sits below them on
// smaller screens (no pointer push there).

import { Highlight } from "@/components/motion/highlight";
import { RevealText } from "@/components/motion/reveal-text";
import { ShapeComposition } from "@/components/motion/shape-composition";
import { Button } from "@/components/ui/button";
import { home } from "@/content/pages";
import { compositions } from "@/lib/shapes";

export function Closing() {
  const { headline, line, highlight, button } = home.closing;
  // The word on its own, not inside another word ("ship", not "internship").
  const match = new RegExp(`\\b${highlight}\\b`).exec(line);
  const at = match ? match.index : -1;
  return (
    <section className="closing-height flex flex-col justify-center gap-6 px-4 py-16 md:px-10">
      <RevealText as="h2" text={headline} className="poster-1" />
      <div className="shape-row">
        <div className="flex flex-col gap-6">
          <p className="lede max-w-measure">
            {at === -1 ? (
              line
            ) : (
              <>
                {line.slice(0, at)}
                <Highlight>{highlight}</Highlight>
                {line.slice(at + highlight.length)}
              </>
            )}
          </p>
          <div data-hide-pill className="pt-6">
            <Button href={button.href}>{button.label}</Button>
          </div>
        </div>
        <div className="shape-box">
          <ShapeComposition comp={compositions.closing} push />
        </div>
      </div>
    </section>
  );
}
