"use client";

// A poster-shape composition (DESIGN.md "Shapes", MOTION.md G1 to G3).
//
//   G1 assemble: once the box is well in view (and no intro or wipe covers
//      the page), each shape flies in from outside the box to its place,
//      staggered, ease-out. It plays once.
//   G2 pointer push (optional, desktop with a fine pointer): once assembled,
//      shapes within 240px of the pointer spring away up to 110px.
//   G3 idle: stars spin, half discs rock, small discs bob, large discs
//      breathe, plus the project loops (ring fill, line scan, orbit, step).
//   `fall`: on the 404 page the shapes fall out of the box a second after
//      they have assembled.
//
// The SVG is clipped to its own box, so no shape reaches text or pictures,
// and it fades in the nav zone like tiles and pictures do.
// Only a composition on screen runs its frame loop (Motion's frame loop, no
// second engine). Every change is a transform or an opacity.
// Reduced motion: the finished composition, still. The server renders that
// finished state; until the script takes over it is hidden unless reduced
// motion is set, so nothing jumps.

import { cancelFrame, cubicBezier, frame, type FrameData } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { useStageClear } from "@/lib/curtain";
import { NavFade } from "./nav-fade";
import { HOVER_QUERY, MD_QUERY, useMedia, useReduced } from "@/lib/hooks";
import { ease, shapes as cfg, spring } from "@/lib/motion";
import {
  arcPath,
  defaultIdle,
  halfPath,
  quarterPath,
  roleColour,
  starPoints,
  triPoints,
  type Composition,
  type Idle,
  type Piece,
  type Surface,
} from "@/lib/shapes";

const easeOut = cubicBezier(...ease.out);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Pose = { x: number; y: number; r: number; s: number; sx: number };

/** A stable pseudo-random sequence per composition, so start poses do not change between renders. */
function seeded(seed: string) {
  let n = Array.from(seed).reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 7);
  return () => (n = (n * 9301 + 49297) % 233280) / 233280;
}

function Shape({ p, fillColour }: { p: Piece; fillColour: string }) {
  const r = p.r ?? 0;
  switch (p.k) {
    case "disc":
      return <circle r={r} fill={fillColour} />;
    case "ring":
      if (p.fill) {
        const n = p.fill.segments;
        const gap = 0.012;
        return (
          <g data-segments="">
            {Array.from({ length: n }, (_, i) => (
              <path
                key={i}
                d={arcPath(r, (i / n) * Math.PI * 2 + gap, ((i + 1) / n) * Math.PI * 2 - gap)}
                fill="none"
                stroke={fillColour}
                strokeWidth={p.sw}
              />
            ))}
          </g>
        );
      }
      return <circle r={r} fill="none" stroke={fillColour} strokeWidth={p.sw} />;
    case "half":
      return <path d={halfPath(r)} fill={fillColour} />;
    case "quarter":
      return <path d={quarterPath(r)} fill={fillColour} />;
    case "star":
      return <polygon points={starPoints(r)} fill={fillColour} />;
    case "bar":
      // A scanning bar is anchored at its left edge so it can grow to the right.
      return p.scan ? (
        <rect x={0} y={-(p.h ?? 0) / 2} width={1} height={p.h} fill={fillColour} />
      ) : (
        <rect x={-(p.w ?? 0) / 2} y={-(p.h ?? 0) / 2} width={p.w} height={p.h} fill={fillColour} />
      );
    case "tri":
      return <polygon points={triPoints(r)} fill={fillColour} />;
    case "square":
      return <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={fillColour} />;
  }
}

const transform = (q: Pose) =>
  `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${q.r.toFixed(2)}) scale(${(q.s * q.sx).toFixed(3)} ${q.s.toFixed(3)})`;

/** Where a piece rests (assembled) with its idle applied at time t (seconds since assembly). */
function idlePose(p: Piece, idle: Idle, t: number): Pose {
  const q: Pose = { x: p.x, y: p.y, r: p.rot ?? 0, s: 1, sx: 1 };
  switch (idle.t) {
    case "spin":
      q.r += idle.v * t;
      break;
    case "rock":
      q.r += Math.sin(t * idle.sp + (idle.ph ?? 0)) * idle.a;
      break;
    case "bob":
      q.y += Math.sin(t * idle.sp + (idle.ph ?? 0)) * idle.a;
      break;
    case "breathe":
      q.s *= 1 + Math.sin(t * idle.sp) * idle.a;
      break;
    case "orbit":
      q.x += Math.cos(t * idle.sp + idle.ph) * idle.rad;
      q.y += Math.sin(t * idle.sp + idle.ph) * idle.rad;
      break;
    case "step": {
      // Rise over the first third, hold, drop back at the end of each cycle.
      const k = (t * idle.sp + idle.ph) % 1;
      q.y += -Math.min(1, k * 3) * idle.h + (k > 0.9 ? ((k - 0.9) / 0.1) * idle.h : 0);
      break;
    }
  }
  return q;
}

