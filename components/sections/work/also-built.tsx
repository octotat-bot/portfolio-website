"use client";

// Work 3: also built. A hairline list on midnight: the name in poster-4
// rising in (M03 per row), one line in `body`, and the project's links as
// RollLinks at the right. Links that are still blanks are left out.

import { RevealText } from "@/components/motion/reveal-text";
import { RollLink } from "@/components/ui/roll-link";
import { caseStudy, work } from "@/content/pages";
import type { Project } from "@/content/projects";

export function AlsoBuilt({ projects }: { projects: Project[] }) {
  return (
    <section className="relative z-10 flex flex-col gap-6 bg-midnight px-4 py-32 md:px-10">
      <h2 className="label text-ash">{work.alsoBuiltLabel}</h2>
      <ul className="border-t border-line">
        {projects.map((p) => {
          const links = (["repo", "live"] as const).flatMap((kind) => {
            const href = p.links[kind];
            return href ? [{ kind, href }] : [];
          });
          return (
            <li key={p.slug} className="flex flex-col gap-4 border-b border-line py-6 md:flex-row md:items-end md:justify-between md:gap-10">
              <div className="flex min-w-0 flex-col gap-2">
                <RevealText as="h3" text={p.name} className="poster-4" />
                <p className="body max-w-measure text-ash">{p.oneLiner}</p>
              </div>
              {links.length ? (
                <div className="flex shrink-0 gap-6">
                  {links.map((link) => (
                    <RollLink key={link.kind} href={link.href}>
                      {caseStudy.linkLabels[link.kind]}
                    </RollLink>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
