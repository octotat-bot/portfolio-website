import { Closing } from "@/components/sections/home/closing";
import { Hero } from "@/components/sections/home/hero";
import { Numbers } from "@/components/sections/home/numbers";
import { SelectedWork } from "@/components/sections/home/selected-work";
import { Statement } from "@/components/sections/home/statement";
import { WhatIBuild } from "@/components/sections/home/what-i-build";
import { Ticker } from "@/components/ui/ticker";
import { home } from "@/content/pages";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";
import { resolveNumbers } from "@/lib/live-numbers";
import { projectMedia } from "@/lib/media";

// Home is static and rebuilt in the background at most once a day, so the
// live GitHub and LeetCode numbers stay fresh. Must match LIVE_REVALIDATE.
export const revalidate = 86400;

// Home: a poster that assembles itself. Sections in PAGES.md order. The intro
// (M01) and the footer come from the root layout.
export default async function HomePage() {
  const numbers = await resolveNumbers();
  // Selected work: the projects listed in content/pages.ts, in that order.
  const tiles = home.selectedWork.slugs.flatMap((slug) => {
    const p = getProject(slug);
    return p?.study ? [{ slug, name: p.name, caption: p.study.caption, cover: projectMedia(slug).cover }] : [];
  });

  return (
    <main id="main">
      <Ticker items={site.ticker} />
      <Hero />
      <Statement />
      <WhatIBuild />
      <SelectedWork tiles={tiles} />
      <Numbers numbers={numbers} />
      <Closing />
    </main>
  );
}