/** The scanning bar's row and width at time t; `still` gives a fixed frame. */
function scanPose(p: Piece, t: number, still: boolean): Pose {
  const scan = p.scan!;
  const rows = scan.rows;
  if (still) return { x: scan.x0, y: rows[2 % rows.length].y, r: 0, s: 1, sx: rows[2 % rows.length].w };
  const cycle = t / scan.perRow;
  const row = rows[Math.floor(cycle) % rows.length];
  const k = cycle % 1;
  return { x: scan.x0, y: row.y, r: 0, s: 1, sx: row.w * easeOut(clamp01(k / 0.6)) };
}

type Props = {
  comp: Composition;
  surface?: Surface;
  /** G2 pointer push (desktop, fine pointer). */
  push?: boolean;
  /** 404: fall out of the box after assembling. */
  fall?: boolean;
  className?: string;
};

export function ShapeComposition({ comp, surface = "midnight", push = false, fall = false, className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const reduced = useReduced();
  const clear = useStageClear();
  const desktop = useMedia(MD_QUERY);
  const fine = useMedia(HOVER_QUERY);
  const pushOn = push && desktop && fine && !reduced;

  // Start poses: outside the box, turned and small.
  const starts = useMemo(() => {
    const rand = seeded(comp.id);
    const far = Math.max(comp.w, comp.h);
    return comp.pieces.map((p) => {
      const a = rand() * Math.PI * 2;
      const d = far * (0.75 + rand() * 0.5);
      return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, r: (rand() - 0.5) * 360, s: 0.3, sx: 1 };
    });
  }, [comp]);
  const idles = useMemo(() => comp.pieces.map((p, i) => defaultIdle(p, i)), [comp]);
  const finals = useMemo(
    () => comp.pieces.map((p, i) => (p.scan ? scanPose(p, 0, true) : idlePose(p, { t: "none" }, 0))),
    [comp],
  );

  // Show the finished, still composition with reduced motion.
  useEffect(() => {
    if (!reduced) return;
    groups.current.forEach((g, i) => g?.setAttribute("transform", transform(finals[i])));
    paintSegments(svgRef.current, comp, 0, true);
    svgRef.current?.removeAttribute("data-pending");
  }, [reduced, finals, comp]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduced) return;
    // Take over: park every shape outside the box, then reveal the SVG.
    groups.current.forEach((g, i) => g?.setAttribute("transform", transform(starts[i])));
    svg.removeAttribute("data-pending");

    let visible = false;
    let running = false;
    let startedAt: number | null = null;
    let fallDone = false;
    const off = comp.pieces.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const pointer = { on: false, x: 0, y: 0 };

    const tick = ({ timestamp, delta }: FrameData) => {
      if (startedAt === null) return;
      const now = timestamp / 1000;
      const dt = Math.min(delta, 50) / 1000;
      const elapsed = now - startedAt;
      const assembledAt = (comp.pieces.length - 1) * cfg.stagger + cfg.flight;
      const fallAt = assembledAt + cfg.holdBeforeFall;

      // Pointer push target per shape, in viewBox units.
      const ctm = pushOn ? svg.getScreenCTM() : null;
      const unit = ctm ? 1 / ctm.a : 1;
      const reach = cfg.reach * unit;
      const maxPush = cfg.push * unit;

      let allGone = true;
      comp.pieces.forEach((p, i) => {
        const g = groups.current[i];
        if (!g) return;
        const t = easeOut(clamp01((elapsed - i * cfg.stagger) / cfg.flight));
        const since = Math.max(0, elapsed - i * cfg.stagger - cfg.flight);
        const rest = p.scan ? scanPose(p, since, false) : idlePose(p, idles[i], since);
        const from = starts[i];
        const q: Pose = {
          x: from.x + (rest.x - from.x) * t,
          y: from.y + (rest.y - from.y) * t,
          r: from.r + (rest.r - from.r) * t,
          s: from.s + (rest.s - from.s) * t,
          sx: p.scan ? rest.sx * t : 1,
        };

        // 404: fall out of the bottom of the box.
        if (fall && elapsed > fallAt) {
          const tau = Math.max(0, elapsed - fallAt - i * cfg.fallStagger);
          q.y += 0.5 * cfg.gravity * tau * tau;
          q.r += tau * (i % 2 ? -140 : 160);
          if (q.y - 400 < comp.h) allGone = false;
        } else {
          allGone = false;
        }

        // G2: spring toward the push target.
        const o = off[i];
        let tx = 0;
        let ty = 0;
        if (pointer.on && t >= 1) {
          const dx = q.x - pointer.x;
          const dy = q.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < reach && d > 0.01) {
            const amount = (1 - d / reach) * maxPush;
            tx = (dx / d) * amount;
            ty = (dy / d) * amount;
          }
        }
        if (pushOn) {
          o.vx += ((spring.stiffness * (tx - o.x) - spring.damping * o.vx) / spring.mass) * dt;
          o.vy += ((spring.stiffness * (ty - o.y) - spring.damping * o.vy) / spring.mass) * dt;
          o.x += o.vx * dt;
          o.y += o.vy * dt;
        }
        q.x += o.x;
        q.y += o.y;
        g.setAttribute("transform", transform(q));
      });
      paintSegments(svg, comp, Math.max(0, elapsed - cfg.flight), false, clamp01((elapsed - assembledAt) / 0.6));
      if (fall && allGone && !fallDone) {
        fallDone = true;
        stop();
      }
    };

    const run = () => {
      if (running || !visible || startedAt === null || fallDone) return;
      running = true;
      frame.update(tick, true);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && startedAt === null && entry.intersectionRatio >= cfg.startAt && clearRef.current) {
          startedAt = performance.now() / 1000;
        }
        if (visible) run();
        else stop();
      },
      { threshold: [0, cfg.startAt, 1] },
    );
    observer.observe(svg);
    startRef.current = () => {
      if (startedAt !== null) return;
      const r = svg.getBoundingClientRect();
      const shown = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / Math.max(1, r.height);
      if (shown >= cfg.startAt) {
        startedAt = performance.now() / 1000;
        visible = true;
        run();
      }
    };
    startRef.current();

    const onMove = (e: PointerEvent) => {
      if (!pushOn) return;
      const m = svg.getScreenCTM();
      if (!m) return;
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      const inside = pt.x > -cfg.reach && pt.y > -cfg.reach && pt.x < comp.w + cfg.reach && pt.y < comp.h + cfg.reach;
      pointer.on = inside;
      pointer.x = pt.x;
      pointer.y = pt.y;
    };
    const onLeave = () => (pointer.on = false);
    if (pushOn) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      observer.disconnect();
      stop();
      startRef.current = null;
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, pushOn, comp, fall]);

  // Assembly waits for the intro and the wipe to clear.
  const clearRef = useRef(clear);
  const startRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    clearRef.current = clear;
    if (clear) startRef.current?.();
  }, [clear]);

  return (
    <NavFade className="h-full">
    <svg
      ref={svgRef}
      viewBox={`0 0 ${comp.w} ${comp.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-pending=""
      data-composition={comp.id}
      className={`shape-composition block h-full w-full overflow-hidden ${className}`}
    >
      {comp.pieces.map((p, i) => (
        <g
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
          transform={transform(finals[i])}
        >
          <Shape p={p} fillColour={roleColour(p.c, surface)} />
        </g>
      ))}
    </svg>
    </NavFade>
  );
}

/**
 * Repetite's rings: segments light up in order to show how full each ring is.
 * Opacity only. `t` is seconds since assembly; `appear` fades the loop in.
 */
function paintSegments(svg: SVGSVGElement | null, comp: Composition, t: number, still: boolean, appear = 1) {
  if (!svg) return;
  const rings = svg.querySelectorAll<SVGGElement>("[data-segments]");
  if (rings.length === 0) return;
  let k = 0;
  comp.pieces.forEach((p) => {
    if (!p.fill) return;
    const ring = rings[k++];
    if (!ring) return;
    const full = still ? 0.7 : (0.5 + 0.45 * Math.sin(t * 0.9 + p.fill.ph)) * appear;
    const lit = Math.round(full * p.fill.segments);
    Array.from(ring.children).forEach((seg, i) => {
      (seg as SVGElement).style.opacity = i < lit ? "1" : "0";
    });
  });
}
