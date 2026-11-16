"use client";

// M21 takeover menu. Spec: docs/MOTION.md, "The takeover menu".
//
// Opening: a midnight-raised field revealed by a circle growing from the
// centre of the menu button (900ms, ease-in-out). From 200ms in, the links
// slide in from 160px right while fading in, 80ms apart (dur-roll, ease-out).
// The bottom row fades in last. Page scroll is locked and Lenis stopped.
//
// Hover and focus: that link turns claret, the other four fall to 35% opacity
// (dur-fast), its letters roll (M06). The claret dot springs from the current
// page to that link, which shifts right to make room. On desktop the right half
// shows its number (scrambles, M05) and a typed note (retypes, M10).
//
// Closing: links fade out together in 150ms, then the circle shrinks back
// into the button in dur-roll. Choosing a link starts the wipe (M02) and the
// menu closes instantly underneath it. Esc closes. Focus is trapped while open
// and returns to the menu button.
//
// Reduced motion: the field appears and disappears at once, links are simply
// there, the dot jumps, colour still changes on hover.

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RollLink } from "@/components/ui/roll-link";
import { RollText } from "@/components/ui/roll-text";
import { a11y, menu as copy } from "@/content/pages";
import { site } from "@/content/site";
import { MD_QUERY, useMedia, useReduced } from "@/lib/hooks";
import type { Portrait } from "@/lib/media";
import { dur, ease, menu as m, menuPortrait as mp, spring } from "@/lib/motion";
import type { MenuKey } from "@/lib/shapes";
import { tokens } from "@/lib/tokens";
import { MenuCollage } from "./menu-collage";
import { useMenu } from "./menu-state";
import { lockScroll } from "./smooth-scroll";
import { useWipe } from "./wipe";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** The dot is 0.15em across; the link moves right by that plus space-3. */
const DOT = 0.15;
const GAP = Number.parseFloat(tokens.spacing.tokens.find((t) => t.name === "space-3")?.value ?? "0");

const isCurrent = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

type Origin = { x: number; y: number; r: number };

/** The menu composition and portrait treatment for each link. */
const MENU_KEYS: Record<string, MenuKey> = { "/": "home", "/work": "work", "/about": "about", "/lab": "lab", "/contact": "contact" };

