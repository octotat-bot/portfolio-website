"use client";

// Case study 1: header band. A 50dvh burgundy dither field (M08). The tag
// top-left (scrambles in, M05); the project name in `monument` bottom-left,
// rising (M03) then shuffling its faces (M04). A long name may run off the
// right edge.

import { DitherField } from "@/components/motion/dither-field";
import { RevealText } from "@/components/motion/reveal-text";
import { Label } from "@/components/ui/label";

export function HeaderBand({ name, kind }: { name: string; kind: string }) {
  return (
    <DitherField className="case-header flex flex-col justify-between gap-10 px-4 pb-6 pt-24 md:px-10 md:pb-10">
      <Label tag scramble="view" className="self-start">
        {kind}
      </Label>
      <RevealText as="h1" text={name} shuffle className="monument whitespace-nowrap text-ivory" />
    </DitherField>
  );
}
