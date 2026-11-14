"use client";

// About 1, 2 and 5.
//   Opener: a 100dvh burgundy dither field (M08) with one line in the
//   scribble style, centred, rising in (M03): one line from 810px, one word
//   per line below.
//   Bio: the page's h1 in poster-3 at left (M03); at right three short
//   paragraphs, the first in `lede`, then `body`.
//   Things i believe: a numbered hairline list, the number in `label`, the
//   line in poster-4 rising in (M03 per row); two rows sweep one word (M11).

import { DitherField } from "@/components/motion/dither-field";
import { RevealText } from "@/components/motion/reveal-text";
import { about } from "@/content/about";

export function Opener() {
  return (
    <DitherField className="opener-height flex items-center justify-center px-4 md:px-10">
      <RevealText
        as="p"
        text={about.opener}
        lines={about.openerLines}
        lineClassName="block md:inline"
        className="scribble text-center text-ivory"
      />
    </DitherField>
  );
}

export function Bio() {
  const [first, ...rest] = about.bio.paragraphs;
  return (
    <section className="grid gap-10 px-4 py-32 md:grid-cols-2 md:px-10">
      <RevealText as="h1" text={about.bio.heading} className="poster-3" />
      <div className="flex max-w-measure flex-col gap-6">
        <p className="lede">{first}</p>
        {rest.map((p) => (
          <p key={p} className="body">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export function Beliefs() {
  return (
    <section className="flex flex-col gap-10 px-4 py-32 md:px-10">
      <h2 className="label text-ash">{about.beliefsHeading}</h2>
      <ol className="border-t border-line">
        {about.beliefs.map((b) => (
          <li key={b.number} className="grid gap-3 border-b border-line py-6 md:grid-cols-12 md:items-baseline md:gap-10">
            <span className="label text-ash md:col-span-1">{b.number}</span>
            <RevealText as="p" text={b.line} highlight={b.highlight} className="poster-4 md:col-span-11" />
          </li>
        ))}
      </ol>
    </section>
  );
}
