"use client";

// Case study 3: story. Blocks of a poster-4 heading rising in (M03) with body
// text under it, at most 60 characters wide, in a column on the right from
// 810px. A block may sweep one word with the highlight (M11). Blocks whose
// text is still a blank are left out.

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
    <section className="px-4 py-16 md:px-10">
      <div className="flex flex-col gap-16 md:ml-auto md:w-1/2">
        {shown.map((b) => (
          <article key={b.heading} className="flex flex-col gap-3">
            <RevealText as="h2" text={b.heading} className="poster-4" />
            <p className="body max-w-measure">
              <Body text={b.body} highlight={b.highlight} />
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
