"use client";

// Nav: 56px, fixed, over content. The name at left as a RollLink. The menu
// button lives in its own fixed layer (MenuButton) so it stays above the open
// menu and turns from two lines into a cross.
// Text is ivory on every surface (decision 2: no blend mode).

import { motion } from "motion/react";
import { a11y } from "@/content/pages";
import { site } from "@/content/site";
import { tokens } from "@/lib/tokens";
import { useMenu } from "./menu-state";
import { RollLink } from "@/components/ui/roll-link";

const px = (name: string) =>
  Number.parseFloat([...tokens.spacing.tokens, ...tokens.size.tokens].find((t) => t.name === name)?.value ?? "0");
/** Each line moves to the centre: half the gap plus half a line. */
const CROSS_SHIFT = (px("space-2") + px("stroke")) / 2;

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-nav items-center px-4 md:px-10">
      <RollLink href="/" tone="plain">
        {site.navName}
      </RollLink>
    </header>
  );
}

export function MenuButton() {
  const { open, setOpen, buttonRef } = useMenu();
  return (
    <div className="fixed right-4 top-0 z-70 flex h-nav items-center md:right-10">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? a11y.closeMenu : a11y.openMenu}
        onClick={() => setOpen(!open)}
        className="flex size-target flex-col items-center justify-center gap-2"
      >
        <motion.span
          className="block h-stroke w-6 bg-ivory"
          initial={false}
          animate={open ? { y: CROSS_SHIFT, rotate: 45 } : { y: 0, rotate: 0 }}
        />
        <motion.span
          className="block h-stroke w-6 bg-ivory"
          initial={false}
          animate={open ? { y: -CROSS_SHIFT, rotate: -45 } : { y: 0, rotate: 0 }}
        />
      </button>
    </div>
  );
}
