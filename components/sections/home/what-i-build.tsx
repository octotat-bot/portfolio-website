"use client";

// Home 4: what i build. Pinned split: the text block (40%) stays at left for
// the length of the list while the poster words (60%) scroll past on the
// right, sharp only at mid-screen (M12). The heading rises in (M03).
// Below 810px it is one column and nothing pins. With reduced motion nothing
// pins and every word is sharp.

import { RevealText } from "@/components/motion/reveal-text";
import { Button } from "@/components/ui/button";
import { WordList } from "@/components/ui/word-list";
import { home } from "@/content/pages";

export function WhatIBuild() {
  const { heading, paragraph, button, words } = home.whatIBuild;
  return (
    <section className="grid gap-10 px-4 py-16 md:grid-cols-5 md:px-10 md:py-0">
      <div className="md:col-span-2">
        <div className="flex flex-col gap-3 md:sticky md:top-0 md:h-dvh md:justify-center motion-reduce:md:static motion-reduce:md:h-auto motion-reduce:md:py-32">
          <RevealText as="h2" text={heading} className="poster-4" />
          <p className="body max-w-measure">{paragraph}</p>
          <div className="pt-6">
            <Button href={button.href} variant="ghost">
              {button.label}
            </Button>
          </div>
        </div>
      </div>
      <WordList words={words} className="word-runway flex flex-col gap-4 md:col-span-3" />
    </section>
  );
}
