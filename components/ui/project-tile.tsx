"use client";

// ProjectTile: a tilted 4:5 poster card for a project. A dithered burgundy
// field, the dithered picture when there is one, the name in poster-4 and the
// caption typed onto an ivory strip in `meta`. Tilts 3 to 5 degrees,
// alternating by index.
// M14 tile hop: on hover or focus it rotates to 0 and lifts 10px (dur-pop,
// ease-pop) and its picture clears (M15).
// Without a cover it shows the dither field with the project name only.

import { motion } from "motion/react";
import { useState } from "react";
import { DitherField } from "@/components/motion/dither-field";
import { DitherImage } from "@/components/motion/dither-image";
import { TransitionLink } from "@/components/shell/wipe";
import { tileHop } from "@/lib/motion";

const TILTS = [-4, 3, -5, 4, -3, 5];

type Props = {
  href: string;
  name: string;
  caption: string;
  cover: string | null;
  index: number;
  /** Responsive image sizes for the cover. */
  sizes?: string;
  className?: string;
  /** Show the hover state without interaction (styleguide). */
  forceActive?: boolean;
};

export function ProjectTile({ href, name, caption, cover, index, sizes = "(min-width: 810px) 33vw, 90vw", className = "", forceActive }: Props) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const active = forceActive ?? (hover || focus);
  const tilt = TILTS[index % TILTS.length];

  return (
    <TransitionLink
      href={href}
      className={`block ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <motion.span
        className="block"
        initial={false}
        animate={active ? { rotate: 0, y: -tileHop.lift } : { rotate: tilt, y: 0 }}
        transition={{ duration: tileHop.duration, ease: tileHop.ease }}
      >
        <DitherField still seed={index} className="block aspect-4/5">
          {cover ? <DitherImage src={cover} alt="" resolved={active} back="burgundy-deep" sizes={sizes} /> : null}
          <span className="poster-4 absolute bottom-3 left-3 right-3 text-ivory">{name}</span>
        </DitherField>
        <span className="meta block bg-ivory px-3 py-2 text-midnight">{caption}</span>
      </motion.span>
    </TransitionLink>
  );
}
