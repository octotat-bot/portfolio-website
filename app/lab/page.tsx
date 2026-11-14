import type { Metadata } from "next";
import { RevealText } from "@/components/motion/reveal-text";
import { Shelf } from "@/components/sections/lab/shelf";
import { Note } from "@/components/ui/note";
import { lab, visibleLabItems } from "@/content/lab";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.meta.lab.title, description: site.meta.lab.description };

// Lab: the unfinished shelf. The title word in monument (M03, M04), a lede and
// a typed note (M10), then the shelf. Only confirmed items appear in the
// production build (content/lab.ts).
export default function LabPage() {
  return (
    <main id="main">
      <section className="flex flex-col gap-6 px-4 pb-16 pt-32 md:px-10">
        <RevealText as="h1" text={lab.title} shuffle className="monument" />
        <p className="lede max-w-measure">{lab.lede}</p>
        <Note text={lab.note} size="scrawl" tilt={-3} />
      </section>
      <Shelf items={visibleLabItems()} />
    </main>
  );
}
