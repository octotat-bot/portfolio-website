"use client";

// Case study 2: lede and facts. Left 30%: the facts as a mono definition
// list (kind, role, built with, when, status, links); the labels scramble in
// (M05). Right: the lede. On phones the lede comes first. A blank fact shows
// a dash; blank links are left out.

import type { ReactNode } from "react";
import { Scramble } from "@/components/motion/scramble";
import { RollLink } from "@/components/ui/roll-link";
import { caseStudy } from "@/content/pages";
import type { ProjectWithStudy } from "@/content/projects";
import { site } from "@/content/site";

export function LedeFacts({ project }: { project: ProjectWithStudy }) {
  const { factLabels, stackSeparator, linkLabels } = caseStudy;
  const stack = project.builtWith.filter((s): s is string => s !== null).join(stackSeparator);
  const links = (["repo", "live"] as const).flatMap((kind) => {
    const href = project.links[kind];
    return href ? [{ kind, href }] : [];
  });

  const facts: { label: string; value: ReactNode }[] = [
    { label: factLabels.kind, value: project.kind },
    { label: factLabels.role, value: project.study.role },
    { label: factLabels.builtWith, value: stack || site.blank },
    { label: factLabels.when, value: project.year ?? site.blank },
    { label: factLabels.status, value: project.study.status ?? site.blank },
    {
      label: factLabels.links,
      value: links.length ? (
        <span className="flex flex-wrap gap-x-6">
          {links.map((l) => (
            <RollLink key={l.kind} href={l.href}>
              {linkLabels[l.kind]}
            </RollLink>
          ))}
        </span>
      ) : (
        site.blank
      ),
    },
  ];

  return (
    <section className="grid gap-16 px-4 py-16 md:grid-cols-10 md:gap-10 md:px-10">
      <p className="lede max-w-measure md:order-2 md:col-span-7">{project.study.lede}</p>
      <dl className="flex flex-col md:order-1 md:col-span-3">
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col gap-1 border-t border-line py-3">
            <dt>
              <Scramble text={f.label} className="label text-ash" />
            </dt>
            <dd className="meta">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
