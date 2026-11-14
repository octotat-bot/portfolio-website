"use client";

// Work 2: tiles. Starts one screen down. From 810px: two columns, the right
// one 30vh lower; tiles larger than on Home (at least 320px wide). Each tile
// has its tag and year under it; names rise in (M03), tiles hop and clear on
// hover (M14, M15). Below 810px the tiles are a card stack (M27).
// Every tile fades as it reaches the nav zone.

import { CardStack } from "@/components/motion/card-stack";
import { NavFade } from "@/components/motion/nav-fade";
import { Label } from "@/components/ui/label";
import { ProjectTile } from "@/components/ui/project-tile";

export type WorkTile = { slug: string; name: string; kind: string; year: string | null; caption: string; cover: string | null };

const SIZES = "(min-width: 810px) 32vw, 90vw";

function Tile({ tile, index }: { tile: WorkTile; index: number }) {
  return (
    <div className="flex flex-col gap-4 bg-midnight pb-4">
      <ProjectTile
        href={`/work/${tile.slug}`}
        name={tile.name}
        caption={tile.caption}
        cover={tile.cover}
        index={index}
        sizes={SIZES}
        revealName
      />
      <div className="flex items-center gap-3">
        <Label tag>{tile.kind}</Label>
        {tile.year ? <Label>{tile.year}</Label> : null}
      </div>
    </div>
  );
}

export function WorkTiles({ tiles }: { tiles: WorkTile[] }) {
  const left = tiles.filter((_, i) => i % 2 === 0);
  const right = tiles.filter((_, i) => i % 2 === 1);
  const column = (list: WorkTile[], offset: number) =>
    list.map((tile, i) => (
      <NavFade key={tile.slug} className="work-tile">
        <Tile tile={tile} index={i * 2 + offset} />
      </NavFade>
    ));

  return (
    <section className="work-start relative z-10">
      <div className="hidden grid-cols-2 gap-16 px-10 md:grid">
        <div className="flex flex-col items-start gap-32">{column(left, 0)}</div>
        <div className="work-offset flex flex-col items-end gap-32">{column(right, 1)}</div>
      </div>
      {/* Full width, clipping sideways: a tilted full-width card pokes a few px past the edge. */}
      <div className="overflow-x-clip px-4 md:hidden">
        <CardStack items={tiles.map((tile, i) => ({ key: tile.slug, node: <Tile tile={tile} index={i} /> }))} />
      </div>
    </section>
  );
}
