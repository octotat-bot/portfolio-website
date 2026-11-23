"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { breakpoint } from "./tokens";

/**
 * The current path, as the browser sees it. Use this, not usePathname, for
 * anything rendered. On Vercel, when Home is regenerated on the server (it
 * refreshes once a day for the live numbers), it renders with the path
 * "/index" while the browser is at "/". Anything that depends on the path
 * then differs between the server's HTML and the browser, React throws the
 * server's page away, and with it the loader and the hero's entrance. So
 * "/index" (and "/x/index") count as "/" (and "/x").
 */
export function usePath(): string {
  const path = usePathname() ?? "/";
  if (path === "/index") return "/";
  return path.endsWith("/index") ? path.slice(0, -"/index".length) : path;
}

export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const list = window.matchMedia(REDUCED_QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};

/**
 * True when the visitor asked for reduced motion. False on the server and
 * during hydration, so the first client render matches the server HTML; it
 * updates straight after.
 */
export function useReduced(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

/** True when a media query matches. False on the server and before mount. */
export function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Desktop layout: the md breakpoint from tokens.json. */
export const MD_QUERY = `(min-width: ${breakpoint.md})`;
/** A fine pointer that can hover. */
export const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
