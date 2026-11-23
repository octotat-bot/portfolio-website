"use client";

// About 4: what i work with. A 100dvh burgundy dither field (M08). The
// heading top-left; below it the skill words drop from the top one after
// another, bounce and pile up at the bottom (M18). Words are poster-3, so the
// settled pile fills about the lower 40% of the section on desktop. With a mouse they can be
// dragged and thrown; on touch screens they cannot, so a finger scrolls the
// page. On desktop, the four stack lines sit under the pile.
//
// Started from React Bits "Falling Text" (reactbits.dev, MIT + Commons
// Clause), whose only dependency is Matter.js: its measured DOM words as
// physics bodies, staggered release, walls and pointer drag are kept. Its own
// requestAnimationFrame loop is replaced by Motion's frame loop, Matter.js is
// imported only when the section comes into view, the simulation pauses off
// screen, and its tiles, themes, restore animation and gradients are removed.
// With reduced motion the words are a still, wrapped list.

import { cancelFrame, frame, type FrameData } from "motion/react";
import type MatterNS from "matter-js";
import { useEffect, useRef } from "react";
import { DitherField } from "@/components/motion/dither-field";
import { RevealText } from "@/components/motion/reveal-text";
import { about } from "@/content/about";
import { useReduced } from "@/lib/hooks";
import { skillPile } from "@/lib/motion";

type Matter = typeof MatterNS;
type Piece = { el: HTMLElement; body: MatterNS.Body; w: number; h: number; at: number; released: boolean };

const WALL = 400;

