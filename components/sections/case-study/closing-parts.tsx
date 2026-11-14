"use client";

// Case study 5 to 7.
//   One number, one mistake: two cells on a hairline grid, a figure in
//   poster-2 counting up (M19) with its caption, and a short paragraph
//   headed "what went wrong". Blank cells are left out; with both blank the
//   section is not shown.
//   Note: one typed Note (M10).
//   Next project: a full-bleed link block, "next" and the next project's name
//   in poster-1; it fills burgundy from the left on hover or focus (M07,
//   scaled up). See .next-project in globals.css.

import { CountUp } from "@/components/motion/count-up";
import { TransitionLink } from "@/components/shell/wipe";
import { Note } from "@/components/ui/note";
import { caseStudy } from "@/content/pages";
import type { CaseStudy } from "@/content/projects";

export function NumberMistake({ study }: { study: CaseStudy }) {
  const { number, mistake } = study;
  const hasNumber = number.value !== null;
  if (!hasNumber && !mistake) return null;
  return (
    <section className="px-4 py-16 md:px-10">
      <div className="grid border-t border-line md:grid-cols-2">
        {hasNumber ? (
          <div className="flex flex-col gap-3 border-b border-line py-10 md:border-r md:pr-10">
            <p className="poster-2">
              <CountUp value={number.value as number} />
            </p>
            {number.caption ? <p className="label text-ash">{number.caption}</p> : null}
          </div>
        ) : null}
        {mistake ? (
          <div className="flex flex-col gap-3 border-b border-line py-10 md:pl-10">
            <h2 className="poster-4">{caseStudy.mistakeHeading}</h2>
            <p className="body max-w-measure">{mistake}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function StudyNote({ text }: { text: string }) {
  return (
    <section className="px-4 py-16 md:px-10">
      <Note text={text} tilt={-3} />
    </section>
  );
}

export function NextProject({ slug, name }: { slug: string; name: string }) {
  return (
    <TransitionLink
      href={`/work/${slug}`}
      className="next-project relative flex flex-col gap-3 overflow-hidden border-t border-line px-4 py-24 md:px-10"
    >
      <span className="next-label label">{caseStudy.nextLabel}</span>
      <span className="poster-1">{name}</span>
    </TransitionLink>
  );
}
