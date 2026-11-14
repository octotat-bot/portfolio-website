"use client";

// Home 5: selected work. M13 pinned title: the headline stays centred for
// 250vh while four ProjectTiles start below the screen at different x
// positions and rise past it at 0.8x to 1.4x, each with its own tilt, timed so
// at most two are over the headline at once.
// Below 810px there is no drift: the headline on its own, the note, then the
// four tiles as a card stack (M27), so text never sits on other text.
// Tiles fade as they reach the nav zone (NavFade).
// Tiles hop and clear on hover (M14, M15). A typed note sits beside the first.
// With reduced motion: the headline, then the tiles in a plain grid.

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { CardStack } from "@/components/motion/card-stack";
import { NavFade } from "@/components/motion/nav-fade";
import { RevealText } from "@/components/motion/reveal-text";
import { Note } from "@/components/ui/note";
import { ProjectTile } from "@/components/ui/project-tile";
import { home } from "@/content/pages";
import { useReduced } from "@/lib/hooks";
import { driftTiles } from "@/lib/motion";

export type HomeTile = { slug: string; name: string; caption: string; cover: string | null };

const SIZES = "16vw";

function DriftTile({ tile, index, progress }: { tile: HomeTile; index: number; progress: MotionValue<number> }) {
  const spec = driftTiles.tiles[index % driftTiles.tiles.length];
  const y = useTransform(progress, (p) => `${spec.start - p * driftTiles.travel * spec.speed}vh`);
  const style = { "--x-md": spec.xMd, "--w-md": driftTiles.widthMd } as CSSProperties;
  return (
    <motion.div className="drift-tile absolute top-0 z-10" style={{ ...style, y }}>
      <NavFade>
        <ProjectTile href={`/work/${tile.slug}`} name={tile.name} caption={tile.caption} cover={tile.cover} index={index} sizes={SIZES} />
        {index === 0 ? (
          <div className="absolute left-full top-10 pl-4">
            <Note text={home.selectedWork.note} tilt={4} className="whitespace-nowrap" />
          </div>
        ) : null}
      </NavFade>
    </motion.div>
  );
}

export function SelectedWork({ tiles }: { tiles: HomeTile[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { headline, note } = home.selectedWork;

  if (reduced) {
    return (
      <section className="flex flex-col gap-16 px-4 py-32 md:px-10">
        <RevealText as="h2" text={headline} className="poster-1" />
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile, i) => (
            <NavFade key={tile.slug} className="flex flex-col gap-4">
              <ProjectTile href={`/work/${tile.slug}`} name={tile.name} caption={tile.caption} cover={tile.cover} index={i} />
              {i === 0 ? <Note text={note} tilt={4} /> : null}
            </NavFade>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Below 810px: headline, note, card stack. */}
      <section className="flex flex-col gap-10 overflow-x-clip px-4 py-32 md:hidden">
        <RevealText as="h2" text={headline} className="poster-1" />
        <Note text={note} tilt={4} />
        <CardStack
          items={tiles.map((tile, i) => ({
            key: tile.slug,
            node: (
              <ProjectTile href={`/work/${tile.slug}`} name={tile.name} caption={tile.caption} cover={tile.cover} index={i} sizes="90vw" />
            ),
          }))}
        />
      </section>

      {/* From 810px: the pinned title with drifting tiles. */}
      <section ref={ref} className="relative hidden md:block" style={{ height: driftTiles.height }}>
        <div className="sticky top-0 h-dvh overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center px-10">
            <RevealText as="h2" text={headline} className="poster-1 text-center" />
          </div>
          {tiles.map((tile, i) => (
            <DriftTile key={tile.slug} tile={tile} index={i} progress={scrollYProgress} />
          ))}
        </div>
      </section>
    </>
  );
}
