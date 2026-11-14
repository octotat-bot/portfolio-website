"use client";

// Case study 3: story. Blocks of a poster-4 heading rising in (M03) and body
// text at most 60 characters wide. From 810px each block is two columns: the
// heading on the left stays pinned (below the nav zone) while its paragraph
// scrolls on the right. Phones: one column, heading above text. A block may
// sweep one word with the highlight (M11). Blocks whose text is still a blank
// are left out. With reduced motion nothing pins.

import { Highlight } from "@/components/motion/highlight";
import { RevealText } from "@/components/motion/reveal-text";
import type { StoryBlock } from "@/content/projects";

function Body({ text, highlight }: { text: string; highlight?: string }) {
  const match = highlight ? new RegExp(`\\b${highlight}\\b`).exec(text) : null;
  if (!match || !highlight) return <>{text}</>;
  return (
    <>
      {text.slice(0, match.index)}
      <Highlight>{highlight}</Highlight>
      {text.slice(match.index + highlight.length)}
    </>
  );
}

export function Story({ blocks }: { blocks: StoryBlock[] }) {
  const shown = blocks.filter((b): b is StoryBlock & { body: string } => b.body !== null);
  if (shown.length === 0) return null;
  return (
    <section className="flex flex-col gap-16 px-4 py-16 md:px-10">
      {shown.map((b) => (
        <article key={b.heading} className="grid gap-3 md:grid-cols-2 md:items-start md:gap-10">
          <div className="md:sticky md:top-32 motion-reduce:md:static">
            <RevealText as="h2" text={b.heading} className="poster-4" />
          </div>
          <p className="body max-w-measure md:pt-2">
            <Body text={b.body} highlight={b.highlight} />
          </p>
        </article>
      ))}
    </section>
  );
}
