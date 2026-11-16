"use client";

// M21 menu shapes: the poster-shape composition behind the menu portrait.
// One composition per link (lib/shapes.ts, menuCompositions).
//   Start: once `start` turns true, the shapes fly in from outside their box
//   (G1), staggered.
//   Change of link: the old shapes scatter outward and fade while the new
//   composition assembles, about 500ms in all.
//   Idle: G3 loops. Pointer: G2 push, on a fine pointer.
//   Closing (the menu leaving): the shapes scatter.
// One Motion frame loop drives every layer; transforms and opacity only.
// Reduced motion: the composition is shown finished and still, and swaps at once.

import { cancelFrame, cubicBezier, frame, useIsPresent, type FrameData } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Shape, idlePose, seeded, transform, type Pose } from "@/components/motion/shape-composition";
import { HOVER_QUERY, useMedia } from "@/lib/hooks";
import { ease, menuPortrait as mp, shapes as cfg, spring } from "@/lib/motion";
import { defaultIdle, menuCompositions, roleColour, type Composition, type MenuKey } from "@/lib/shapes";

const easeOut = cubicBezier(...ease.out);
const easeIn = cubicBezier(0.55, 0, 1, 0.45);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Layer = {
  id: number;
  key: MenuKey;
  /** Seconds (frame time) when this layer started arriving. */
  born: number | null;
  /** Seconds when this layer started leaving. */
  dying: number | null;
  flight: number;
  stagger: number;
};

function starts(comp: Composition, salt: number): Pose[] {
  const rand = seeded(comp.id + salt);
  const far = Math.max(comp.w, comp.h);
  return comp.pieces.map((p) => {
    const a = rand() * Math.PI * 2;
    const d = far * (0.7 + rand() * 0.5);
    return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, r: (rand() - 0.5) * 360, s: 0.3, sx: 1 };
  });
}

function LayerShapes({
  layer,
  register,
  still,
}: {
  layer: Layer;
  register: (id: number, i: number, el: SVGGElement | null) => void;
  /** Reduced motion: render in place. Otherwise start outside the box. */
  still: boolean;
}) {
  const comp = menuCompositions[layer.key];
  const from = useMemo(() => starts(comp, layer.id), [comp, layer.id]);
  return (
    <g>
      {comp.pieces.map((p, i) => (
        <g
          key={i}
          ref={(el) => register(layer.id, i, el)}
          transform={transform(still ? { x: p.x, y: p.y, r: p.rot ?? 0, s: 1, sx: 1 } : from[i])}
        >
          <Shape p={p} fillColour={roleColour(p.c, "midnight")} />
        </g>
      ))}
    </g>
  );
}

