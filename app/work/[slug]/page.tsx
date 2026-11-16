import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextProject, NumberMistake, StudyNote } from "@/components/sections/case-study/closing-parts";
import { HeaderBand } from "@/components/sections/case-study/header-band";
import { LedeFacts } from "@/components/sections/case-study/lede-facts";
import { ProgressLine } from "@/components/sections/case-study/progress-line";
import { Proof } from "@/components/sections/case-study/proof";
import { Story } from "@/components/sections/case-study/story";
import { caseStudies, getProject } from "@/content/projects";
import { site } from "@/content/site";
import { projectMedia } from "@/lib/media";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: site.meta.caseStudy.titleTemplate.replace("%s", project.name), description: project.oneLiner };
}

// One template for every project with a case study, built from content/projects.ts
// and whatever pictures exist in public/projects/<slug>/.
export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const index = caseStudies.findIndex((p) => p.slug === slug);
  const project = caseStudies[index];
  if (!project) notFound();
  const { study } = project;
  const next = caseStudies[(index + 1) % caseStudies.length];
  const media = projectMedia(slug);

  // A project without results yet shows its lede and one story block only.
  const blocks = study.hasResults ? study.story : study.story.filter((b) => b.heading === study.showWhileBuilding);

  return (
    <main id="main">
      <ProgressLine />
      <HeaderBand name={project.name} kind={project.kind} slug={project.slug} />
      <LedeFacts project={project} />
      <Story blocks={blocks} />
      {study.hasResults ? (
        <>
          <Proof name={project.name} shots={media.shots} captions={study.screenCaptions} video={media.video} />
          <NumberMistake study={study} />
          <StudyNote text={study.note} />
        </>
      ) : null}
      <NextProject slug={next.slug} name={next.name} />
    </main>
  );
}
