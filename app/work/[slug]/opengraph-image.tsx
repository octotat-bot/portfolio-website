import { caseStudies, getProject } from "@/content/projects";
import { shareImage, shareSize, shareType } from "@/lib/share";

// Share image for a case study: the project name.
export const size = shareSize;
export const contentType = shareType;
export const alt = "";

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  return shareImage([(project?.name ?? "").toUpperCase()]);
}
