import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/shell/placeholder-page";
import { caseStudies, getProject } from "@/content/projects";
import { site } from "@/content/site";

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

// Phase 1 placeholder. Case studies are built in Phase 3.
export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const project = getProject((await params).slug);
  if (!project?.study) notFound();
  return <PlaceholderPage title={project.name} />;
}
