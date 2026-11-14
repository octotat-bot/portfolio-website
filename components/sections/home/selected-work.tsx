"use client";

// Home 5: selected work. M13 pinned title: the headline stays centred for
// 250vh while four ProjectTiles start below the screen at different x
// positions and rise past it at 0.8x to 1.4x, each with its own tilt, timed so
// at most two are over the headline at once. On phones the headline sits
// above the tiles so it is never covered; a midnight outline keeps it legible
// where it crosses a tile's ivory caption strip.
// Tiles hop and clear on hover (M14, M15). A typed note sits beside the first.
// With reduced motion: the headline, then the tiles in a plain grid.

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { RevealText } from "@/components/motion/reveal-text";
import { Note } from "@/components/ui/note";
import { ProjectTile } from "@/components/ui/project-tile";
import { home } from "@/content/pages";
import { useReduced } from "@/lib/hooks";
import { driftTiles } from "@/lib/motion";

export type HomeTile = { slug: string; name: string; caption: string; cover: string | null };

const SIZES = "(min-width: 810px) 16vw, 40vw";

function DriftTile({ tile, index, progress }: { tile: HomeTile; index: number; progress: MotionValue<number> }) {
  const spec = driftTiles.tiles[index % driftTiles.tiles.length];
  const y = useTransform(progress, (p) => `${spec.start - p * driftTiles.travel * spec.speed}vh`);
  const style = {
    "--x": spec.x,
    "--x-md": spec.xMd,
    "--w": driftTiles.width,
    "--w-md": driftTiles.widthMd,
  } as CSSProperties;
  return (
    <motion.div className="drift-tile absolute top-0 z-10" style={{ ...style, y }}>
      <ProjectTile href={`/work/${tile.slug}`} name={tile.name} caption={tile.caption} cover={tile.cover} index={index} sizes={SIZES} />
      {index === 0 ? (
        <div className="absolute bottom-full left-4 pb-2 md:bottom-auto md:left-full md:top-10 md:pb-0 md:pl-4">
          <Note text={home.selectedWork.note} tilt={4} className="whitespace-nowrap" />
        </div>
      ) : null}
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
            <div key={tile.slug} className="flex flex-col gap-4">
              <ProjectTile href={`/work/${tile.slug}`} name={tile.name} caption={tile.caption} cover={tile.cover} index={i} />
              {i === 0 ? <Note text={note} tilt={4} /> : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative" style={{ height: driftTiles.height }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 md:z-0 md:px-10">
          <RevealText as="h2" text={headline} className="poster-1 headline-over-tiles text-center" />
        </div>
        {tiles.map((tile, i) => (
          <DriftTile key={tile.slug} tile={tile} index={i} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
