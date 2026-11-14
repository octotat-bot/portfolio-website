import type { Metadata } from "next";
import { AlsoBuilt } from "@/components/sections/work/also-built";
import { CursorTrail } from "@/components/sections/work/cursor-trail";
import { WordWall } from "@/components/sections/work/word-wall";
import { WorkTiles } from "@/components/sections/work/work-tiles";
import { work } from "@/content/pages";
import { alsoBuilt, caseStudies } from "@/content/projects";
import { site } from "@/content/site";
import { existingCovers, projectMedia } from "@/lib/media";

export const metadata: Metadata = { title: site.meta.work.title, description: site.meta.work.description };

// Work: a wall of one word behind the projects. The wall's claret line is the h1.
export default function WorkPage() {
  const tiles = caseStudies.map((p) => ({
    slug: p.slug,
    name: p.name,
    kind: p.kind,
    year: p.year,
    caption: p.study.caption,
    cover: projectMedia(p.slug).cover,
  }));

  return (
    <main id="main" className="relative">
      <WordWall word={work.wallWord} line={work.wallLine} />
      <CursorTrail covers={existingCovers(caseStudies.map((p) => p.slug))} />
      <WorkTiles tiles={tiles} />
      <AlsoBuilt projects={alsoBuilt} />
    </main>
  );
}
