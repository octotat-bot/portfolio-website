import type { Metadata } from "next";
import { AboutNumbers, Beliefs, Bio, Hero } from "@/components/sections/about/about-parts";
import { SkillPile } from "@/components/sections/about/skill-pile";
import { YearStrip } from "@/components/sections/about/year-strip";
import { about } from "@/content/about";
import { caseStudies } from "@/content/projects";
import { site } from "@/content/site";
import { resolveNumbers } from "@/lib/live-numbers";
import { menuPortrait } from "@/lib/media";

export const metadata: Metadata = { title: site.meta.about.title, description: site.meta.about.description };

// The live GitHub and LeetCode numbers refresh at most once a day. Must match LIVE_REVALIDATE.
export const revalidate = 86400;

// About: who first (photo and one line), the short version, the numbers, the
// years as a strip you scroll sideways, the stack, and what i believe.
export default async function AboutPage() {
  const live = await resolveNumbers();
  const figures = [
    ...live.map((n) => ({ value: n.value, caption: n.caption })),
    { value: caseStudies.length, caption: about.numbers.projects },
    { value: about.road.filter((card) => card.title.startsWith("INTERNSHIP")).length, caption: about.numbers.internships },
  ];
  return (
    <main id="main">
      <Hero portrait={menuPortrait()} />
      <Bio />
      <AboutNumbers figures={figures} />
      <YearStrip />
      <SkillPile />
      <Beliefs />
    </main>
  );
}
