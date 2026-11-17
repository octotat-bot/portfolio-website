"use client";

// ProjectTile: a tilted 4:5 poster card for a project. A dithered burgundy
// field, the dithered picture when there is one, the name in poster-4 and the
// caption typed onto an ivory strip in `meta`. Tilts 3 to 5 degrees,
// alternating by index.
// M14 tile hop: on hover or focus it rotates to 0 and lifts 10px (dur-pop,
// ease-pop) and its picture clears (M15).
// Without a cover it shows the project's poster-shape composition (G1 then
// G3) on midnight-raised, above the name band; a real cover replaces it.
// The name sits on a solid burgundy band at the foot of the picture, so it
// never lies over text inside a cover image or a composition.

import { motion } from "motion/react";
import { useState } from "react";
import { DitherField } from "@/components/motion/dither-field";
import { DitherImage } from "@/components/motion/dither-image";
import { ShapeComposition } from "@/components/motion/shape-composition";
import { RevealText } from "@/components/motion/reveal-text";
import { TransitionLink } from "@/components/shell/wipe";
import { tileHop } from "@/lib/motion";
import { projectComposition } from "@/lib/shapes";

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
  /** The name rises in when it enters view (M03). */
  revealName?: boolean;
  /** Resting tilt in degrees, instead of the alternating 3 to 5. */
  tilt?: number;
  /** The M14 hop on hover. Off when a parent moves the tile itself (M31). */
  hop?: boolean;
  /** Hold the shapes (G1, G3) still and unassembled (M31: until the tile lands). */
  paused?: boolean;
};

export function ProjectTile({
  href,
  name,
  caption,
  cover,
  index,
  sizes = "(min-width: 810px) 33vw, 90vw",
  className = "",
  forceActive,
  revealName = false,
  tilt: tiltProp,
  hop = true,
  paused = false,
}: Props) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const active = forceActive ?? (hover || focus);
  const tilt = tiltProp ?? TILTS[index % TILTS.length];
  const comp = cover ? null : projectComposition(href.split("/").pop() ?? "");
  const nameBand = revealName ? (
    <RevealText as="span" text={name} className="poster-4 block text-ivory" />
  ) : (
    <span className="poster-4 block text-ivory">{name}</span>
  );

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
        animate={active && hop ? { rotate: 0, y: -tileHop.lift } : { rotate: tilt, y: 0 }}
        transition={{ duration: tileHop.duration, ease: tileHop.ease }}
      >
        {comp ? (
          <span className="flex aspect-4/5 flex-col bg-midnight-raised">
            <span className="relative block min-h-0 flex-1 p-3">
              <ShapeComposition comp={comp} paused={paused} />
            </span>
            <span className="block bg-burgundy px-3 pb-3 pt-2">{nameBand}</span>
          </span>
        ) : (
          <DitherField still seed={index} className="block aspect-4/5">
            {cover ? <DitherImage src={cover} alt="" resolved={active} back="burgundy-deep" sizes={sizes} /> : null}
            <span className="absolute inset-x-0 bottom-0 block bg-burgundy px-3 pb-3 pt-2">{nameBand}</span>
          </DitherField>
        )}
        <span className="meta block bg-ivory px-3 py-2 text-midnight">{caption}</span>
      </motion.span>
    </TransitionLink>
  );
}