export function MenuShapes({ target, start, reduced }: { target: MenuKey; start: boolean; reduced: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isPresent = useIsPresent();
  const fine = useMedia(HOVER_QUERY);
  const nextId = useRef(1);
  const [layers, setLayers] = useState<Layer[]>([]);
  const layersRef = useRef<Layer[]>([]);
  layersRef.current = layers;
  const els = useRef(new Map<string, SVGGElement>());
  const register = (id: number, i: number, el: SVGGElement | null) => {
    const k = `${id}:${i}`;
    if (el) els.current.set(k, el);
    else els.current.delete(k);
  };
  const now = () => performance.now() / 1000;
  const startPoses = useRef(new Map<number, Pose[]>());
  const comp0 = menuCompositions[target];

  // First arrival, and every change of link after that.
  useEffect(() => {
    if (!start) return;
    setLayers((list) => {
      const live = list.filter((l) => l.dying === null);
      if (live.length === 1 && live[0].key === target) return list;
      const t = now();
      const first = live.length === 0;
      const dying = list.map((l) => (l.dying === null ? { ...l, dying: t } : l));
      const layer: Layer = {
        id: nextId.current++,
        key: target,
        born: reduced ? t - 10 : first ? t : t + mp.swapDelay,
        dying: null,
        flight: first ? mp.flight : mp.swapFlight,
        stagger: first ? mp.stagger : mp.swapStagger,
      };
      return reduced ? [layer] : [...dying, layer];
    });
  }, [target, start, reduced]);

  // Closing: everything scatters.
  useEffect(() => {
    if (isPresent || reduced) return;
    const t = now();
    setLayers((list) => list.map((l) => (l.dying === null ? { ...l, dying: t } : l)));
  }, [isPresent, reduced]);

  // Reduced motion: place the current composition, finished, and stop.
  useEffect(() => {
    if (!reduced) return;
    for (const l of layers) {
      menuCompositions[l.key].pieces.forEach((p, i) => {
        els.current.get(`${l.id}:${i}`)?.setAttribute("transform", transform({ x: p.x, y: p.y, r: p.rot ?? 0, s: 1, sx: 1 }));
      });
    }
  }, [reduced, layers]);

  useEffect(() => {
    if (reduced) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pointer = { on: false, x: 0, y: 0 };
    const offsets = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    const onMove = (e: PointerEvent) => {
      const m = svg.getScreenCTM();
      if (!m) return;
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      pointer.on = true;
      pointer.x = pt.x;
      pointer.y = pt.y;
    };
    const onLeave = () => (pointer.on = false);
    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    const tick = ({ delta }: FrameData) => {
      const t = now();
      const dt = Math.min(delta, 50) / 1000;
      const m = svg.getScreenCTM();
      const unit = m ? 1 / m.a : 1;
      const reach = cfg.reach * unit;
      const maxPush = cfg.push * unit;
      const gone: number[] = [];
      for (const l of layersRef.current) {
        if (l.born === null) continue;
        const comp = menuCompositions[l.key];
        let poses = startPoses.current.get(l.id);
        if (!poses) {
          poses = starts(comp, l.id);
          startPoses.current.set(l.id, poses);
        }
        const elapsed = t - l.born;
        let allOut = l.dying !== null;
        comp.pieces.forEach((p, i) => {
          const el = els.current.get(`${l.id}:${i}`);
          if (!el) return;
          const from = poses![i];
          const arrive = easeOut(clamp01((elapsed - i * l.stagger) / l.flight));
          const since = Math.max(0, elapsed - i * l.stagger - l.flight);
          const rest = idlePose(p, defaultIdle(p, i), since);
          const q: Pose = {
            x: from.x + (rest.x - from.x) * arrive,
            y: from.y + (rest.y - from.y) * arrive,
            r: from.r + (rest.r - from.r) * arrive,
            s: from.s + (rest.s - from.s) * arrive,
            sx: 1,
          };
          let opacity = elapsed < 0 ? 0 : 1;
          if (l.dying !== null) {
            // Scatter: straight out from the middle of the box, shrinking and fading.
            const k = easeIn(clamp01((t - l.dying) / mp.scatter));
            const dx = q.x - comp.w / 2;
            const dy = q.y - comp.h / 2;
            const d = Math.hypot(dx, dy) || 1;
            const far = Math.max(comp.w, comp.h) * 0.6;
            q.x += (dx / d) * far * k;
            q.y += (dy / d) * far * k;
            q.r += (i % 2 ? -90 : 90) * k;
            q.s *= 1 - 0.4 * k;
            opacity *= 1 - k;
            if (k < 1) allOut = false;
          }
          // G2: spring away from the pointer once in place.
          const key = `${l.id}:${i}`;
          const o = offsets.get(key) ?? { x: 0, y: 0, vx: 0, vy: 0 };
          let tx = 0;
          let ty = 0;
          if (pointer.on && arrive >= 1 && l.dying === null) {
            const dx = q.x - pointer.x;
            const dy = q.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < reach && d > 0.01) {
              const amount = (1 - d / reach) * maxPush;
              tx = (dx / d) * amount;
              ty = (dy / d) * amount;
            }
          }
          o.vx += ((spring.stiffness * (tx - o.x) - spring.damping * o.vx) / spring.mass) * dt;
          o.vy += ((spring.stiffness * (ty - o.y) - spring.damping * o.vy) / spring.mass) * dt;
          o.x += o.vx * dt;
          o.y += o.vy * dt;
          offsets.set(key, o);
          q.x += o.x;
          q.y += o.y;
          el.setAttribute("transform", transform(q));
          el.style.opacity = String(opacity);
        });
        if (allOut) gone.push(l.id);
      }
      if (gone.length) {
        gone.forEach((id) => startPoses.current.delete(id));
        setLayers((list) => list.filter((l) => !gone.includes(l.id)));
      }
    };
    frame.update(tick, true);
    return () => {
      cancelFrame(tick);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, fine]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${comp0.w} ${comp0.h}`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 block h-full w-full overflow-hidden"
    >
      {layers.map((l) => (
        <LayerShapes key={l.id} layer={l} register={register} still={reduced} />
      ))}
    </svg>
  );
}
