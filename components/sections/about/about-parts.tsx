"use client";

// About 1, 2, 3 and 6.
//   Hero: who, first. A mono label, "I'M MUKUND." in poster-1 rising in
//   (M03), one lede line and three quick facts; beside it (below it on
//   phones) the cut-out portrait standing on a burgundy dither field (M08).
//   Bio: a mono label and a handwritten claret note (M10) at left; three
//   paragraphs in `lede` at right, in sentence case.
//   Numbers: four figures on a hairline grid (M19 count-up): the live GitHub
//   and LeetCode numbers, projects with a case study, and internships.
//   Things i believe: a numbered hairline list; each line in poster-4 rising
//   in (M03), ending on one handwritten claret word.

import Image from "next/image";
import { CountUp } from "@/components/motion/count-up";
import { DitherField } from "@/components/motion/dither-field";
import { RevealText } from "@/components/motion/reveal-text";
import { Note } from "@/components/ui/note";
import { about } from "@/content/about";
import { site } from "@/content/site";

export type AboutFigure = { value: number | null; caption: string };

export function Hero({ portrait }: { portrait: { src: string; width: number; height: number } | null }) {
  const { label, heading, line, facts } = about.hero;
  return (
    <section className="grid min-h-dvh items-center gap-10 px-4 pt-32 md:grid-cols-12 md:px-10">
      <div className="flex flex-col gap-6 md:col-span-7">
        <p className="label text-ash">{label}</p>
        <RevealText as="h1" text={heading} className="poster-1" />
        <p className="lede max-w-measure text-ivory">{line}</p>
        <ul className="flex flex-wrap gap-3">
          {facts.map((fact) => (
            <li key={fact} className="label border border-line px-3 py-2 text-ivory">
              {fact}
            </li>
          ))}
        </ul>
      </div>
      {portrait ? (
        <div className="about-portrait relative self-end md:col-span-5">
          {/* The portrait stands on a burgundy field that starts a little below its top. */}
          <div className="absolute inset-x-0 bottom-0 top-16">
            <DitherField className="h-full w-full" />
          </div>
          <Image
            src={portrait.src}
            alt="Mukund Mangla"
            width={portrait.width}
            height={portrait.height}
            sizes="(min-width: 810px) 40vw, 90vw"
            priority
            className="relative block h-auto w-full"
          />
        </div>
      ) : null}
    </section>
  );
}

export function Bio() {
  const { label, paragraphs, quote } = about.bio;
  return (
    <section className="grid gap-10 px-4 py-32 md:grid-cols-12 md:px-10">
      <div className="flex flex-col gap-6 md:col-span-4">
        <p className="label text-ash">{label}</p>
        <Note text={quote} tilt={-3} />
      </div>
      <div className="flex max-w-measure flex-col gap-6 md:col-span-8">
        {paragraphs.map((p) => (
          <p key={p} className="lede text-ivory">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export function AboutNumbers({ figures }: { figures: AboutFigure[] }) {
  return (
    <section className="px-4 md:px-10">
      <ul className="grid grid-cols-2 gap-x-10 gap-y-16 border-y border-line py-16 md:grid-cols-4">
        {figures.map((f) => (
          <li key={f.caption} className="flex flex-col gap-3">
            <p className="poster-1 text-ivory">{f.value === null ? site.blank : <CountUp value={f.value} />}</p>
            <p className="label text-ash">{f.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Beliefs() {
  return (
    <section className="flex flex-col gap-10 px-4 py-32 md:px-10">
      <h2 className="label text-ash">{about.beliefsHeading}</h2>
      <ol className="border-t border-line">
        {about.beliefs.map((b) => (
          <li key={b.number} className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:items-baseline md:gap-10">
            <span className="label text-ash md:col-span-1">{b.number}</span>
            <p className="flex flex-wrap items-baseline gap-x-4 md:col-span-11">
              <RevealText as="span" text={b.line} className="poster-4" />
              <span className="note text-claret">{b.hand}</span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