function usePile(area: React.RefObject<HTMLDivElement | null>, list: React.RefObject<HTMLUListElement | null>, reduced: boolean) {
  useEffect(() => {
    const container = area.current;
    const block = list.current;
    if (!container || !block || reduced) return;

    let Matter: Matter | null = null;
    let engine: MatterNS.Engine | null = null;
    let pieces: Piece[] = [];
    let walls: MatterNS.Body[] = [];
    let drag: { constraint: MatterNS.Constraint; id: number } | null = null;
    let running = false;
    let visible = false;
    let started = false;
    let clock = 0;
    let accumulator = 0;
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0 };

    const local = (event: PointerEvent) => {
      const box = container.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };

    const placeWalls = () => {
      if (!Matter || !engine) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const [floor, left, right, ceiling] = walls;
      Matter.Body.setPosition(floor, { x: w / 2, y: h + WALL / 2 });
      Matter.Body.setPosition(left, { x: -WALL / 2, y: h / 2 });
      Matter.Body.setPosition(right, { x: w + WALL / 2, y: h / 2 });
      Matter.Body.setPosition(ceiling, { x: w / 2, y: -WALL / 2 });
      pieces.forEach((p) => Matter?.Sleeping.set(p.body, false));
    };

    const draw = () => {
      for (const p of pieces) {
        const { x, y } = p.body.position;
        p.el.style.transform = `translate3d(${(x - p.w / 2).toFixed(2)}px, ${(y - p.h / 2).toFixed(2)}px, 0) rotate(${p.body.angle.toFixed(4)}rad)`;
      }
    };

    // One step per Motion frame: fixed physics steps, then draw.
    const tick = ({ delta }: FrameData) => {
      if (!Matter || !engine) return;
      const dt = Math.min(50, delta);
      clock += dt / 1000;
      for (const p of pieces) {
        if (!p.released && clock >= p.at) {
          p.released = true;
          Matter.Body.setStatic(p.body, false);
          Matter.Body.setVelocity(p.body, { x: (Math.random() - 0.5) * 3, y: 0 });
          Matter.Body.setAngularVelocity(p.body, (Math.random() - 0.5) * 0.06);
        }
      }
      accumulator += dt;
      while (accumulator >= skillPile.step) {
        Matter.Engine.update(engine, skillPile.step);
        accumulator -= skillPile.step;
      }
      draw();
    };

    const run = () => {
      if (running || !engine || !visible) return;
      running = true;
      container.dataset.running = "";
      frame.update(tick, true);
    };
    const pause = () => {
      if (!running) return;
      running = false;
      delete container.dataset.running;
      cancelFrame(tick);
    };

    const start = async () => {
      if (started) return;
      started = true;
      const mod = await import("matter-js");
      Matter = (mod.default ?? mod) as Matter;
      const elements = Array.from(block.querySelectorAll<HTMLElement>("[data-piece]"));
      const origin = container.getBoundingClientRect();
      const rects = elements.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
      });
      engine = Matter.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
      engine.gravity.y = skillPile.gravity;
      walls = [
        Matter.Bodies.rectangle(0, 0, 10000, WALL, { isStatic: true, friction: 0.8 }),
        Matter.Bodies.rectangle(0, 0, WALL, 10000, { isStatic: true, friction: 0.3 }),
        Matter.Bodies.rectangle(0, 0, WALL, 10000, { isStatic: true, friction: 0.3 }),
        Matter.Bodies.rectangle(0, 0, 10000, WALL, { isStatic: true, friction: 0.3 }),
      ];
      block.style.minHeight = `${block.offsetHeight}px`;
      pieces = elements.map((el, i) => {
        const r = rects[i];
        const body = Matter!.Bodies.rectangle(r.x + r.w / 2, r.y + r.h / 2, Math.max(2, r.w - 1), Math.max(2, r.h - 1), {
          restitution: skillPile.bounciness,
          friction: 0.4,
          frictionStatic: 0.8,
          frictionAir: 0.012,
          density: 0.0015,
        });
        Matter!.Body.setStatic(body, true);
        el.style.position = "absolute";
        el.style.left = "0";
        el.style.top = "0";
        el.style.margin = "0";
        el.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
        return { el, body, w: r.w, h: r.h, at: i * skillPile.stagger, released: false };
      });
      Matter.Composite.add(engine.world, [...walls, ...pieces.map((p) => p.body)]);
      placeWalls();
      container.dataset.phase = "falling";
      run();
    };

    // Mouse only: drag and throw, and a fast pointer pushes words aside.
    const onDown = (event: PointerEvent) => {
      if (!Matter || !engine || event.pointerType !== "mouse" || event.button !== 0) return;
      const point = local(event);
      const hit = Matter.Query.point(pieces.filter((p) => p.released).map((p) => p.body), point)[0];
      if (!hit) return;
      event.preventDefault();
      container.setPointerCapture?.(event.pointerId);
      Matter.Sleeping.set(hit, false);
      const constraint = Matter.Constraint.create({
        pointA: point,
        bodyB: hit,
        pointB: { x: point.x - hit.position.x, y: point.y - hit.position.y },
        stiffness: 0.2,
        damping: 0.08,
        length: 0,
      });
      Matter.Composite.add(engine.world, constraint);
      drag = { constraint, id: event.pointerId };
      container.dataset.dragging = "";
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !Matter || !engine) return;
      const point = local(event);
      const now = performance.now();
      const dt = Math.max(1, now - pointer.time);
      if (pointer.time && dt < 120) {
        const blend = Math.min(1, dt / 40);
        pointer.vx += ((point.x - pointer.x) / dt - pointer.vx) * blend;
        pointer.vy += ((point.y - pointer.y) / dt - pointer.vy) * blend;
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.time = now;
      if (drag && event.pointerId === drag.id) {
        drag.constraint.pointA = point;
        return;
      }
      const speed = Math.hypot(pointer.vx, pointer.vy);
      if (speed < 0.35) return;
      for (const p of pieces) {
        if (!p.released) continue;
        const reach = Math.max(p.w, p.h) / 2 + 18;
        const distance = Math.hypot(p.body.position.x - point.x, p.body.position.y - point.y);
        if (distance > reach) continue;
        const kick = Math.min(20, speed * skillPile.push * (1 - (distance / reach) ** 2) * 16);
        Matter.Sleeping.set(p.body, false);
        Matter.Body.setVelocity(p.body, {
          x: p.body.velocity.x + (pointer.vx / speed) * kick,
          y: p.body.velocity.y + (pointer.vy / speed) * kick - kick * 0.7,
        });
      }
    };
    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (Matter && engine) Matter.Composite.remove(engine.world, drag.constraint);
      drag = null;
      delete container.dataset.dragging;
    };

    // Start once it is well in view; run only while it is on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (entry.intersectionRatio >= skillPile.startAt) void start();
        if (visible) run();
        else pause();
      },
      { threshold: [0, skillPile.startAt] },
    );
    observer.observe(container);
    const resize = new ResizeObserver(placeWalls);
    resize.observe(container);
    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);
    container.addEventListener("pointercancel", onUp);

    return () => {
      observer.disconnect();
      resize.disconnect();
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      pause();
      if (Matter && engine) {
        Matter.Composite.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      for (const p of pieces) {
        p.el.style.position = "";
        p.el.style.left = "";
        p.el.style.top = "";
        p.el.style.margin = "";
        p.el.style.transform = "";
      }
      block.style.minHeight = "";
      delete container.dataset.phase;
    };
  }, [area, list, reduced]);
}

export function SkillPile() {
  const area = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const reduced = useReduced();
  const { heading, words, groups, separator } = about.skills;
  usePile(area, list, reduced);

  return (
    <DitherField className="flex min-h-dvh flex-col gap-6 px-4 pb-10 pt-32 md:px-10">
      <RevealText as="h2" text={heading} className="poster-4 text-ivory" />
      <div ref={area} className="skill-area relative min-h-0 flex-1 select-none">
        <ul ref={list} className="flex flex-wrap gap-x-6 gap-y-1">
          {words.map((word) => (
            <li key={word} data-piece className="poster-3 skill-word whitespace-nowrap text-ivory">
              {word}
            </li>
          ))}
        </ul>
      </div>
      <dl data-hide-pill className="hidden grid-cols-4 gap-6 pt-4 md:grid">
        {groups.map((g) => (
          <div key={g.label} className="flex flex-col gap-1">
            <dt className="label text-ivory">{g.label}</dt>
            <dd className="body text-ivory">{g.items.join(separator)}</dd>
          </div>
        ))}
      </dl>
    </DitherField>
  );
}
