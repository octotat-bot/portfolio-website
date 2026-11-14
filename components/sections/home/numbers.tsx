"use client";

// Home 6: numbers. A full-bleed burgundy dither field (M08) with three figures
// in a row, stacked on phones: the number in poster-1 counting up (M19) and
// its caption in `label`. A figure that is still a blank shows a dash.

import { CountUp } from "@/components/motion/count-up";
import { DitherField } from "@/components/motion/dither-field";
import { site } from "@/content/site";

export function Numbers() {
  return (
    <DitherField className="px-4 py-32 md:px-10">
      {/* On phones the dithered crest is taller relative to the width; keep the first figure below it. */}
      <div aria-hidden="true" className="h-24 md:hidden" />
      <ul className="grid gap-16 md:grid-cols-3 md:gap-10">
        {site.numbers.map((n) => (
          <li key={n.caption} className="flex flex-col gap-3">
            <p className="poster-1 text-ivory">{n.value === null ? site.blank : <CountUp value={n.value} />}</p>
            <p className="label text-ivory">{n.caption}</p>
          </li>
        ))}
      </ul>
    </DitherField>
  );
}
