"use client";

import { useSyncExternalStore } from "react";

// Whether the page is visible yet. The intro (M01) and the wipe (M02) cover
// the page; entrance effects wait for "clear" so they do not play underneath.

export type Curtain = "intro" | "covered" | "clear";

let state: Curtain | null = null;
const listeners = new Set<() => void>();

const read = (): Curtain => {
  if (state === null) state = document.documentElement.hasAttribute("data-intro") ? "intro" : "clear";
  return state;
};

export function setCurtain(next: Curtain) {
  if (state === next) return;
  state = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** "covered" on the server, so nothing plays before the client knows. */
export function useCurtain(): Curtain {
  return useSyncExternalStore(subscribe, read, () => "covered");
}

export const useStageClear = () => useCurtain() === "clear";
