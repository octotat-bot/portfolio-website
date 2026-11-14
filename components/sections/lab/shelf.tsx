"use client";

// Lab 2: the shelf. A loose grid of small cards, three across from 1025px,
// two from 810px, one on phones, each at a slightly different tilt. Each card:
// a status tag (scrambles in, M05), the name in poster-4, one line, and an
// optional RollLink whose text is the link's own address. Card fields
// alternate midnight-raised and burgundy-deep.
// A card with a link hops on hover or focus (M14). Blanks are left out: no
// tag while the status is blank, no line while it is blank, no link while it
// is blank. Cards fade in the nav zone.

import { motion } from "motion/react";
import { useState } from "react";
import { NavFade } from "@/components/motion/nav-fade";
import { Label } from "@/components/ui/label";
import { RollLink } from "@/components/ui/roll-link";
import type { LabItem } from "@/content/lab";
import { shelfTilts, tileHop } from "@/lib/motion";

function Card({ item, index }: { item: LabItem; index: number }) {
  const [active, setActive] = useState(false);
  const raised = index % 2 === 0;
  const tilt = shelfTilts[index % shelfTilts.length];
  return (
    <motion.article
      data-surface={raised ? undefined : "burgundy"}
      className={`flex h-full flex-col gap-3 p-6 ${raised ? "bg-midnight-raised" : "bg-burgundy-deep"}`}
      initial={false}
      animate={active ? { rotate: 0, y: -tileHop.lift } : { rotate: tilt, y: 0 }}
      transition={{ duration: tileHop.duration, ease: tileHop.ease }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={() => setActive(false)}
    >
      {item.status ? (
        <Label tag scramble="view" className="self-start">
          {item.status}
        </Label>
      ) : null}
      <h2 className="poster-4">{item.name}</h2>
      {item.line ? <p className={`body max-w-measure ${raised ? "text-ash" : "text-ivory"}`}>{item.line}</p> : null}
      {item.link ? (
        <div className="mt-auto pt-3">
          <RollLink href={item.link} tone={raised ? "small" : "plain"}>
            {new URL(item.link).host}
          </RollLink>
        </div>
      ) : null}
    </motion.article>
  );
}

export function Shelf({ items }: { items: LabItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="px-4 py-16 md:px-10">
      <ul className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.name}>
            <NavFade className="h-full">
              <Card item={item} index={i} />
            </NavFade>
          </li>
        ))}
      </ul>
    </section>
  );
}
