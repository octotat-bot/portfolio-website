"use client";

// Home 6: numbers. A full-bleed burgundy dither field (M08) with three figures
// in a row, stacked on phones: the number in poster-1 counting up (M19) and
// its caption in `label`. The section is left out until at least two figures
// have values; a single remaining blank shows a dash.

import { CountUp } from "@/components/motion/count-up";
import { DitherField } from "@/components/motion/dither-field";
import { site, type SiteNumber } from "@/content/site";

/** Fewer figures than this and the section is not shown. */
const MIN_FIGURES = 2;

/** `numbers` comes from the server with live values already fetched. */
export function Numbers({ numbers }: { numbers: SiteNumber[] }) {
  if (numbers.filter((n) => n.value !== null).length < MIN_FIGURES) return null;
  return (
    <DitherField className="px-4 py-32 md:px-10">
      {/* On phones the dithered crest is taller relative to the width; keep the first figure below it. */}
      <div aria-hidden="true" className="h-24 md:hidden" />
      <ul className="grid gap-16 md:grid-cols-3 md:gap-10">
        {numbers.map((n) => (
          <li key={n.caption} className="flex flex-col gap-3">
            <p className="poster-1 text-ivory">{n.value === null ? site.blank : <CountUp value={n.value} />}</p>
            <p className="label text-ivory">{n.caption}</p>
          </li>
        ))}
      </ul>
    </DitherField>
  );
}
