"use client";

// RollLink: every text link that is not a button. Letters roll on hover or
// focus (M06). Internal links play the wipe (M02).
//
// Tones (DESIGN.md, and decision 6 from the Phase 0 plan): claret is allowed
// only at 24px and up, so
//   large: ivory, rolls to claret. For poster-size links.
//   small: ash, rolls to ivory. For label-size links.
//   plain: ivory, rolls to ivory. For the nav name, which sits on any surface.

import { useState, type FocusEvent, type ReactNode } from "react";
import { TransitionLink, isExternal } from "@/components/shell/wipe";
import { RollText } from "./roll-text";

export type RollTone = "large" | "small" | "plain";

const TONES: Record<RollTone, { base: string; roll: string }> = {
  large: { base: "text-ivory", roll: "text-claret" },
  small: { base: "text-ash", roll: "text-ivory" },
  plain: { base: "text-ivory", roll: "text-ivory" },
};

type Props = {
  href: string;
  children: string;
  tone?: RollTone;
  /** Type style class, e.g. "label" or "poster-4". */
  type?: string;
  className?: string;
  /** Shown before the text and not rolled, e.g. a menu number. */
  before?: ReactNode;
  /** Force the rolled state (styleguide). */
  forceActive?: boolean;
};

export function RollLink({ href, children, tone = "small", type = "label", className = "", before, forceActive }: Props) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const { base, roll } = TONES[tone];
  const active = forceActive ?? (hover || focus);

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: (event: FocusEvent<HTMLElement>) => setFocus(event.currentTarget.matches(":focus-visible")),
    onBlur: () => setFocus(false),
  };
  const classes = `${type} inline-flex min-h-target items-center gap-1 ${className}`;
  const inner = (
    <>
      {before}
      <span className="sr-only">{children}</span>
      <RollText text={children} active={active} base={base} roll={roll} />
    </>
  );

  if (isExternal(href)) {
    return (
      <a href={href} className={classes} {...handlers}>
        {inner}
      </a>
    );
  }
  return (
    <TransitionLink href={href} className={classes} {...handlers}>
      {inner}
    </TransitionLink>
  );
}
