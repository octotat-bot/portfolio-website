"use client";

// At most one shader canvas animates at a time (MOTION.md, Performance). Every
// live dither field reports how much of it is on screen; the most visible one
// gets the slot and animates, the rest hold a still frame. Paper Shaders also
// stops a canvas on its own when it is off screen or the tab is hidden.

type Entry = { ratio: number; notify: (running: boolean) => void };

const entries = new Map<symbol, Entry>();
let owner: symbol | null = null;

function arbitrate() {
  let best: symbol | null = null;
  let bestRatio = 0;
  for (const [key, entry] of entries) {
    if (entry.ratio > bestRatio) {
      best = key;
      bestRatio = entry.ratio;
    }
  }
  if (best === owner) return;
  const previous = owner;
  owner = best;
  if (previous) entries.get(previous)?.notify(false);
  if (best) entries.get(best)?.notify(true);
}

export function joinShaderSlot(notify: (running: boolean) => void) {
  const key = Symbol("shader");
  entries.set(key, { ratio: 0, notify });
  return {
    report(ratio: number) {
      const entry = entries.get(key);
      if (!entry) return;
      entry.ratio = ratio;
      arbitrate();
    },
    leave() {
      entries.delete(key);
      if (owner === key) owner = null;
      arbitrate();
    },
  };
}

let webgl2: boolean | null = null;

/** Paper Shaders needs WebGL2. Checked once. */
export function hasWebGL2(): boolean {
  if (webgl2 !== null) return webgl2;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    webgl2 = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  return webgl2;
}