export function Menu({ portrait }: { portrait: Portrait | null }) {
  const { open, setOpen, closeInstantly, instant, buttonRef } = useMenu();
  const pathname = usePathname();
  const reduced = useReduced();
  const desktop = useMedia(MD_QUERY);
  const lenis = useLenis();
  const { navigate } = useWipe();
  const panelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0, r: 0 });
  const [fontSize, setFontSize] = useState(0);

  const current = copy.items.findIndex((item) => isCurrent(item.href, pathname));
  const active = hovered ?? current;
  const shown = copy.items[active] ?? copy.items[0];

  // Where the circle grows from, and how far it has to reach.
  useEffect(() => {
    if (!open) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    setOrigin({ x, y, r });
  }, [open, buttonRef]);

  // Lock scroll while open.
  useEffect(() => {
    if (!open) return;
    return lockScroll(lenis);
  }, [open, lenis]);

  // Esc closes; Tab stays inside the menu and its button.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      const button = buttonRef.current;
      if (!panel || !button) return;
      const items = [button, ...Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))];
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? index <= 0 ? items.length - 1 : index - 1
        : index === -1 || index === items.length - 1 ? 0 : index + 1;
      event.preventDefault();
      items[next]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen, buttonRef]);

  // Focus the first link on open; give focus back to the button on close.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const id = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      setHovered(null);
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [open, buttonRef]);

  // Back or forward while open: close underneath the wipe.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== lastPath.current && open) closeInstantly();
    lastPath.current = pathname;
  }, [pathname, open, closeInstantly]);

  // The link font size, for the dot gap in px.
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const link = panelRef.current?.querySelector<HTMLElement>("[data-menu-link]");
      if (link) setFontSize(Number.parseFloat(getComputedStyle(link).fontSize));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  const shift = fontSize * DOT + GAP;
  const circle = (r: number) => `circle(${r}px at ${origin.x}px ${origin.y}px)`;
  const field = {
    closed: (skip: boolean) =>
      skip || reduced
        ? { clipPath: circle(origin.r), opacity: 0, transition: { duration: 0 } }
        : { clipPath: circle(0), transition: { ...m.close, delay: desktop ? mp.closeOut : m.fadeOut } },
    open: { clipPath: circle(origin.r), opacity: 1, transition: reduced ? { duration: 0 } : m.open },
  };
  const enter = (i: number) =>
    reduced
      ? { duration: 0 }
      : { duration: dur.roll, ease: ease.out, delay: m.linksDelay + i * m.linkStagger };
  const leave = { opacity: 0, transition: { duration: reduced ? 0 : m.fadeOut } };
  const bottomDelay = m.linksDelay + copy.items.length * m.linkStagger + dur.fast;

  return (
    <AnimatePresence custom={instant}>
      {open ? (
        <motion.div
          key="menu"
          id="site-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={a11y.menu}
          data-lenis-prevent
          custom={instant}
          variants={field}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed inset-0 z-60 flex flex-col overflow-y-auto bg-midnight-raised px-4 pb-6 pt-24 md:px-10"
        >
          <div className="grid flex-1 items-center md:grid-cols-2 md:gap-10">
            <nav aria-label={a11y.menu} onMouseLeave={() => setHovered(null)}>
              <ul className="flex flex-col gap-2">
                {copy.items.map((item, i) => {
                  const isActive = active === i;
                  const isHovered = hovered === i;
                  const dimmed = hovered !== null && !isHovered;
                  return (
                    <motion.li
                      key={item.href}
                      className="relative"
                      initial={reduced ? false : { x: m.linkFrom, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={leave}
                      transition={enter(i)}
                    >
                      <Link
                        href={item.href}
                        data-menu-link
                        aria-current={i === current ? "page" : undefined}
                        onNavigate={(event) => {
                          event.preventDefault();
                          navigate(item.href, { onCovered: closeInstantly });
                        }}
                        onMouseEnter={() => setHovered(i)}
                        onFocus={(event) => {
                          // Keyboard focus counts as hover; the focus placed on
                          // the first link when the menu opens does not.
                          if (event.currentTarget.matches(":focus-visible")) setHovered(i);
                        }}
                        className="menu menu-link relative flex items-center"
                        style={{ opacity: dimmed ? m.dim : 1 }}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="menu-dot"
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 block bg-claret"
                            style={{ width: `${DOT}em`, height: `${DOT}em`, marginTop: `${-DOT / 2}em` }}
                            transition={reduced ? { duration: 0 } : { type: "spring", ...spring }}
                          />
                        ) : null}
                        <motion.span
                          className="block"
                          initial={false}
                          animate={{ x: isActive ? shift : 0 }}
                          transition={reduced ? { duration: 0 } : { type: "spring", ...spring }}
                        >
                          <span className="sr-only">{item.label}</span>
                          <RollText
                            text={item.label}
                            active={isHovered}
                            base={isHovered ? "text-claret" : "text-ivory"}
                            roll="text-claret"
                          />
                        </motion.span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

          </div>

          {/* Desktop: the collage fills the right half (M21). Phones: links only. */}
          {desktop ? (
            <div className="menu-collage-slot">
              <MenuCollage
                portrait={portrait}
                target={MENU_KEYS[shown.href] ?? "home"}
                number={shown.number}
                note={shown.note}
                reduced={reduced}
              />
            </div>
          ) : null}

          <motion.div
            className="mt-10 flex flex-wrap items-end justify-between gap-4 md:w-1/2 md:items-center md:justify-start md:gap-x-10"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={leave}
            transition={reduced ? { duration: 0 } : { duration: dur.roll, ease: ease.out, delay: bottomDelay }}
          >
            <ul className="flex flex-wrap gap-x-6">
              {copy.links.map((id) => {
                const link = site.links[id];
                if (!link.value) return null;
                const href = link.kind === "email" ? `mailto:${link.value}` : link.value;
                return (
                  <li key={id}>
                    <RollLink href={href}>{link.label}</RollLink>
                  </li>
                );
              })}
            </ul>
            <p className="label text-ash">{copy.credit}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
