import type { Metadata } from "next";
import { Beliefs, Bio, Opener } from "@/components/sections/about/about-parts";
import { SkillPile } from "@/components/sections/about/skill-pile";
import { YearStrip } from "@/components/sections/about/year-strip";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.about.title, description: site.meta.about.description };

// About: the years as a strip you scroll sideways. Sections in PAGES.md order.
export default function AboutPage() {
  return (
    <main id="main">
      <Opener />
      <Bio />
      <YearStrip />
      <SkillPile />
      <Beliefs />
    </main>
  );
}
