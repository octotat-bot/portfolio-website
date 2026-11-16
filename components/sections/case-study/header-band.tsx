"use client";

// Case study 1: header band. A 50dvh burgundy dither field (M08). The tag
// top-left (scrambles in, M05); the project name in `monument` bottom-left,
// rising (M03) then shuffling its faces (M04). A long name may run off the
// right edge.
// The project's poster-shape composition sits in the empty space: to the
// right of the name when there is room for it, otherwise above the name and
// right of the tag. Its box is measured from the tag and the name, so a shape
// never touches either. On burgundy it uses ivory and `line` only.

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { DitherField } from "@/components/motion/dither-field";
import { RevealText } from "@/components/motion/reveal-text";
import { ShapeComposition } from "@/components/motion/shape-composition";
import { Label } from "@/components/ui/label";
import { projectComposition } from "@/lib/shapes";
import { tokens } from "@/lib/tokens";

const px = (name: string) => Number.parseFloat(tokens.spacing.tokens.find((t) => t.name === name)?.value ?? "0");
/** Clear space kept between the composition and any text. */
const CLEAR = px("space-10");
/** Below this size there is no room worth filling. */
const MIN_BOX = 120;

export function HeaderBand({ name, kind, slug }: { name: string; kind: string; slug: string }) {
  const band = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<CSSProperties | null>(null);
  const comp = projectComposition(slug);

  useLayoutEffect(() => {
    const root = band.current;
    if (!root || !comp) return;
    const measure = () => {
      const b = root.getBoundingClientRect();
      const tagR = tag.current?.getBoundingClientRect();
      const nameR = title.current?.querySelector("[aria-hidden]")?.getBoundingClientRect();
      if (!tagR || !nameR) return;
      const gutter = px("gutter") || CLEAR;
      const top = tagR.bottom - b.top + CLEAR / 2;
      // Beside the name, if it leaves room on the right.
      const besideLeft = nameR.right - b.left + CLEAR;
      const besideWidth = b.width - besideLeft - gutter;
      const besideHeight = b.height - top - CLEAR / 2;
      if (besideWidth >= MIN_BOX * 1.5 && nameR.right < b.right - gutter) {
        setBox({ left: besideLeft, top, width: besideWidth, height: besideHeight });
        return;
      }
      // Otherwise above the name, on the right half.
      const aboveHeight = nameR.top - b.top - CLEAR / 2 - top;
      const aboveLeft = b.width / 2;
      if (aboveHeight >= MIN_BOX * 0.8) {
        setBox({ left: aboveLeft, top, width: b.width - aboveLeft - gutter, height: aboveHeight });
      } else {
        setBox(null);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [comp]);

  return (
    <div ref={band}>
      <DitherField className="case-header flex flex-col justify-between gap-10 px-4 pb-6 pt-24 md:px-10 md:pb-10">
        <div ref={tag} className="self-start">
          <Label tag scramble="view">
            {kind}
          </Label>
        </div>
        {comp && box ? (
          <div className="absolute" style={box}>
            <ShapeComposition comp={comp} surface="burgundy" />
          </div>
        ) : null}
        <div ref={title}>
          <RevealText as="h1" text={name} shuffle className="monument whitespace-nowrap text-ivory" />
        </div>
      </DitherField>
    </div>
  );
}
